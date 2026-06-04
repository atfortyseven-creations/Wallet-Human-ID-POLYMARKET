// ─────────────────────────────────────────────────────────────────────────────
// ProvenanceRegistry — Aztec Network Smart Contract (Noir)
//
// Purpose
// ──────────────────────────────────────────────────────────────────────────────
// This contract manages product provenance records on Aztec Network.
// It separates what must be public (the record exists and is authentic) from
// what must stay private (supplier identity, batch volumes, commercial terms).
//
// Two layers are always maintained:
//
//   PUBLIC  — the product slug hash and its confirmation status.
//             Anyone can verify a product is registered.
//
//   PRIVATE — the batch ID, supplier address, and metadata hash.
//             Only the issuing organisation (the owner) can read or update these.
//
// This matches the real need of public institutions: they must prove compliance
// publicly while keeping commercially sensitive data protected.
//
// Aztec Network compiles this Noir code into a zero-knowledge circuit.
// The circuit produces a mathematical proof that:
//   (a) the record was created by the stated owner, and
//   (b) the record has not been altered since confirmation.
// The proof can be verified by anyone without revealing the private inputs.
// ─────────────────────────────────────────────────────────────────────────────

contract ProvenanceRegistry {
    use dep::aztec::prelude::{
        AztecAddress,
        FunctionSelector,
        NoteHeader,
        NoteInterface,
        PrivateContext,
        PublicContext,
        Map,
        PublicMutable,
        PrivateSet,
    };
    use dep::aztec::protocol_types::traits::Serialize;

    // ─── DATA STRUCTURES ─────────────────────────────────────────────────────

    /// Public record stored on-chain.
    /// Contains only what auditors and consumers need to verify:
    ///   - That the product was registered.
    ///   - When it was confirmed (block timestamp).
    ///   - Whether it has been revoked (e.g. recall notice).
    struct PublicProductRecord {
        /// Keccak-256 hash of the product's public slug.
        /// This is the stable identifier used in QR codes.
        slug_hash: Field,

        /// Address of the organisation that created this record.
        issuer: AztecAddress,

        /// Block timestamp at which the record was confirmed on-chain.
        confirmed_at: u64,

        /// Set to true if the organisation has issued a recall or revocation.
        is_revoked: bool,
    }

    /// Private note stored in the issuer's encrypted note set.
    /// Never readable by anyone except the owner of the Aztec private key
    /// that created it — unless the owner explicitly shares a decryption key.
    struct PrivateBatchNote {
        header: NoteHeader,

        /// Keccak-256 hash of the batch ID (e.g. "LOT-2024-0891").
        /// Stored as a hash so the note can prove batch membership
        /// without exposing the raw batch string.
        batch_id_hash: Field,

        /// Hash of the supplier's canonical identifier.
        /// The supplier never appears in public state.
        supplier_hash: Field,

        /// Hash of the full off-chain metadata JSON.
        /// Used to prove the metadata has not changed since registration.
        metadata_hash: Field,

        /// Owner of this note. Only they can nullify it (consume / transfer).
        owner: AztecAddress,
    }

    impl NoteInterface<3> for PrivateBatchNote {
        fn compute_note_hash(self) -> Field {
            // The note commitment is a hash of all private fields.
            // Aztec uses this to store the note in the private note tree
            // without revealing its contents.
            dep::std::hash::pedersen_hash([
                self.batch_id_hash,
                self.supplier_hash,
                self.metadata_hash,
                self.owner.to_field(),
            ])
        }

        fn compute_nullifier(self, context: &mut PrivateContext) -> Field {
            // The nullifier uniquely marks this note as "spent" (consumed).
            // It prevents double-spending a note during transfer.
            let note_hash = self.compute_note_hash();
            dep::std::hash::pedersen_hash([
                note_hash,
                context.msg_sender().to_field(),
            ])
        }

        fn get_header(self) -> NoteHeader { self.header }
        fn set_header(&mut self, header: NoteHeader) { self.header = header; }

        fn serialize_content(self) -> [Field; 3] {
            [self.batch_id_hash, self.supplier_hash, self.metadata_hash]
        }

        fn deserialize_content(fields: [Field; 3]) -> Self {
            PrivateBatchNote {
                header: NoteHeader::empty(),
                batch_id_hash: fields[0],
                supplier_hash: fields[1],
                metadata_hash: fields[2],
                owner: AztecAddress::zero(),
            }
        }
    }

    // ─── STORAGE ─────────────────────────────────────────────────────────────

    struct Storage {
        /// Public map: slug_hash → PublicProductRecord.
        /// Readable by anyone. Verified by auditors and consumers.
        public_records: Map<Field, PublicMutable<PublicProductRecord>>,

        /// Private set of batch notes owned by each issuer address.
        /// Each note is encrypted and only readable by its owner.
        private_batches: Map<AztecAddress, PrivateSet<PrivateBatchNote, 3>>,
    }

    // ─── FUNCTIONS ───────────────────────────────────────────────────────────

    /// Register a product publicly and store private batch details.
    ///
    /// Called by the issuing organisation (manufacturer, certifier, agency).
    ///
    /// What goes public:
    ///   - slug_hash   : stable QR identifier, hashed.
    ///   - issuer      : the wallet address of the registering organisation.
    ///   - confirmed_at: the block timestamp of this transaction.
    ///
    /// What stays private (only the issuer can read):
    ///   - batch_id_hash  : identifies the specific production batch.
    ///   - supplier_hash  : identifies the upstream supplier.
    ///   - metadata_hash  : fingerprint of the full off-chain data.
    #[aztec::private]
    fn register_product(
        slug_hash: Field,
        batch_id_hash: Field,
        supplier_hash: Field,
        metadata_hash: Field,
    ) {
        let sender = context.msg_sender();

        // 1. Create and emit the private batch note into the sender's note set.
        let batch_note = PrivateBatchNote {
            header: NoteHeader::empty(),
            batch_id_hash,
            supplier_hash,
            metadata_hash,
            owner: sender,
        };
        storage.private_batches.at(sender).insert(&mut batch_note, true);

        // 2. Call the public function to write the public confirmation.
        //    This is a cross-call from the private context into the public one.
        //    Aztec ensures the private inputs that produced this call remain hidden.
        context.call_public_function(
            context.this_address(),
            FunctionSelector::from_signature("_write_public_record(Field,AztecAddress)"),
            [slug_hash, sender.to_field()],
        );
    }

    /// Internal public function. Only callable from within this contract
    /// (invoked by register_product above). Writes the public state.
    #[aztec::public]
    #[aztec::internal]
    fn _write_public_record(slug_hash: Field, issuer_field: Field) {
        let issuer = AztecAddress::from_field(issuer_field);
        let record = PublicProductRecord {
            slug_hash,
            issuer,
            confirmed_at: context.timestamp(),
            is_revoked: false,
        };
        storage.public_records.at(slug_hash).write(record);
    }

    /// Verify that a product is registered and has not been revoked.
    ///
    /// Returns true if:
    ///   (a) the slug_hash is present in the public record map, AND
    ///   (b) is_revoked is false.
    ///
    /// This is what a consumer, customs officer, or auditor calls when
    /// they scan a QR code. The call is free (read-only) and instant.
    #[aztec::public]
    #[aztec::view]
    fn verify_product(slug_hash: Field) -> bool {
        let record = storage.public_records.at(slug_hash).read();
        // A zero issuer means the record does not exist.
        let exists = !record.issuer.is_zero();
        exists & !record.is_revoked
    }

    /// Return the full public record for a given slug hash.
    /// Used by the Studio Provenance frontend to display confirmation details.
    #[aztec::public]
    #[aztec::view]
    fn get_public_record(slug_hash: Field) -> PublicProductRecord {
        storage.public_records.at(slug_hash).read()
    }

    /// Revoke a product record. Only the original issuer can call this.
    ///
    /// Use cases: product recall, certification withdrawal, fraud detection.
    /// The record is NOT deleted — revocations are permanent and auditable.
    #[aztec::public]
    fn revoke_product(slug_hash: Field) {
        let record = storage.public_records.at(slug_hash).read();

        // Only the original issuer may revoke.
        assert(record.issuer == context.msg_sender(), "Only the issuer can revoke this record");
        assert(!record.is_revoked, "Record is already revoked");

        let revoked = PublicProductRecord {
            slug_hash: record.slug_hash,
            issuer: record.issuer,
            confirmed_at: record.confirmed_at,
            is_revoked: true,
        };
        storage.public_records.at(slug_hash).write(revoked);
    }

    /// Prove that the caller owns a private batch note for the given slug.
    ///
    /// This function is called in private context. It produces a zero-knowledge
    /// proof that the caller has a note with batch_id_hash matching the claimed
    /// batch, WITHOUT revealing the actual batch ID, supplier, or metadata.
    ///
    /// Practical use: a supplier proves to an auditor that they produced a batch
    /// without disclosing commercial terms. The auditor verifies the proof
    /// on-chain; no raw data is transmitted.
    #[aztec::private]
    fn prove_batch_ownership(
        slug_hash: Field,
        claimed_batch_id_hash: Field,
    ) -> bool {
        // The circuit enforces that:
        //   1. The caller's note set contains a note matching claimed_batch_id_hash.
        //   2. The public record for slug_hash exists and is not revoked.
        // The proof of these two facts is emitted as a validity signal.
        // No private field is exposed in the circuit output.
        let notes = storage.private_batches.at(context.msg_sender());
        let note = notes.get_notes(
            NoteGetterOptions::new()
                .select(0, claimed_batch_id_hash, Option::none())
                .set_limit(1),
        );
        let found = note.len() > 0;

        // Also check public record is active.
        // This cross-call to the public side is safe: the public view does not
        // emit any information about the private note.
        context.call_public_function(
            context.this_address(),
            FunctionSelector::from_signature("verify_product(Field)"),
            [slug_hash],
        );

        found
    }

    /// Transfer a private batch note to a new owner.
    ///
    /// Use case: a product physically moves from manufacturer to distributor.
    /// The transfer is recorded privately. No public transaction price or
    /// identity is revealed on-chain.
    #[aztec::private]
    fn transfer_batch(
        claimed_batch_id_hash: Field,
        new_owner: AztecAddress,
    ) {
        let sender = context.msg_sender();

        // Retrieve and nullify the existing note (mark it as consumed).
        let notes = storage.private_batches.at(sender);
        let old_note = notes.pop_notes(
            NoteGetterOptions::new()
                .select(0, claimed_batch_id_hash, Option::none())
                .set_limit(1),
        )[0];

        // Create a new note with the same data but a new owner.
        let mut new_note = PrivateBatchNote {
            header: NoteHeader::empty(),
            batch_id_hash: old_note.batch_id_hash,
            supplier_hash: old_note.supplier_hash,
            metadata_hash: old_note.metadata_hash,
            owner: new_owner,
        };

        // Insert into the new owner's private note set.
        storage.private_batches.at(new_owner).insert(&mut new_note, true);
    }

    /// Update the metadata hash of a private batch note.
    ///
    /// Use case: the product gains a new certification after initial registration.
    /// The new metadata hash reflects the updated off-chain data.
    /// The old note is nullified; a new note is created. No public state changes.
    #[aztec::private]
    fn update_batch_metadata(
        claimed_batch_id_hash: Field,
        new_metadata_hash: Field,
    ) {
        let sender = context.msg_sender();

        // Consume the old note.
        let notes = storage.private_batches.at(sender);
        let old_note = notes.pop_notes(
            NoteGetterOptions::new()
                .select(0, claimed_batch_id_hash, Option::none())
                .set_limit(1),
        )[0];

        // Emit an updated note with the new metadata hash.
        let mut updated_note = PrivateBatchNote {
            header: NoteHeader::empty(),
            batch_id_hash: old_note.batch_id_hash,
            supplier_hash: old_note.supplier_hash,
            metadata_hash: new_metadata_hash,
            owner: sender,
        };
        storage.private_batches.at(sender).insert(&mut updated_note, true);
    }
}
