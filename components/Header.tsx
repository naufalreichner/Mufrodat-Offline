import React from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface Font {
  name: string;
  family: string;
}

interface HeaderProps {
  fonts: Font[];
  selectedFont: string;
  onFontChange: (fontFamily: string) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

const Header: React.FC<HeaderProps> = ({ fonts, selectedFont, onFontChange, theme, onThemeChange }) => {
  return (
    <header className="bg-white dark:bg-gray-800/80 dark:backdrop-blur-sm shadow-sm dark:shadow-gray-700/20 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-500 tracking-tight">
            Mufrodat<span className="font-light text-gray-500 dark:text-gray-400">Pro</span>
          </h1>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative">
              <select
                value={selectedFont}
                onChange={(e) => onFontChange(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1.5 pl-3 pr-8 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                aria-label="Pilih Font Arab"
              >
                {fonts.map(font => (
                  <option key={font.name} value={font.family} style={{ fontFamily: font.family, fontSize: '1.25rem' }}>
                    {font.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <button
              onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-800 transition-colors"
              aria-label="Ganti Tema"
            >
              {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;