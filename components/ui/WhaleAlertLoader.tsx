"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface HumanityLedgerLoaderProps {
  /** Permite sobreescribir el fondo. Por defecto hereda el background del componente padre. */
  bg?: string;
  /** Color del texto y del spinner. Por defecto negro. */
  color?: string;
}

export function HumanityLedgerLoader({ bg = '#FFFFFF', color = '#000000' }: HumanityLedgerLoaderProps) {
  return null;
}
