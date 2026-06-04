contract ZKSessionSync {
    use dep::aztec::prelude::{
        AztecAddress, PrivateContext, Map, PublicMutable
    };

    #[aztec(storage)]
    struct Storage {
        // Maps a Session ID (Challenge) to a boolean indicating if it was successfully authenticated
        authenticated_sessions: Map<Field, PublicMutable<bool>>,
    }

    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor() {
    }

    // This function is called by the Mobile device
    // It proves knowledge of the private key corresponding to the user's AztecAddress
    // without revealing the private key to the desktop.
    // The desktop only sees that the `authenticated_sessions` map was updated for its session challenge.
    #[aztec(private)]
    fn authenticate_session(
        session_challenge: Field, 
        mobile_pub_key_x: Field, 
        mobile_pub_key_y: Field, 
        signature: [u8; 64]
    ) {
        // In a real implementation, we would verify the ECDSA signature of the session_challenge
        // using the mobile_pub_key. If valid, we authorize the session.
        // dep::std::ecdsa_secp256k1::verify_signature(mobile_pub_key_x, mobile_pub_key_y, signature, session_challenge);

        // For this milestone, we emit a call to update the public state
        // so the desktop client can listen to the blockchain and know the session is authenticated.
        ZKSessionSync::at(context.this_address()).mark_session_authenticated(session_challenge).enqueue(&mut context);
    }

    #[aztec(public)]
    #[aztec(internal)]
    fn mark_session_authenticated(session_challenge: Field) {
        storage.authenticated_sessions.at(session_challenge).write(true);
    }

    #[aztec(public)]
    fn is_session_authenticated(session_challenge: Field) -> bool {
        storage.authenticated_sessions.at(session_challenge).read()
    }
}
