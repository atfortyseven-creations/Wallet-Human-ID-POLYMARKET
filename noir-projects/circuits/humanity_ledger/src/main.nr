contract HumanityLedger {
    use dep::aztec::prelude::{
        AztecAddress, NoteHeader, PrivateSet, PrivateContext, Map, PublicMutable
    };
    use dep::value_note::{
        note::{ValueNote, VALUE_NOTE_LEN},
        utils::{increment, decrement}
    };

    #[aztec(storage)]
    struct Storage {
        balances: Map<AztecAddress, PrivateSet<ValueNote>>,
    }

    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor() {
    }

    // Function to add a shielded balance to a user (e.g. from bridging)
    #[aztec(private)]
    fn add_balance(recipient: AztecAddress, amount: Field) {
        let mut note = ValueNote::new(amount, recipient);
        storage.balances.at(recipient).insert(&mut note, true);
    }

    // Shielded transfer between users
    #[aztec(private)]
    fn transfer(sender: AztecAddress, recipient: AztecAddress, amount: Field) {
        let sender_balance = storage.balances.at(sender);
        decrement(sender_balance, amount, sender);

        let recipient_balance = storage.balances.at(recipient);
        increment(recipient_balance, amount, recipient);
    }
}
