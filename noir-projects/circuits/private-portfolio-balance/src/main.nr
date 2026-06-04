contract PrivatePortfolioBalance {
    use dep::aztec::prelude::{
        AztecAddress, PrivateContext, Map, PublicMutable, PrivateSet
    };
    use dep::value_note::note::{ValueNote, VALUE_NOTE_LEN};
    use dep::value_note::utils::{increment, decrement};

    #[aztec(storage)]
    struct Storage {
        // Private token balances shielded per user per asset
        // Key: asset_id (ERC20 contract address as Field)
        balances: Map<AztecAddress, Map<Field, PrivateSet<ValueNote>>>,
        // Public total supply shielded into this contract (for transparency)
        total_shielded: Map<Field, PublicMutable<Field>>,
    }

    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor() {}

    /// Shields tokens from a public ERC20 into a private balance note.
    #[aztec(private)]
    fn shield(owner: AztecAddress, asset_id: Field, amount: Field) {
        let mut note = ValueNote::new(amount, owner);
        storage.balances.at(owner).at(asset_id).insert(&mut note, true);

        PrivatePortfolioBalance::at(context.this_address())
            .update_shielded_total(asset_id, amount)
            .enqueue(&mut context);
    }

    /// Privately transfers a shielded balance between two users.
    #[aztec(private)]
    fn private_transfer(
        sender: AztecAddress,
        recipient: AztecAddress,
        asset_id: Field,
        amount: Field,
    ) {
        decrement(storage.balances.at(sender).at(asset_id), amount, sender);
        let mut note = ValueNote::new(amount, recipient);
        storage.balances.at(recipient).at(asset_id).insert(&mut note, true);
    }

    #[aztec(public)]
    #[aztec(internal)]
    fn update_shielded_total(asset_id: Field, amount: Field) {
        let current = storage.total_shielded.at(asset_id).read();
        storage.total_shielded.at(asset_id).write(current + amount);
    }
}
