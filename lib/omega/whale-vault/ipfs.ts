import { useState } from 'react';

// "God-Mode": Abstracting the IPFS Provider. 
// Could be Pinata, Infura, or a local Helia node.
const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

export const useSystemStorage = () => {
    const [isUploading, setIsUploading] = useState(false);

    /**
     * Uploads encrypted binary data to IPFS.
     * @returns The CID (Content Identifier)
     */
    const uploadToIPFS = async (data: Uint8Array | Blob): Promise<string> => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            const blob = new Blob([data], { type: 'application/octet-stream' });
            formData.append('file', blob);

            // Require real implementation (e.g. Pinata, Infura, native IPFS node)
            throw new Error("System Storage requires real IPFS provider configuration. Mock uploads disabled.");
        } catch (err) {
            console.error("Upload failed", err);
            throw err;
        } finally {
            setIsUploading(false);
        }
    };

    /**
     * Fetches raw encrypted data from IPFS.
     */
    const fetchFromIPFS = async (cid: string): Promise<Uint8Array> => {
        const response = await fetch(`${IPFS_GATEWAY}${cid}`);
        if (!response.ok) throw new Error("Failed to fetch from IPFS");
        
        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
    };

    return {
        uploadToIPFS,
        fetchFromIPFS,
        isUploading
    };
};

