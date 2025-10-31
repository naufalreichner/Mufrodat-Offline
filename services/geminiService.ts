import { GoogleGenAI, Type } from "@google/genai";
import type { Vocabulary, QuizData } from '../types';

// Schema for a single vocabulary item
const vocabularySchema = {
    type: Type.OBJECT,
    properties: {
        singular: { type: Type.STRING, description: "Bentuk tunggal (mufrad) dalam bahasa Arab." },
        dual: { type: Type.STRING, description: "Bentuk ganda (mutsanna) dalam bahasa Arab. Kosongkan jika tidak ada." },
        plural: { type: Type.STRING, description: "Bentuk jamak (jamak') dalam bahasa Arab. Kosongkan jika tidak ada." },
        meaning: { type: Type.STRING, description: "Arti kata dalam Bahasa Indonesia." },
        notes: { type: Type.STRING, description: "Catatan tata bahasa atau islahul lughoh. Kosongkan jika tidak ada." },
    },
    required: ["singular", "meaning"],
};

// Schema for parsing multiple vocabulary items from a single text block
const multipleVocabularySchema = {
    type: Type.OBJECT,
    properties: {
        vocabulary: {
            type: Type.ARRAY,
            description: "Sebuah array dari mufrodat dan catatan bahasa yang berhasil diekstrak.",
            items: vocabularySchema
        }
    },
    required: ["vocabulary"]
};


export const generateQuiz = async (vocabularyList: Vocabulary[], questionCount: number): Promise<QuizData> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  // Schema for AI-powered Quiz Generation, made dynamic
  const quizSchema = {
    type: Type.OBJECT,
    properties: {
      quiz: {
        type: Type.ARRAY,
        description: `An array of ${questionCount} quiz questions.`,
        items: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: "The quiz question in Bahasa Indonesia.",
            },
            options: {
              type: Type.ARRAY,
              description: "An array of 4 possible answers, in Arabic.",
              items: { type: Type.STRING },
            },
            correctAnswer: {
              type: Type.STRING,
              description: "The correct answer from the options array, exactly matching one of the options.",
            },
          },
          required: ["question", "options", "correctAnswer"],
        },
      },
    },
    required: ["quiz"],
  };

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Anda adalah seorang ahli guru Bahasa Arab yang membuat kuis. Berdasarkan daftar kosakata berikut, buatlah kuis pilihan ganda dengan ${questionCount} pertanyaan. Pertanyaan harus menguji pengetahuan pengguna tentang bentuk tunggal (mufrad), ganda (mutsanna), dan jamak (jamak').

Untuk setiap pertanyaan, berikan pertanyaan yang jelas dalam Bahasa Indonesia, empat pilihan jawaban dalam Bahasa Arab, dan sebutkan jawaban yang benar. Pastikan pilihan yang salah masuk akal tetapi salah.

Kuis harus dikembalikan dalam format JSON terstruktur sesuai dengan skema yang disediakan. Jangan sertakan teks apa pun di luar struktur JSON.

Berikut adalah daftar kosakatanya:
${JSON.stringify(vocabularyList.map(({ singular, dual, plural }) => ({ singular, dual, plural })))}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      },
    });

    const jsonText = response.text.trim();
    const quizData: QuizData = JSON.parse(jsonText);
    
    if (!quizData.quiz || !Array.isArray(quizData.quiz)) {
        throw new Error("Invalid quiz data structure from API.");
    }

    return quizData;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Gagal membuat kuis. Silakan coba lagi.");
  }
};

export const parseMultipleVocabularyInput = async (inputText: string): Promise<Omit<Vocabulary, 'id'>[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Anda adalah ahli linguistik Arab yang sangat teliti. Tugas Anda adalah mengurai blok teks dari pengguna untuk mengekstrak beberapa mufrodat dan frasa "islahul lughoh".

Instruksi:
1.  Abaikan semua metadata seperti judul, hari, tanggal, dan topik. Fokus hanya pada daftar mufrodat dan bagian "islahul lughoh".
2.  Setiap mufrodat biasanya ditandai dengan tanda hubung (-) di awal. Baris pertama berisi bentuk Arab (mufrad, mutsanna, jamak) dan baris di bawahnya adalah artinya dalam Bahasa Indonesia. Ekstrak informasi ini ke dalam objek JSON.
3.  Bagian "إِصْلَاحُ اللُّغَةِ" berisi frasa atau kalimat. Perlakukan setiap item di sini sebagai entri vocabulary terpisah.
4.  Untuk item "islahul lughoh":
    -   Gunakan frasa Arab sebagai nilai 'singular'.
    -   Gunakan terjemahan Indonesianya sebagai 'meaning'.
    -   Biarkan 'dual' dan 'plural' sebagai string kosong.
    -   Isi 'notes' dengan "Islahul Lughoh".
5.  Kembalikan semua item yang diekstrak sebagai array di dalam objek JSON sesuai dengan skema yang disediakan. Pastikan tidak ada teks lain di luar objek JSON utama.

Contoh Input Pengguna:
\`\`\`
✨المفردات اليومية✨

الثلاثاء، ٢٨ أكتوبر ٢٠٢٥م
_____________________________________

الموضوع: فِيْ البيت

- غَسَّالَةٌ - غَسَّالَتَانِ - غَسَّالَاتٌ 
Mesin cuci 
- ⁠مِعْطَفٌ - مِعْطَفَانِ - مَعَاطِفُ
Mantel/jaket
- لِحَافٌ - لِحَافَانِ - لُحُفٌ
Selimut
__________

إِصْلَاحُ اللُّغَةِ

- أَنَا مُتْعَبٌ/مُتْعَبَةٌ.
      Aku lelah.
- هَلْ صَلَّيْتَ الظُّهْرَ؟
      Apakah kamu sudah sholat Dzuhur?
\`\`\`

Contoh Output JSON yang Diharapkan:
\`\`\`json
{
  "vocabulary": [
    {
      "singular": "غَسَّالَةٌ",
      "dual": "غَسَّالَتَانِ",
      "plural": "غَسَّالَاتٌ",
      "meaning": "Mesin cuci",
      "notes": ""
    },
    {
      "singular": "مِعْطَفٌ",
      "dual": "مِعْطَفَانِ",
      "plural": "مَعَاطِفُ",
      "meaning": "Mantel/jaket",
      "notes": ""
    },
    {
      "singular": "لِحَافٌ",
      "dual": "لِحَافَانِ",
      "plural": "لُحُفٌ",
      "meaning": "Selimut",
      "notes": ""
    },
    {
      "singular": "أَنَا مُتْعَبٌ/مُتْعَبَةٌ.",
      "dual": "",
      "plural": "",
      "meaning": "Aku lelah.",
      "notes": "Islahul Lughoh"
    },
    {
      "singular": "هَلْ صَلَّيْتَ الظُّهْرَ؟",
      "dual": "",
      "plural": "",
      "meaning": "Apakah kamu sudah sholat Dzuhur?",
      "notes": "Islahul Lughoh"
    }
  ]
}
\`\`\`

Sekarang, proses input pengguna berikut:
Input Pengguna: "${inputText}"
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: multipleVocabularySchema,
            }
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);
        
        if (!parsedData.vocabulary || !Array.isArray(parsedData.vocabulary)) {
            throw new Error("AI tidak dapat mengurai input. Format respons tidak valid.");
        }

        return parsedData.vocabulary;
    } catch (error) {
        console.error("Error parsing vocabulary batch:", error);
        throw new Error("Gagal memproses mufrodat dengan AI. Periksa kembali input Anda atau coba lagi.");
    }
};