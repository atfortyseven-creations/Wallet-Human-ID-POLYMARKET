"use client";

import React, { useState } from 'react';
import { useApp } from './AppContext'; // Importamos la lógica de arriba
import { Menu, X, Moon, Sun, Globe, DollarSign } from 'lucide-react'; // Iconos

const SettingsMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, setTheme, lang, setLang, currency, setCurrency, t } = useApp();

    return (
        <div className="relative z-50">
            {/* Botón de 3 Barras (Hamburguesa) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white transition-all border border-neutral-800"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Menú Desplegable */}
            {isOpen && (
                <div className={`absolute right-0 mt-3 w-64 rounded-xl shadow-2xl border backdrop-blur-md transition-all z-50
          ${theme === 'dark'
                        ? 'bg-black/90 border-neutral-800 text-white'
                        : 'bg-white/95 border-neutral-200 text-neutral-900'
                    }`}
                >
                    <div className="p-4 space-y-6">
                        <h3 className={`text-xs font-bold uppercase opacity-50 tracking-wider border-b pb-2 
                ${theme === 'dark' ? 'border-neutral-800' : 'border-neutral-200'}`}>
                            {t('settings')}
                        </h3>

                        {/* 1. Selector de Moneda */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <DollarSign size={16} className="text-orange-500" /> Moneda
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                                {['USD', 'EUR', 'GBP', 'JPY'].map((cur) => (
                                    <button
                                        key={cur}
                                        onClick={() => setCurrency(cur)}
                                        className={`text-xs py-1 rounded-md transition-colors border
                      ${currency === cur
                                                ? 'bg-orange-500 text-white border-orange-500'
                                                : theme === 'dark'
                                                    ? 'bg-neutral-900 border-neutral-700 hover:bg-neutral-800'
                                                    : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
                                            }`}
                                    >
                                        {cur}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Selector de Idioma */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Globe size={16} className="text-blue-500" /> Idioma
                            </div>
                            <select
                                value={lang}
                                onChange={(e) => setLang(e.target.value)}
                                className={`w-full p-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${theme === 'dark'
                                        ? 'bg-neutral-900 border-neutral-700 text-white'
                                        : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                                    }`}
                            >
                                <option value="es">🇪🇸 Español</option>
                                <option value="en">🇺🇸 English</option>
                                <option value="de">🇩🇪 Deutsch</option>
                                <option value="fr">🇫🇷 Français</option>
                            </select>
                        </div>

                        {/* 3. Toggle Dark / Light Mode */}
                        <div className={`pt-2 border-t ${theme === 'dark' ? 'border-neutral-800' : 'border-neutral-200'}`}>
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors
                  ${theme === 'dark' ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}
                            >
                                <span className="text-sm font-medium flex items-center gap-2">
                                    {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                </span>

                                {/* Switch Visual */}
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-emerald-500' : 'bg-neutral-300'}`}>
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${theme === 'dark' ? 'left-6' : 'left-1'}`}></div>
                                </div>
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsMenu;
