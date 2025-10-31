import React, { useState } from 'react';
import type { Vocabulary } from '../types';

interface AddVocabularyFormProps {
  onAdd: (items: Omit<Vocabulary, 'id'>[]) => void;
  onUpdate: (item: Vocabulary) => void;
  onCancel: () => void;
  existingVocabulary: Vocabulary | null;
}

const InputField: React.FC<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    isArabic?: boolean;
}> = ({ label, value, onChange, placeholder, isArabic = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 ${isArabic ? 'font-arabic text-xl text-right' : ''}`}
        />
    </div>
);

// This form is now only used for editing
const EditForm: React.FC<{
    onUpdate: (item: Vocabulary) => void;
    onCancel: () => void;
    existingVocabulary: Vocabulary;
}> = ({ onUpdate, onCancel, existingVocabulary }) => {
    const [singular, setSingular] = useState(existingVocabulary.singular);
    const [dual, setDual] = useState(existingVocabulary.dual);
    const [plural, setPlural] = useState(existingVocabulary.plural);
    const [meaning, setMeaning] = useState(existingVocabulary.meaning);
    const [notes, setNotes] = useState(existingVocabulary.notes);

    const isEditingIslahulLughoh = existingVocabulary?.notes === 'Islahul Lughoh';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!singular || !meaning) {
            alert("Input utama dan arti tidak boleh kosong.");
            return;
        }
        onUpdate({ id: existingVocabulary.id, singular, dual, plural, meaning, notes });
    };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {isEditingIslahulLughoh ? (
            <>
                <InputField label="Frasa Arab" value={singular} onChange={(e) => setSingular(e.target.value)} placeholder="contoh: أَنَا مُتْعَبٌ" isArabic />
                <InputField label="Arti" value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder="contoh: Aku lelah" />
            </>
        ) : (
            <>
                <InputField label="MUFRAD (Tunggal)" value={singular} onChange={(e) => setSingular(e.target.value)} placeholder="contoh: كِتَابٌ" isArabic />
                <InputField label="MUTSANNA (Ganda)" value={dual} onChange={(e) => setDual(e.target.value)} placeholder="contoh: كِتَابَانِ" isArabic />
                <InputField label="JAMAK' (Jamak)" value={plural} onChange={(e) => setPlural(e.target.value)} placeholder="contoh: كُتُبٌ" isArabic />
                <InputField label="Arti" value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder="contoh: buku" />
            </>
        )}
        
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Isi dengan 'Islahul Lughoh' untuk mengubah tipe, atau tambahkan catatan lain." rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100" />
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 dark:border-slate-500 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-slate-800">Batal</button>
          <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-slate-800">
            Update
          </button>
        </div>
      </form>
    );
};

const parseVocabularyInput = (text: string): Omit<Vocabulary, 'id'>[] => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const vocabulary: Omit<Vocabulary, 'id'>[] = [];
    let isIslahSection = false;

    let i = 0;
    while (i < lines.length) {
        let currentLine = lines[i];

        if (currentLine.includes('إِصْلَاحُ اللُّغَةِ')) {
            isIslahSection = true;
            i++;
            continue;
        }

        if (currentLine.match(/^[\s\u2060\u200f⁠-]*-/)) {
            const arabicLine = currentLine.replace(/^[\s\u2060\u200f⁠-]*-/, '').trim();
            const meaningLine = (i + 1 < lines.length && !lines[i + 1].match(/^[\s\u2060\u200f⁠-]*-/)) 
                ? lines[i + 1] 
                : '';
            
            if (meaningLine) {
                i++;
            }
            
            if (isIslahSection) {
                vocabulary.push({
                    singular: arabicLine,
                    dual: '',
                    plural: '',
                    meaning: meaningLine,
                    notes: 'Islahul Lughoh',
                });
            } else {
                const parts = arabicLine.split('-').map(p => p.trim()).filter(p => p);
                vocabulary.push({
                    singular: parts[0] || '',
                    dual: parts.length === 3 ? parts[1] : '',
                    plural: parts.length === 2 ? parts[1] : (parts.length === 3 ? parts[2] : ''),
                    meaning: meaningLine,
                    notes: '',
                });
            }
        }
        
        i++;
    }

    return vocabulary;
};

// This form is for adding new vocabulary using local parsing
const AddForm: React.FC<{
    onAdd: (items: Omit<Vocabulary, 'id'>[]) => void;
    onCancel: () => void;
}> = ({ onAdd, onCancel }) => {
    const [inputText, setInputText] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) {
            alert('Input tidak boleh kosong.');
            return;
        }

        try {
            const parsedItems = parseVocabularyInput(inputText);
            if (parsedItems.length === 0) {
                alert('Tidak ada mufrodat yang dapat ditemukan. Periksa kembali format input Anda.');
            } else {
                onAdd(parsedItems);
            }
        } catch (err) {
            alert("Gagal memproses mufrodat. Periksa kembali format input Anda.");
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="batch-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tempel teks mufrodat Anda di sini
                </label>
                <textarea
                    id="batch-input"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
`Contoh:
- مَاءٌ - مِيَاهٌ
Air
- ⁠صَابُوْن
Sabun

إِصْلَاحُ اللُّغَةِ
- قُمْ - قُوْمُوْا
Berdirilah.`
                    }
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 font-mono text-sm"
                />
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 dark:border-slate-500 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-slate-800">
                    Batal
                </button>
                <button
                    type="submit"
                    className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-slate-800"
                >
                   Tambah
                </button>
            </div>
        </form>
    );
};

export const AddVocabularyForm: React.FC<AddVocabularyFormProps> = ({ onAdd, onUpdate, onCancel, existingVocabulary }) => {
  const isEditing = !!existingVocabulary;

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-6 md:p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
         {isEditing ? 'Edit Mufrodat' : 'Tambah Mufrodat'}
      </h2>
      
      {isEditing ? (
        <EditForm 
            onUpdate={onUpdate}
            onCancel={onCancel}
            existingVocabulary={existingVocabulary}
        />
      ) : (
        <AddForm
            onAdd={onAdd}
            onCancel={onCancel}
        />
      )}
    </div>
  );
};