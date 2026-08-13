import React, { useState } from 'react';
import { PlayableGameDefinition, GameConfigurationOverrides } from '../types/gameBuilder.js';

interface GameConfiguratorProps {
  definition: PlayableGameDefinition;
  onApply: (overrides: GameConfigurationOverrides) => void;
  onPlay: () => void;
}

export const GameConfigurator: React.FC<GameConfiguratorProps> = ({ definition, onApply, onPlay }) => {
  const [overrides, setOverrides] = useState<GameConfigurationOverrides>(definition.overrides || {});

  const handleUpdate = (path: string, value: any) => {
    // Basic path-based update
    const newOverrides = { ...overrides };
    // This is a simplified implementation for the demo.
    // In production, we'd use a more robust path setter.
    if (path === 'player.speed') {
      newOverrides.player = { ...newOverrides.player, speed: value };
    } else if (path === 'physics.gravity') {
      newOverrides.physics = { ...newOverrides.physics, gravity: value };
    }
    setOverrides(newOverrides);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 text-white p-4 overflow-y-auto">
      <h2 className="text-2xl mb-4">Game Configurator</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Player Speed: {overrides.player?.speed || definition.physics.movementSpeed}</label>
          <input 
            type="range" 
            min="1" max="20" 
            value={overrides.player?.speed || definition.physics.movementSpeed}
            onChange={(e) => handleUpdate('player.speed', parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>Gravity: {overrides.physics?.gravity || definition.physics.gravity}</label>
          <input 
            type="range" 
            min="0" max="20" step="0.1"
            value={overrides.physics?.gravity || definition.physics.gravity}
            onChange={(e) => handleUpdate('physics.gravity', parseFloat(e.target.value))}
          />
        </div>
      </div>
      <div className="mt-6">
        <button onClick={() => onApply(overrides)} className="bg-blue-600 px-4 py-2 mr-2">Apply Changes</button>
        <button onClick={onPlay} className="bg-green-600 px-4 py-2">Play Game</button>
      </div>
    </div>
  );
};
