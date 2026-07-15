use aztec::macros::aztec;

#[aztec]
pub contract NativePaymaster {
    use aztec::macros::{functions::external, storage::storage};
    use aztec::protocol::{address::AztecAddress, traits::{Deserialize, Serialize, ToField}};
    use aztec::state_vars::{Map, PublicMutable};

    #[storage]
    struct Storage<Context> {
        // Dummy storage to satisfy compiler if needed
        admin: PublicMutable<AztecAddress, Context>,
    }

    #[external("public")]
    fn sponsor_transaction(_user_address: Field, _tx_fee_limit: Field) {
    }

    #[external("private")]
    fn private_sponsor_execution(_authwit_hash: Field) {
    }
}
