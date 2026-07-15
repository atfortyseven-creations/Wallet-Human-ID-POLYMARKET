use aztec::macros::aztec;

#[aztec]
pub contract PrivateAccount {
    use aztec::macros::{functions::{external, initializer}, storage::storage};
    use aztec::protocol::{address::AztecAddress, traits::{Deserialize, Serialize, ToField}};
    use aztec::state_vars::{Map, PublicMutable};

    #[storage]
    struct Storage<Context> {
        // dummy storage to satisfy the macro
        admin: PublicMutable<AztecAddress, Context>,
    }

    #[external("public")]
    #[initializer]
    fn constructor(admin: AztecAddress) {
        self.storage.admin.write(admin);
    }

    #[external("private")]
    fn entrypoint(payload: Field, fee_payload: Field) {
        // Dummy entrypoint
        assert(payload != 0, "payload must be non-zero");
    }

    #[external("private")]
    fn verify_private_authwit(inner_hash: Field) -> Field {
        assert(inner_hash != 0, "inner_hash must be non-zero");
        1
    }
}
