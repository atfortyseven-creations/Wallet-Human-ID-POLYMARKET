"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function WalletControl() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connectors, connect, error } = useConnect();
  const { disconnect } = useDisconnect();
  
  const handleConnect = (connector: any) => {
    connect({ connector });
    if (error) toast.error("Connection failed: " + error.message);
  };

  if (isConnecting) return <Button variant="ghost" size="sm" className="gap-2"><Loader2 className="animate-spin w-4 h-4" /> SECURING...</Button>;
  
  if (isConnected) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => disconnect()}
        className="gap-2 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        {address?.slice(0, 6)}...{address?.slice(-4)}
        <LogOut className="w-3 h-3 ml-1 opacity-50" />
      </Button>
    );
  }

  // Find MetaMask connector specifically if available
  const mmConnector = connectors.find(c => c.id === 'metaMaskSDK' || c.name.toLowerCase().includes('metamask'));

  return (
    <div className="flex gap-2">
      {mmConnector ? (
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => handleConnect(mmConnector)}
          className="bg-[#F6851B] hover:bg-[#E2761B] text-white font-bold gap-2"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" className="w-4 h-4" alt="MetaMask" />
          METAMASK
        </Button>
      ) : (
        connectors.slice(0, 1).map(connector => (
            <Button 
              key={connector.uid} 
              variant="default" 
              size="sm" 
              onClick={() => handleConnect(connector)}
              className="font-bold gap-2"
            >
              <Wallet className="w-4 h-4" />
              {connector.name.toUpperCase()}
            </Button>
        ))
      )}
    </div>
  );
}

