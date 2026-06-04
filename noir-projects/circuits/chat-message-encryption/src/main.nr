contract ChatMessageEncryption {
    use dep::aztec::prelude::{
        AztecAddress, PrivateContext, Map, PrivateSet
    };
    use dep::value_note::note::{ValueNote, VALUE_NOTE_LEN};

    #[aztec(storage)]
    struct Storage {
        // Encrypted message payloads stored as private notes per recipient
        // Only the recipient's viewing key can decrypt the ValueNote contents
        inbox: Map<AztecAddress, PrivateSet<ValueNote>>,
    }

    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor() {}

    /// Encrypts and delivers a message to a recipient's private inbox.
    /// The message_ciphertext_hash is a Poseidon hash of the ECIES-encrypted payload.
    /// The actual ciphertext is stored off-chain (IPFS/encrypted relay);
    /// only its hash is committed on-chain for integrity and ordering guarantees.
    #[aztec(private)]
    fn deliver_encrypted_message(
        recipient: AztecAddress,
        message_ciphertext_hash: Field,
    ) {
        let mut note = ValueNote::new(message_ciphertext_hash, recipient);
        storage.inbox.at(recipient).insert(&mut note, true);
    }

    /// Allows a recipient to privately read and nullify a message note,
    /// preventing double-reads and confirming message delivery on-chain.
    #[aztec(private)]
    fn acknowledge_message(
        recipient: AztecAddress,
        message_ciphertext_hash: Field,
    ) {
        // Decrement removes the note from the private set, nullifying it
        let recipient_inbox = storage.inbox.at(recipient);
        dep::value_note::utils::decrement(recipient_inbox, message_ciphertext_hash, recipient);
    }
}
