"use client";

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let globalSocket: Socket | null = null;
let connectionCount = 0;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(globalSocket?.connected || false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!globalSocket) {
      // Use external WS URL if provided (e.g. decoupled Railway Worker), otherwise fallback to Next.js API path
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || '';
      
      globalSocket = io(wsUrl, {
        path: wsUrl ? undefined : '/api/socket/io',
        addTrailingSlash: false,
        reconnectionDelayMax: 10000,
        reconnectionAttempts: Infinity,
        transports: ['websocket', 'polling'] // fallback to polling if WS is blocked by WAF
      });
    }

    const socket = globalSocket;
    socketRef.current = socket;
    connectionCount++;

    const onConnect = () => {
      console.log(' [WebSocket] Connected to Hub');
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log(' [WebSocket] Disconnected');
      setIsConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Set initial state correctly if already connected
    setIsConnected(socket.connected);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !socket.connected) {
        console.log(' [WebSocket] Tab became visible. Forcing reconnection...');
        socket.connect();
      }
    };
    
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibilityChange);
    }

    return () => {
      connectionCount--;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityChange);
      }
      
      if (connectionCount === 0 && globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
      }
    };
  }, []);

  const emit = (event: string, data: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return { isConnected, socket: socketRef.current, emit, on, off };
};

