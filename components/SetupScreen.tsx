import React, { useState } from 'react';
import { Sparkles, BookOpen, Play } from 'lucide-react';
import { generateStory } from '../services/geminiService';
import { playSound } from '../services/audioService';

interface SetupScreenProps {
  onStart: (text: string) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Default text samples
  const sampleTexts = [
    "Ala ma kota, a kot ma Alę. Kot lubi mleko.",
    "Wielki smok spał w jaskini. Rycerz był dzielny.",
    "Zosia poszła do lasu. Znalazła tam grzyby."
  ];

  const handleGenerate = async () => {
    setIsLoading(true);
    playSound('pop');
    try {
      const story = await generateStory();
      setInputText(story);
    } catch (e) {
      setInputText("Przepraszam, nie udało się wyczarować bajki. Spróbuj wpisać własną!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = () => {
    if (!inputText.trim()) return;
    playSound('start');
    onStart(inputText);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-4 z-10 relative">
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-4 border-pink-200 w-full animate-fade-in-up">
        
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-game-font font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            Magiczne Słowa
          </h1>
          <p className="text-gray-600 text-lg">Wklej tekst lub wyczaruj bajkę!</p>
        </div>

        <div className="space-y-4">
          <textarea
            className="w-full h-40 p-4 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all resize-none text-lg"
            placeholder="Tutaj wpisz tekst do czytania..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {sampleTexts.map((text, i) => (
              <button
                key={i}
                onClick={() => setInputText(text)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
              >
                Przykładowy tekst {i + 1}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={24} />
                  <span>Wyczaruj Bajkę</span>
                </>
              )}
            </button>

            <button
              onClick={handleStart}
              disabled={!inputText.trim()}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={24} fill="currentColor" />
              <span>Zacznij Grę!</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -z-10 top-0 right-0 transform translate-x-12 -translate-y-12 text-yellow-300 opacity-50">
        <Sparkles size={120} />
      </div>
      <div className="absolute -z-10 bottom-0 left-0 transform -translate-x-12 translate-y-12 text-pink-300 opacity-50">
        <BookOpen size={100} />
      </div>
    </div>
  );
};