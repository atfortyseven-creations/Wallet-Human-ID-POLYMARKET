import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

type NFCStatus = 'unsupported' | 'idle' | 'scanning' | 'success' | 'error';

export function useNFC() {
    const [isSupported, setIsSupported] = useState(false);
    const [status, setStatus] = useState<NFCStatus>('idle');
    const [serialNumber, setSerialNumber] = useState<string | null>(null);

    useEffect(() => {
        if ('NDEFReader' in window) {
            setIsSupported(true);
        } else {
            setIsSupported(false);
            setStatus('unsupported');
        }
    }, []);

    const startScan = useCallback(async () => {
        // Feature detection
        if (!('NDEFReader' in window)) {
            // FALLBACK FOR DESKTOP DEV
            setStatus('scanning');
            console.warn("NFC not supported on this device. Running simulation.");
            
            toast.info("Simulating NFC Scan (Desktop Mode)...", {
                description: "Tap 'Simulate Card' to finish."
            });

            return; // Wait for manual simulation
        }

        try {
            // @ts-ignore - Web NFC API is experimental
            const ndef = new window.NDEFReader();
            setStatus('scanning');
            
            await ndef.scan();
            console.log("NFC Scan started successfully.");

            ndef.onreadingerror = () => {
                setStatus('error');
                toast.error("Cannot read data from the NFC tag. Try another one?");
            };

            ndef.onreading = (event: any) => {
                console.log("NFC Tag read: ", event);
                const serialNumber = event.serialNumber;
                setSerialNumber(serialNumber);
                setStatus('success');
                toast.success("Human Card Detected!", {
                    description: `ID: ${serialNumber}`
                });
            };

        } catch (error) {
            console.error("Error starting NFC scan: ", error);
            setStatus('error');
            toast.error("NFC Permission Denied or Not Available.");
        }
    }, []);

    const simulateScan = () => {
        if (status !== 'scanning') return;
        
        setTimeout(() => {
            setSerialNumber("04:88:12:9A:F1:C3:EE");
            setStatus('success');
            toast.success("Human Card Detected (Simulated)", {
                description: "ID: 04:88:12:9A:F1:C3:EE"
            });
        }, 1500);
    };

    return {
        isSupported,
        status,
        startScan,
        simulateScan,
        serialNumber,
        reset: () => {
            setStatus(isSupported ? 'idle' : 'unsupported');
            setSerialNumber(null);
        }
    };
}
