contract ProvenanceRegistry {
    use dep::aztec::prelude::{
        AztecAddress,
        Map,
        PublicMutable,
    };

    struct PublicProductRecord {
        slug_hash: Field,
        issuer: AztecAddress,
        confirmed_at: u64,
        is_revoked: bool,
    }

    #[aztec::storage]
    struct Storage {
        public_records: Map<Field, PublicMutable<PublicProductRecord>>,
    }

    #[aztec::public]
    fn register_product(
        slug_hash: Field,
        batch_id_hash: Field,
        supplier_hash: Field,
        metadata_hash: Field,
    ) {
        let issuer = context.msg_sender();
        let record = PublicProductRecord {
            slug_hash,
            issuer,
            confirmed_at: context.timestamp(),
            is_revoked: false,
        };
        storage.public_records.at(slug_hash).write(record);
    }

    #[aztec::public]
    #[aztec::view]
    fn verify_product(slug_hash: Field) -> bool {
        let record = storage.public_records.at(slug_hash).read();
        let exists = !record.issuer.is_zero();
        exists & !record.is_revoked
    }

    #[aztec::public]
    #[aztec::view]
    fn get_public_record(slug_hash: Field) -> PublicProductRecord {
        storage.public_records.at(slug_hash).read()
    }

    #[aztec::public]
    fn revoke_product(slug_hash: Field) {
        let record = storage.public_records.at(slug_hash).read();
        assert(record.issuer == context.msg_sender(), "Only issuer can revoke");
        
        let revoked = PublicProductRecord {
            slug_hash: record.slug_hash,
            issuer: record.issuer,
            confirmed_at: record.confirmed_at,
            is_revoked: true,
        };
        storage.public_records.at(slug_hash).write(revoked);
    }
}
