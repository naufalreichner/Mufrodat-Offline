import React from 'react';
import type { Vocabulary } from '../types';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

interface VocabularyListProps {
  vocabulary: Vocabulary[];
  onEdit: (item: Vocabulary) => void;
  onDelete: (id: string) => void;
}

const VocabularyCard: React.FC<{ item: Vocabulary; onEdit: () => void; onDelete: () => void }> = ({ item, onEdit, onDelete }) => {
    const isIslahulLughoh = item.notes === 'Islahul Lughoh';

    const ActionButtons = () => (
        <div className="flex items-center space-x-1">
            <button onClick={onEdit} className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50" aria-label="Edit">
                <EditIcon className="w-5 h-5" />
            </button>
            <button onClick={onDelete} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50" aria-label="Hapus">
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
    );

    // Special card for Islahul Lughoh entries
    if (isIslahulLughoh) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="p-5">
                    <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-500 mb-2 text-right font-arabic">إِصْلَاحُ اللُّغَةِ</h3>
                    <p className="font-arabic text-2xl text-gray-800 dark:text-gray-100 text-right mb-3">{item.singular}</p>
                    <div className="border-t dark:border-slate-700 pt-3 mt-3 flex justify-between items-center">
                         <p className="text-md text-gray-700 dark:text-gray-300">{item.meaning}</p>
                         <ActionButtons />
                    </div>
                </div>
            </div>
        );
    }

    // Standard card for vocabulary
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="p-5">
                <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                    <div>
                        <h3 className="text-xs md:text-sm font-semibold text-emerald-600 dark:text-emerald-500">MUFRAD</h3>
                        <p className="font-arabic text-xl md:text-2xl text-gray-800 dark:text-gray-200 break-words">{item.singular || '-'}</p>
                    </div>
                    <div>
                        <h3 className="text-xs md:text-sm font-semibold text-emerald-600 dark:text-emerald-500">MUTSANNA</h3>
                        <p className="font-arabic text-xl md:text-2xl text-gray-800 dark:text-gray-200 break-words">{item.dual || '-'}</p>
                    </div>
                    <div>
                        <h3 className="text-xs md:text-sm font-semibold text-emerald-600 dark:text-emerald-500">JAMAK'</h3>
                        <p className="font-arabic text-xl md:text-2xl text-gray-800 dark:text-gray-200 break-words">{item.plural || '-'}</p>
                    </div>
                </div>
                <div className="mt-4 border-t dark:border-slate-700 pt-4 flex justify-between items-center">
                    <div>
                        <p className="text-lg text-gray-800 dark:text-gray-200">{item.meaning || '-'}</p>
                    </div>
                    <ActionButtons />
                </div>
                {item.notes && (
                    <div className="text-left mt-4 border-t dark:border-slate-700 pt-4">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Catatan:</p>
                        <p className="text-gray-700 dark:text-gray-300 italic">{item.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
};


export const VocabularyList: React.FC<VocabularyListProps> = ({ vocabulary, onEdit, onDelete }) => {
  if (vocabulary.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">Database Kosong</h2>
        <p className="text-gray-500 dark:text-gray-400">Belum ada mufrodat yang ditambahkan. Klik tombol '+' di pojok kanan bawah untuk memulai.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {vocabulary.map(item => (
        <VocabularyCard key={item.id} item={item} onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} />
      ))}
    </div>
  );
};