'use client';

import React from 'react';
import { WorldTile, PlayerState } from '@/types/game';
import { Compass, Eye, ShieldAlert, Sparkles, Lock, MapPin, Zap } from 'lucide-react';

interface WorldGridProps {
  tiles: WorldTile[];
  player: PlayerState;
  selectedTile: WorldTile | null;
  onSelectTile: (tile: WorldTile) => void;
  onMovePlayer: (x: number, y: number) => void;
  onToggleSeal: (x: number, y: number) => void;
}

export const WorldGrid: React.FC<WorldGridProps> = ({
  tiles,
  player,
  selectedTile,
  onSelectTile,
  onMovePlayer,
  onToggleSeal,
}) => {
  // Determine grid bounds
  const maxX = Math.max(...tiles.map((t) => t.x));
  const maxY = Math.max(...tiles.map((t) => t.y));
  const gridDimension = maxX + 1;

  const getTileBg = (tile: WorldTile, isPlayerHere: boolean) => {
    if (tile.sealed) {
      return 'bg-purple-950/80 border-purple-500/60 text-purple-200 animate-pulse';
    }
    if (!tile.unlocked) {
      return 'bg-slate-900 border-slate-800 opacity-60 text-slate-600';
    }
    if (isPlayerHere) {
      return 'bg-amber-900/60 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400';
    }

    switch (tile.type) {
      case 'Sect':
        return 'bg-emerald-950/70 border-emerald-500/70 text-emerald-200 hover:bg-emerald-900/80';
      case 'SpiritVein':
        return 'bg-cyan-950/70 border-cyan-400/70 text-cyan-200 hover:bg-cyan-900/80';
      case 'SecretRealm':
        return 'bg-fuchsia-950/70 border-fuchsia-500/70 text-fuchsia-200 hover:bg-fuchsia-900/80';
      case 'AuctionHouse':
        return 'bg-amber-950/70 border-amber-500/70 text-amber-200 hover:bg-amber-900/80';
      case 'AlchemistTower':
        return 'bg-teal-950/70 border-teal-400/70 text-teal-200 hover:bg-teal-900/80';
      case 'DemonForbiddenZone':
        return 'bg-red-950/80 border-red-600/80 text-red-200 hover:bg-red-900/80';
      default:
        return 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80';
    }
  };

  const getTileIcon = (type: WorldTile['type']) => {
    switch (type) {
      case 'Sect':
        return '🏯';
      case 'SpiritVein':
        return '💎';
      case 'SecretRealm':
        return '🌀';
      case 'AuctionHouse':
        return '🏛️';
      case 'AlchemistTower':
        return '🧪';
      case 'DemonForbiddenZone':
        return '☠️';
      case 'AncientRuins':
        return '🏺';
      default:
        return '🌲';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto p-4">
      {/* Grid Canvas Section */}
      <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
              World Grid Map ({gridDimension}x{gridDimension})
            </h2>
            <p className="text-xs text-slate-400">
              Perception Radius: {player.stats.spiritualPerception} | Location: ({player.currentLocation.x},{' '}
              {player.currentLocation.y})
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-amber-950/80 border border-amber-600/50 text-amber-300 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Player Position
            </span>
            <span className="px-2 py-1 rounded bg-purple-950/80 border border-purple-500/50 text-purple-300 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Sealed Spatial Node
            </span>
          </div>
        </div>

        {/* Dynamic Responsive Tile Grid */}
        <div
          className="grid gap-2 justify-center transition-all duration-300"
          style={{
            gridTemplateColumns: `repeat(${gridDimension}, minmax(0, 1fr))`,
          }}
        >
          {tiles.map((tile) => {
            const isPlayerHere =
              tile.x === player.currentLocation.x && tile.y === player.currentLocation.y;
            const isSelected = selectedTile?.x === tile.x && selectedTile?.y === tile.y;

            return (
              <button
                key={`${tile.x}-${tile.y}`}
                onClick={() => onSelectTile(tile)}
                className={`aspect-square p-1 sm:p-2 rounded-lg border text-left flex flex-col justify-between transition-all duration-200 relative group overflow-hidden ${getTileBg(
                  tile,
                  isPlayerHere
                )} ${isSelected ? 'ring-2 ring-cyan-400 scale-[1.03] z-10' : ''}`}
              >
                {/* Top status bar */}
                <div className="flex justify-between items-center w-full text-[10px] sm:text-xs font-mono">
                  <span className="text-slate-400">
                    {tile.x},{tile.y}
                  </span>
                  {tile.sealed && <Lock className="w-3 h-3 text-purple-400 animate-pulse" />}
                  {!tile.unlocked && <Eye className="w-3 h-3 text-slate-600" />}
                </div>

                {/* Center Tile Emoji / Icon */}
                <div className="my-auto text-center">
                  <span className="text-2xl sm:text-3xl filter drop-shadow-md">
                    {tile.unlocked ? getTileIcon(tile.type) : '🌫️'}
                  </span>
                  <p className="text-[10px] sm:text-xs font-semibold truncate mt-1">
                    {tile.unlocked ? tile.name.split(' ')[0] : 'Unexplored'}
                  </p>
                </div>

                {/* Bottom badges */}
                {tile.unlocked && (
                  <div className="flex justify-between items-center w-full text-[9px] sm:text-[10px] text-slate-400">
                    <span className="text-cyan-400 font-bold">{tile.qiDensity.toFixed(1)}x Qi</span>
                    <span className="text-red-400 font-bold">Lvl {tile.dangerLevel}</span>
                  </div>
                )}

                {/* Player Indicator Overlay */}
                {isPlayerHere && (
                  <div className="absolute top-1 right-1 flex items-center justify-center bg-amber-500 rounded-full w-4 h-4 text-[10px] text-slate-950 font-extrabold animate-bounce shadow-md">
                    🧑‍🦯
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Tile Details Panel */}
      <div className="w-full lg:w-80 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
        {selectedTile ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">{getTileIcon(selectedTile.type)}</span>
              <div>
                <h3 className="font-bold text-lg text-slate-100">{selectedTile.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                  {selectedTile.type}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">{selectedTile.description}</p>

            <div className="space-y-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-xs mb-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Qi Density
                </span>
                <span className="font-bold text-cyan-300">{selectedTile.qiDensity.toFixed(1)}x Concentration</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Danger Level
                </span>
                <span className="font-bold text-red-300">Level {selectedTile.dangerLevel}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Feng Shui Flow</span>
                <span className="font-semibold text-amber-300">{selectedTile.fengShuiRating}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Spatial State</span>
                <span className={selectedTile.sealed ? 'text-purple-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {selectedTile.sealed ? 'Sealed / Compressed' : 'Normal Space'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {selectedTile.unlocked ? (
                <>
                  {player.currentLocation.x === selectedTile.x && player.currentLocation.y === selectedTile.y ? (
                    <div className="p-2.5 bg-amber-950/50 border border-amber-600/60 rounded-lg text-center text-xs text-amber-300 font-semibold flex items-center justify-center gap-1">
                      <MapPin className="w-4 h-4 text-amber-400" /> Currently Located Here
                    </div>
                  ) : (
                    <button
                      onClick={() => onMovePlayer(selectedTile.x, selectedTile.y)}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-sm transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Compass className="w-4 h-4" /> Travel To Grid ({selectedTile.x}, {selectedTile.y})
                    </button>
                  )}

                  {player.demonHexesUnlocked.length > 0 && (
                    <button
                      onClick={() => onToggleSeal(selectedTile.x, selectedTile.y)}
                      className="w-full py-2 bg-purple-900/60 hover:bg-purple-800/80 border border-purple-500/60 text-purple-200 font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <Zap className="w-3.5 h-3.5 text-purple-400" />
                      {selectedTile.sealed ? 'Release Spatial Hex' : 'Apply Demon Sealing Hex'}
                    </button>
                  )}
                </>
              ) : (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center text-xs text-slate-500">
                  <Lock className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                  Increase Spiritual Perception or cultivate higher realm to reveal this tile.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
            <Compass className="w-10 h-10 mb-2 opacity-40 animate-pulse" />
            <p className="text-sm font-semibold">Select a map grid tile to inspect</p>
          </div>
        )}
      </div>
    </div>
  );
};
