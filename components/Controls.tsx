import React from 'react';
import { Settings as SettingsIcon, Play, Pause, RefreshCw } from 'lucide-react';
import { GameSettings, GameState } from '../types';

interface ControlsProps {
  settings: GameSettings;
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  gameState: GameState;
  onPauseToggle: () => void;
  onRestart: () => void;
  score: number;
  lives: number;
  streak: number;
}

export const Controls: React.FC<ControlsProps> = ({
  settings,
  setSettings,
  gameState,
  onPauseToggle,
  onRestart,
  score,
  lives,
  streak
}) => {
  
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, speed: Number(e.target.value) }));
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, textSize: Number(e.target.value) }));
  };

  const handleSpacingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, wordSpacing: Number(e.target.value) }));
  };

  return (
    <div className="fixed top-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md shadow-lg z-50 flex flex-col md:flex-row items-center justify-between gap-4 border-b-4 border-pink-300">
      
      {/* HUD */}
      <div className="flex items-center gap-6 font-game-font">
        <div className="bg-yellow-100 px-4 py-2 rounded-full border-2 border-yellow-400 flex items-center gap-2 shadow-sm">
          <span className="text-2xl">⭐</span>
          <span className="text-xl font-bold text-yellow-700">{score}</span>
        </div>
        <div className="bg-red-100 px-4 py-2 rounded-full border-2 border-red-400 flex items-center gap-2 shadow-sm">
          <span className="text-2xl">❤️</span>
          <span className="text-xl font-bold text-red-700">{lives}</span>
        </div>
        {streak > 2 && (
          <div className="hidden sm:flex bg-orange-100 px-3 py-1 rounded-full border border-orange-300 animate-pulse">
            <span className="font-bold text-orange-600">Seria: {streak}!</span>
          </div>
        )}
      </div>

      {/* Play Controls */}
      <div className="flex gap-2">
        <button 
          onClick={onPauseToggle}
          className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-transform active:scale-95"
          title={gameState === GameState.PAUSED ? "Wznów" : "Pauza"}
        >
          {gameState === GameState.PAUSED ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
        </button>
        <button 
          onClick={onRestart}
          className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform active:scale-95"
          title="Od nowa"
        >
          <RefreshCw size={24} />
        </button>
      </div>

      {/* Sliders */}
      <div className="flex flex-wrap items-center justify-end gap-4 bg-purple-50 px-4 py-2 rounded-xl border border-purple-200 w-full md:w-auto">
        <div className="flex flex-col w-28">
          <label className="text-xs font-bold text-purple-700 mb-1 flex justify-between">
            <span>Prędkość</span>
            <span>{settings.speed}</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={settings.speed}
            onChange={handleSpeedChange}
            className="w-full accent-purple-500 cursor-pointer h-2 bg-purple-200 rounded-lg appearance-none"
          />
        </div>

        <div className="flex flex-col w-28">
          <label className="text-xs font-bold text-purple-700 mb-1 flex justify-between">
            <span>Rozmiar</span>
            <span>{settings.textSize}x</span>
          </label>
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={settings.textSize}
            onChange={handleSizeChange}
            className="w-full accent-pink-500 cursor-pointer h-2 bg-pink-200 rounded-lg appearance-none"
          />
        </div>

        <div className="flex flex-col w-28">
          <label className="text-xs font-bold text-purple-700 mb-1 flex justify-between">
            <span>Odstępy</span>
            <span>{settings.wordSpacing}</span>
          </label>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={settings.wordSpacing}
            onChange={handleSpacingChange}
            className="w-full accent-blue-500 cursor-pointer h-2 bg-blue-200 rounded-lg appearance-none"
          />
        </div>
      </div>
    </div>
  );
};