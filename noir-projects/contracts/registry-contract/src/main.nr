use aztec::macros::aztec;

#[aztec]
pub contract ProvenanceRegistry {
    use aztec::macros::{functions::{external, view}, storage::storage};
    use aztec::protocol::{address::AztecAddress, traits::{Deserialize, Serialize, ToField}};
    use aztec::state_vars::{Map, PublicMutable};

    #[storage]
    struct Storage<Context> {
        issuer: Map<Field, PublicMutable<AztecAddress, Context>, Context>,
        confirmed_at: Map<Field, PublicMutable<u32, Context>, Context>,
        is_revoked: Map<Field, PublicMutable<bool, Context>, Context>,
    }

    #[external("public")]
    fn register_product(
        slug_hash: Field,
        _batch_id_hash: Field,
        _supplier_hash: Field,
        _metadata_hash: Field,
    ) {
        let issuer = self.msg_sender();
        self.storage.issuer.at(slug_hash).write(issuer);
        self.storage.confirmed_at.at(slug_hash).write(self.context.block_number());
        self.storage.is_revoked.at(slug_hash).write(false);
    }

    #[external("public")]
    #[view]
    fn verify_product(slug_hash: Field) -> Field {
        let issuer: AztecAddress = self.storage.issuer.at(slug_hash).read();
        let is_revoked: bool = self.storage.is_revoked.at(slug_hash).read();
        
        let exists = issuer.to_field() != 0;
        if exists & !is_revoked {
            1
        } else {
            0
        }
    }

    #[external("public")]
    fn revoke_product(slug_hash: Field) {
        let issuer: AztecAddress = self.storage.issuer.at(slug_hash).read();
        assert(issuer.eq(self.msg_sender()), "Only issuer can revoke");
        self.storage.is_revoked.at(slug_hash).write(true);
    }
}
