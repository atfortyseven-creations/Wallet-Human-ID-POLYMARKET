import { useState, useEffect } from 'react';
import { formatEther } from 'viem';

export const useNetWorth = (
    address: string | undefined,
    ethBalance: number,
    wldBalance: number,
    wldPrice: number
) => {
    const [balance, setBalance] = useState(0);
    const [prevBalance, setPrevBalance] = useState(0); // Simula el balance de hace 24h
    const [percentage, setPercentage] = useState(0);
    const [loading, setLoading] = useState(false);

    // Calcular valor actual en USD
    const currentTotalUsd = (ethBalance * 2500) + (wldBalance * (wldPrice || 0));

    // Función simulada para obtener variación REAL (Mockeada por ahora como pide el usuario)
    const fetchBalance = async () => {
        if (!address) return;
        setLoading(true);

        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            // Usamos el valor real actual como base
            setBalance(currentTotalUsd);

            // Simular historia: Ayer tenía un poco menos o más (Variación ramdom entre -5% y +15%)
            const variation = 0.95 + Math.random() * 0.20;
            const yesterdayBalance = currentTotalUsd * (1 / variation);

            setPrevBalance(yesterdayBalance);

            // CÁLCULO MATEMÁTICO REAL DEL PORCENTAJE
            const change = ((currentTotalUsd - yesterdayBalance) / yesterdayBalance) * 100;
            setPercentage(parseFloat(change.toFixed(2)));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Recalcular si cambian los balances
    useEffect(() => {
        if (address && currentTotalUsd > 0) {
            fetchBalance();
        }
    }, [address, ethBalance, wldBalance, wldPrice]);

    return { balance, percentage, loading, fetchBalance };
};
