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
        // [FASE 7 - QUANTUM SHIELD] Restringir bounds para prevenir field wrap-around
        assert(amount != 0, "Amount cannot be zero");
        assert((amount as u120) as Field == amount, "Amount exceeds 120-bit safe bound");
        // En un entorno productivo real, esto requeriría un modificador de acceso (admin o bridge contract)
        // Por ahora, blindamos la integridad matemática del balance.

        let mut note = ValueNote::new(amount, recipient);
        storage.balances.at(recipient).insert(&mut note, true);
    }

    // Shielded transfer between users
    #[aztec(private)]
    fn transfer(sender: AztecAddress, recipient: AztecAddress, amount: Field) {
        // [FASE 7 - QUANTUM SHIELD] Filtro Anti-Sybil y Bounds
        assert(sender != recipient, "Self-transfers (wash trading) are forbidden");
        assert(amount != 0, "Transfer amount cannot be zero");
        assert((amount as u120) as Field == amount, "Amount exceeds 120-bit safe bound");
        assert(sender == context.msg_sender(), "Unauthorized sender"); // Solo el dueño puede transferir

        let sender_balance = storage.balances.at(sender);
        decrement(sender_balance, amount, sender);

        let recipient_balance = storage.balances.at(recipient);
        increment(recipient_balance, amount, recipient);
    }
}
