import React, { useState, useEffect } from 'react';
import { GameState, GameSettings } from './types';
import { Controls } from './components/Controls';
import { SetupScreen } from './components/SetupScreen';
import { GameArea } from './components/GameArea';
import { playSound } from './services/audioService';
import { Trophy, RotateCcw, Frown } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [wordQueue, setWordQueue] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  
  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    speed: 3,
    textSize: 1.5,
    spawnRate: 2000,
    wordSpacing: 5 // Default 5% gap
  });

  const startGame = (text: string) => {
    // Sanitize whitespace but KEEP punctuation
    const cleanText = text
      .replace(/\s+/g, " ") // Normalize multiple spaces/newlines to single space
      .trim();
    
    const words = cleanText.split(" ").filter(w => w.length > 0);
    
    if (words.length === 0) return;

    setWordQueue(words);
    setScore(0);
    setLives(5); // 5 lives for kids is generous
    setStreak(0);
    setGameState(GameState.PLAYING);
  };

  const handleLifeLost = () => {
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setGameState(GameState.GAME_OVER);
        playSound('gameover');
        return 0;
      }
      return newLives;
    });
  };

  const handleScoreUpdate = (points: number, resetStreak: boolean) => {
    if (resetStreak) {
      setStreak(0);
    } else {
      setStreak(prev => {
        const newStreak = prev + 1;
        // Streak bonus logic
        const bonus = Math.floor(newStreak / 5) * 5; 
        setScore(s => s + points + bonus);
        
        // Play special sound on streak milestone
        if (newStreak % 5 === 0) playSound('success');
        
        return newStreak;
      });
    }
  };

  const togglePause = () => {
    if (gameState === GameState.PLAYING) setGameState(GameState.PAUSED);
    else if (gameState === GameState.PAUSED) setGameState(GameState.PLAYING);
  };

  const restartGame = () => {
    setGameState(GameState.SETUP);
    setWordQueue([]);
  };

  return (
    <div className="min-h-screen bg-clouds flex flex-col relative font-sans text-slate-800">
      
      {/* Controls Overlay (Always visible during game/pause) */}
      {(gameState === GameState.PLAYING || gameState === GameState.PAUSED) && (
        <Controls
          settings={settings}
          setSettings={setSettings}
          gameState={gameState}
          onPauseToggle={togglePause}
          onRestart={restartGame}
          score={score}
          lives={lives}
          streak={streak}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center w-full h-screen pt-20 pb-4 relative">
        
        {gameState === GameState.SETUP && (
          <SetupScreen onStart={startGame} />
        )}

        {(gameState === GameState.PLAYING || gameState === GameState.PAUSED) && (
          <GameArea
            wordQueue={wordQueue}
            settings={settings}
            gameState={gameState}
            setGameState={setGameState}
            onScoreUpdate={handleScoreUpdate}
            onLifeLost={handleLifeLost}
          />
        )}

        {/* Pause Overlay */}
        {gameState === GameState.PAUSED && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center animate-bounce-in">
              <h2 className="text-4xl font-game-font font-bold text-blue-600 mb-4">Pauza</h2>
              <button 
                onClick={togglePause}
                className="bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-3 px-8 rounded-full shadow-lg transition-transform active:scale-95"
              >
                Wznów Grę
              </button>
            </div>
          </div>
        )}

        {/* Game Over / Victory Overlay */}
        {(gameState === GameState.GAME_OVER || gameState === GameState.VICTORY) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl text-center max-w-lg w-full border-8 border-white ring-4 ring-pink-200 animate-fade-in-up">
              
              {gameState === GameState.VICTORY ? (
                <div className="mb-6">
                  <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4 animate-bounce" />
                  <h2 className="text-5xl font-game-font font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
                    Brawo!
                  </h2>
                  <p className="text-xl text-gray-600">Przeczytałaś wszystkie słowa!</p>
                </div>
              ) : (
                <div className="mb-6">
                  <Frown className="w-24 h-24 text-blue-400 mx-auto mb-4" />
                  <h2 className="text-4xl font-game-font font-bold text-blue-600 mb-2">
                    Koniec Gry
                  </h2>
                  <p className="text-xl text-gray-600">Ale poszło Ci świetnie!</p>
                </div>
              )}

              <div className="bg-gray-100 rounded-xl p-4 mb-8">
                <p className="text-gray-500 text-sm uppercase tracking-wide font-bold mb-1">Twój Wynik</p>
                <p className="text-4xl font-bold text-slate-800">{score}</p>
              </div>

              <button 
                onClick={restartGame}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xl font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95"
              >
                <RotateCcw />
                Zagraj Jeszcze Raz
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Decorative cloud bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none opacity-80 z-0 bg-[url('https://raw.githubusercontent.com/sahilhost/animated-weather-icons/master/img/cloud.svg')] bg-repeat-x bg-bottom bg-contain opacity-20"></div>
    </div>
  );
};

export default App;