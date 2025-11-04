import React, { useState } from 'react';
import { SettingsIcon } from './icons/SettingsIcon';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onSettingsClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <header className="bg-white dark:bg-gray-800/80 dark:backdrop-blur-sm shadow-sm dark:shadow-gray-700/20 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 h-16">
          <h1 className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-500 tracking-tight font-arabic whitespace-nowrap">
            زيادة
          </h1>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Cari..."
            className="flex-1 max-w-[150px] px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />

          <button
            onClick={onSettingsClick}
            className="ml-auto p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-800 transition-colors"
            aria-label="Pengaturan"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
