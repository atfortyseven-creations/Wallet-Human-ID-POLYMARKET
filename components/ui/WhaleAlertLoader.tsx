"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface WhaleAlertLoaderProps {
  /** Permite sobreescribir el fondo. Por defecto hereda el background del componente padre. */
  bg?: string;
  /** Color del texto y del spinner. Por defecto negro. */
  color?: string;
}

export function WhaleAlertLoader({ bg = '#FFFFFF', color = '#000000' }: WhaleAlertLoaderProps) {
  return null;
}
