import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ActiveWord, GameSettings, GameState, Particle } from '../types';
import { playSound } from '../services/audioService';

interface GameAreaProps {
  wordQueue: string[];
  settings: GameSettings;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onScoreUpdate: (points: number, resetStreak: boolean) => void;
  onLifeLost: () => void;
}

export const GameArea: React.FC<GameAreaProps> = ({
  wordQueue,
  settings,
  gameState,
  setGameState,
  onScoreUpdate,
  onLifeLost
}) => {
  // We use refs for the game state logic to decouple it from React's render cycle.
  // This prevents the "jitter" or dependency loop restarts.
  const logicState = useRef({
    activeWords: [] as ActiveWord[],
    particles: [] as Particle[],
    lastTime: 0,
    lastSpawn: 0,
    queueIndex: 0,
    nextSpawnX: 10 // Start position for reading flow (10%)
  });

  // These refs allow the game loop to access the latest props without restarting
  const settingsRef = useRef(settings);
  const gameStateRef = useRef(gameState);
  const wordQueueRef = useRef(wordQueue);

  // We still need state to trigger re-renders so the user sees updates
  const [, setTick] = useState(0);

  // Sync refs with props
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { wordQueueRef.current = wordQueue; }, [wordQueue]);

  const requestRef = useRef<number>();

  const colors = ['bg-yellow-200', 'bg-pink-200', 'bg-blue-200', 'bg-green-200', 'bg-purple-200'];
  const textColors = ['text-yellow-800', 'text-pink-800', 'text-blue-800', 'text-green-800', 'text-purple-800'];

  const spawnWord = () => {
    const queue = wordQueueRef.current;
    const { queueIndex, activeWords } = logicState.current;

    if (queueIndex >= queue.length) {
      if (activeWords.length === 0 && gameStateRef.current === GameState.PLAYING) {
        setGameState(GameState.VICTORY);
        playSound('success');
      }
      return;
    }

    const text = queue[queueIndex];
    logicState.current.queueIndex += 1;

    // Logic for left-to-right reading flow
    // Estimate width in % roughly (base 4% + 2% per char)
    // "a" = 6%. "hipopotam" (9) = 4 + 18 = 22%.
    const textSize = settingsRef.current.textSize;
    const estimatedWidth = (4 + (text.length * 2.0)) * (textSize * 0.8); // Adjust width calculation based on text size scaling
    
    let xPos = logicState.current.nextSpawnX;
    
    // Check if word fits on the right (considering it's centered, check right edge)
    // If xPos + half width > 95%, wrap to next line (start at 10%)
    if (xPos + (estimatedWidth / 2) > 95) {
      xPos = 10; 
    }

    // Update next spawn position for the FOLLOWING word
    // Move cursor: Current Center + Full Width + Gap (from settings)
    const gap = settingsRef.current.wordSpacing;
    logicState.current.nextSpawnX = xPos + estimatedWidth + gap;

    const colorIdx = Math.floor(Math.random() * colors.length);

    const newWord: ActiveWord = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      x: xPos,
      y: -15, // Start further up to slide in smoothly
      color: `${colors[colorIdx]} ${textColors[colorIdx]}`,
      isPopping: false
    };

    logicState.current.activeWords.push(newWord);
  };

  const createParticles = (x: number, y: number, colorClass: string) => {
    // Simple color extraction or default
    const color = '#FFD700'; 
    
    for (let i = 0; i < 8; i++) {
      logicState.current.particles.push({
        id: Math.random().toString(),
        x,
        y,
        color,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        life: 1.0
      });
    }
  };

  const handleWordClick = (wordId: string) => {
    if (gameStateRef.current !== GameState.PLAYING) return;

    const wordIndex = logicState.current.activeWords.findIndex(w => w.id === wordId);
    if (wordIndex === -1) return;

    const word = logicState.current.activeWords[wordIndex];
    if (word.isPopping) return;

    playSound('pop');
    createParticles(word.x, word.y, word.color);
    onScoreUpdate(10, false);

    // Mark for popping animation
    logicState.current.activeWords[wordIndex].isPopping = true;
    
    // Remove after delay (handled in loop or timeout, doing timeout here is easier for singular event)
    setTimeout(() => {
      // Need to filter from the REF directly
      logicState.current.activeWords = logicState.current.activeWords.filter(w => w.id !== wordId);
    }, 300);
  };

  const updateGame = (time: number) => {
    if (gameStateRef.current !== GameState.PLAYING) {
      logicState.current.lastTime = time;
      requestRef.current = requestAnimationFrame(updateGame);
      return;
    }

    // Initialize lastTime on first valid frame
    if (logicState.current.lastTime === 0) {
      logicState.current.lastTime = time;
    }

    const deltaTime = time - logicState.current.lastTime;
    logicState.current.lastTime = time;

    // Cap deltaTime to prevent huge jumps if tab was inactive or lag spike
    const safeDelta = Math.min(deltaTime, 50);

    // 1. Spawning
    const currentSpeed = settingsRef.current.speed;
    const currentSpawnRate = Math.max(1000, 4000 - (currentSpeed * 300));
    
    if (time - logicState.current.lastSpawn > currentSpawnRate) {
      spawnWord();
      logicState.current.lastSpawn = time;
    }

    // 2. Word Physics
    let lifeLost = false;
    const speedMultiplier = 0.02 + (currentSpeed * 0.015);
    
    // Create a new array for next frame to keep immutability principles for React state later
    // but here we are mutating the ref array for performance in loop, then triggering render
    // Actually, safer to map/filter in place or assign new array to ref
    
    const nextWords: ActiveWord[] = [];
    
    for (const word of logicState.current.activeWords) {
      if (word.isPopping) {
        nextWords.push(word);
        continue;
      }

      const moveAmount = speedMultiplier * (safeDelta / 16);
      const newY = word.y + moveAmount;

      if (newY > 95) { // Hit bottom (95% to be safe)
        lifeLost = true;
      } else {
        word.y = newY; // Mutate for performance
        nextWords.push(word);
      }
    }

    logicState.current.activeWords = nextWords;

    if (lifeLost) {
      onLifeLost();
      onScoreUpdate(0, true);
      playSound('miss');
    }

    // 3. Particles Physics
    logicState.current.particles = logicState.current.particles.map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      life: p.life - 0.05
    })).filter(p => p.life > 0);

    // Trigger Render
    setTick(prev => prev + 1);

    requestRef.current = requestAnimationFrame(updateGame);
  };

  // Start/Stop Loop based on mounting
  useEffect(() => {
    // Reset simulation state when component mounts or resets
    logicState.current.lastTime = 0;
    logicState.current.queueIndex = 0;
    logicState.current.activeWords = [];
    logicState.current.particles = [];
    logicState.current.lastSpawn = 0;
    logicState.current.nextSpawnX = 10; // Reset cursor

    requestRef.current = requestAnimationFrame(updateGame);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []); // Empty dependency array = runs once on mount. The loop handles changing props via Refs.

  return (
    <div className="relative w-full h-full overflow-hidden pointer-events-auto touch-none select-none">
      {/* Render Words */}
      {logicState.current.activeWords.map(word => (
        <div
          key={word.id}
          className={`absolute transform -translate-x-1/2 rounded-xl shadow-lg border-b-4 border-opacity-20 border-black
            transition-transform duration-75 cursor-pointer
            ${word.color} 
            ${word.isPopping ? 'word-pop' : 'hover:scale-110 active:scale-95'}
          `}
          style={{
            left: `${word.x}%`,
            top: `${word.y}%`,
            fontSize: `${1.5 * settings.textSize}rem`,
            padding: `${0.5 * settings.textSize}rem ${1.2 * settings.textSize}rem`,
            willChange: 'top, transform' // hint for browser optimization
          }}
          onPointerDown={(e) => {
            // Use PointerDown for immediate response on touch and click
            e.preventDefault();
            handleWordClick(word.id);
          }}
        >
          <span className="font-game-font font-bold">{word.text}</span>
        </div>
      ))}

      {/* Render Particles */}
      {logicState.current.particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: '10px',
            height: '10px',
            backgroundColor: p.color,
            opacity: p.life,
            transform: `scale(${p.life})`
          }}
        />
      ))}
    </div>
  );
};