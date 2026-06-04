"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
    useEffect(() => {
        onComplete();
    }, [onComplete]);

    return null;
}

