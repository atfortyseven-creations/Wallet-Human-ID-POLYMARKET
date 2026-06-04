contract MintPrivateLicense {
    use dep::aztec::prelude::{
        AztecAddress, PrivateContext, Map, PublicMutable, PrivateSet
    };
    use dep::value_note::note::{ValueNote, VALUE_NOTE_LEN};

    #[aztec(storage)]
    struct Storage {
        // Maps user to their privately-held license notes
        // Each ValueNote represents a license token with an encoded license_type
        licenses: Map<AztecAddress, PrivateSet<ValueNote>>,
        // Public counter for total licenses issued (for auditing without deanonymization)
        total_issued: PublicMutable<Field>,
    }

    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor() {}

    /// Privately mints a license token to a user.
    /// license_type_id is an agreed-upon integer (e.g. 1=Basic, 2=Pro, 3=Enterprise).
    /// The license is stored as a private note — third parties cannot determine
    /// whether a wallet holds a license without the holder's explicit disclosure.
    #[aztec(private)]
    fn mint_license(recipient: AztecAddress, license_type_id: Field) {
        let mut note = ValueNote::new(license_type_id, recipient);
        storage.licenses.at(recipient).insert(&mut note, true);

        MintPrivateLicense::at(context.this_address())
            .increment_issued_count()
            .enqueue(&mut context);
    }

    /// Allows a license holder to privately prove they hold a license
    /// by nullifying the note and immediately re-minting it (spend & re-issue pattern).
    /// This produces a nullifier on-chain as proof of ownership without revealing contents.
    #[aztec(private)]
    fn prove_and_refresh_license(holder: AztecAddress, license_type_id: Field) {
        dep::value_note::utils::decrement(
            storage.licenses.at(holder),
            license_type_id,
            holder
        );
        let mut refreshed = ValueNote::new(license_type_id, holder);
        storage.licenses.at(holder).insert(&mut refreshed, true);
    }

    #[aztec(public)]
    #[aztec(internal)]
    fn increment_issued_count() {
        let current = storage.total_issued.read();
        storage.total_issued.write(current + 1);
    }
}
