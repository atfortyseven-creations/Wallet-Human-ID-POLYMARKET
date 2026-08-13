"use client";
import React from 'react';
import { Camera, Mic } from 'lucide-react';

interface MediaPermissionsPrePromptProps {
    pendingCallType: 'audio' | 'video' | 'answer' | null;
    setPendingCallType: (t: 'audio' | 'video' | 'answer' | null) => void;
    onGrant: (type: 'audio' | 'video' | 'answer') => void;
}

export function MediaPermissionsPrePrompt({ pendingCallType, setPendingCallType, onGrant }: MediaPermissionsPrePromptProps) {
    if (!pendingCallType) return null;
    return (
        <div className="fixed inset-0 z-[600] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-black">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl">
                <div className="flex gap-4 mb-6 text-indigo-600 justify-center">
                    <Camera size={32} />
                    <Mic size={32} />
                </div>
                <h2 className="text-2xl font-black text-center mb-4">Camera &amp; Microphone Access</h2>
                <p className="text-sm text-gray-600 text-center mb-8">
                    WhaleChat needs access to your camera and microphone to enable peer-to-peer encrypted {pendingCallType === 'video' ? 'video' : 'audio'} calls. Your media stream is never stored or sent to our servers — it goes directly to your peer.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => onGrant(pendingCallType)}
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        Allow Access &amp; Continue
                    </button>
                    <button
                        onClick={() => setPendingCallType(null)}
                        className="w-full py-3 bg-transparent text-gray-500 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        Not Now
                    </button>
                </div>
                <p className="text-xs text-gray-400 text-center mt-4">
                    You can revoke this permission at any time in your browser settings.
                </p>
            </div>
        </div>
    );
}
