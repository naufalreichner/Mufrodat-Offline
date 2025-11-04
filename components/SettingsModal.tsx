import React from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface Font {
  name: string;
  family: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fonts: Font[];
  selectedFont: string;
  onFontChange: (fontFamily: string) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  fonts,
  selectedFont,
  onFontChange,
  theme,
  onThemeChange,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 dark:bg-opacity-80 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Pengaturan</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Font Arab
            </label>
            <select
              value={selectedFont}
              onChange={(e) => onFontChange(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {fonts.map(font => (
                <option key={font.name} value={font.family} style={{ fontFamily: font.family }}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tema
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => onThemeChange('light')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md border-2 transition-all ${
                  theme === 'light'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <SunIcon className="w-5 h-5" />
                <span className="font-medium">Terang</span>
              </button>
              <button
                onClick={() => onThemeChange('dark')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <MoonIcon className="w-5 h-5" />
                <span className="font-medium">Gelap</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-slate-800"
          >
            Tutup
          </button>
        </div>

        <div className="mt-8 pt-6 border-t dark:border-slate-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Crafted by <span className="font-semibold">Naufal&Co</span> - Powered By <span className="font-semibold">Bolt</span>
          </p>
        </div>
      </div>
    </div>
  );
};
