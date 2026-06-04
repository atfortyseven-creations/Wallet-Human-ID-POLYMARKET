'use client';

import React, { useEffect, useState } from 'react';
import SNSWebSdk from '@sumsub/websdk-react';

interface SumsubWebSDKProps {
    accessToken: string;
    onCompleted: (result: any) => void;
    onError: (error: any) => void;
}

/**
 * SUMSUB WEBSDK COMPONENT (LEGENDARY UI)
 * 
 * Embeds the professional identity verification flow.
 * Handles document upload, liveness check, and real-time status updates.
 */
export default function SumsubWebSDK({ accessToken, onCompleted, onError }: SumsubWebSDKProps) {
    const [expirationHandler, setExpirationHandler] = useState<any>(null);

    const config = {
        lang: 'en',
        email: '',
        phone: '',
        i18n: {
            document: {
                subTitles: {
                    IDENTITY: 'Upload your ID document (Passport, Drivers License)'
                }
            }
        },
        uiConf: {
            customCssStr: `
                :root {
                  --black: #000000;
                  --grey: #F5F5F5;
                  --grey-darker: #B2B2B2;
                  --border-color: #DBDBDB;
                }
                section {
                    background-color: transparent !important;
                }
                /* Legendary Dark Mode Styles */
                p { color: #e5e7eb !important; }
                .submit-button {
                    background-color: #3b82f6 !important;
                    color: white !important;
                    border-radius: 8px !important;
                }
            `,
        },
        onError: (error: any) => {
            console.error('WebSDK onError', error);
            onError(error);
        },
    };

    const options = { addViewportTag: false, adaptIframeHeight: true };

    return (
        <div className="w-full max-w-2xl mx-auto bg-slate-900/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
            <SNSWebSdk
                accessToken={accessToken}
                expirationHandler={expirationHandler}
                config={config}
                options={options}
                onMessage={(type: any, payload: any) => {
                    console.log('WebSDK onMessage', type, payload);
                    if (type === 'idCheck.onApplicantStatusChanged') {
                        // Handle status changes (pending -> review -> completed)
                        if (payload.reviewStatus === 'completed') {
                            onCompleted(payload);
                        }
                    }
                }}
                onError={(error: any) => {
                    console.error('WebSDK onError', error);
                    onError(error);
                }}
            />
        </div>
    );
}

