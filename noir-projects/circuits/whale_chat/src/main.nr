use aztec::macros::aztec;

#[aztec]
pub contract WhaleChat {
    use aztec::{
        macros::{
            functions::{external, initializer, view},
            storage::storage,
        },
        protocol::address::AztecAddress,
        state_vars::{Map, PublicMutable},
    };

    #[storage]
    struct Storage<Context> {
        messages: Map<AztecAddress, PublicMutable<Field, Context>, Context>,
    }

    #[external("public")]
    #[initializer]
    fn constructor() {}

    #[external("public")]
    fn send_message(recipient: AztecAddress, message_hash: Field) {
        self.storage.messages.at(recipient).write(message_hash);
    }

    #[external("public")]
    #[view]
    fn get_message(recipient: AztecAddress) -> pub Field {
        self.storage.messages.at(recipient).read()
    }
}
