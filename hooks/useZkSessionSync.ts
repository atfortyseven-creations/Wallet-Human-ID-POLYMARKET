"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAztec } from '../context/AztecContext';
// import { ZKSessionSyncContract } from '../src/artifacts/ZKSessionSync.js';

export function useZkSessionSync() {
    const { pxe, isReady } = useAztec();
    const [sessionChallenge, setSessionChallenge] = useState<string>('');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isListening, setIsListening] = useState<boolean>(false);

    // 1. Desktop genera un challenge criptográfico único
    const generateChallenge = useCallback(() => {
        // En producción usamos un verdadero CSPRNG
        const challenge = Math.floor(Math.random() * 1000000000000).toString(16);
        setSessionChallenge(challenge);
        setIsAuthenticated(false);
        setIsListening(true);
        return challenge;
    }, []);

    // 2. Desktop escucha el estado público del contrato en Aztec
    useEffect(() => {
        let interval: NodeJS.Timeout;

        const checkSessionStatus = async () => {
            if (!isReady || !pxe || !sessionChallenge || !isListening) return;

            try {
                // Lógica de Aztec JS real para leer estado público:
                // const isAuth = await ZKSessionSyncContract.at(CONTRACT_ADDRESS, pxe)
                //    .methods.is_session_authenticated(sessionChallenge)
                //    .view();

                // Simulación para el Milestone actual:
                console.log(`[Aztec PXE] Verificando estado on-chain para sesión: ${sessionChallenge}`);
                
                // Si la prueba de conocimiento cero fue verificada en la red:
                // if (isAuth) {
                //    setIsAuthenticated(true);
                //    setIsListening(false);
                // }
            } catch (error) {
                console.error("Error comprobando el estado de la sesión ZK:", error);
            }
        };

        if (isListening) {
            interval = setInterval(checkSessionStatus, 3000); // Polling cada 3s al PXE local
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isReady, pxe, sessionChallenge, isListening]);

    return {
        sessionChallenge,
        generateChallenge,
        isAuthenticated,
        isListening
    };
}
