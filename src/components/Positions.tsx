import React, { useMemo, useState } from 'react';
import { UserSquare2 } from 'lucide-react';
import type { Player, HittingProjections, PitchingProjections, LeagueSettings } from '../types';

interface PositionsProps {
  players: Player[];
  hittingProjections: { [key: string]: HittingProjections };
  pitchingProjections: { [key: string]: PitchingProjections };
  leagueSettings: LeagueSettings;
}

export function Positions({ 
  players, 
  hittingProjections, 
  pitchingProjections,
  leagueSettings 
}: PositionsProps) {
  const [selectedPosition, setSelectedPosition] = useState<string>('C');

  // Calculate player values based on league settings
  const calculateHitterValue = (playerId: string) => {
    const proj = hittingProjections[playerId];
    if (!proj) return 0;

    let value = 0;
    for (const category of leagueSettings.hittingCategories) {
      switch (category) {
        case 'AVG':
          value += (proj.avg || 0) * 1000; // Weight batting average more heavily
          break;
        case 'HR':
          value += (proj.hr || 0) * 10;
          break;
        case 'RBI':
          value += (proj.rbi || 0) * 5;
          break;
        case 'R':
          value += (proj.runs || 0) * 5;
          break;
        case 'SB':
          value += (proj.sb || 0) * 8;
          break;
        case 'OBP':
          value += (proj.obp || 0) * 1000;
          break;
        case 'SLG':
          value += (proj.slg || 0) * 800;
          break;
        case 'OPS':
          value += (proj.ops || 0) * 900;
          break;
      }
    }
    return value;
  };

  const calculatePitcherValue = (playerId: string) => {
    const proj = pitchingProjections[playerId];
    if (!proj) return 0;

    let value = 0;
    for (const category of leagueSettings.pitchingCategories) {
      switch (category) {
        case 'ERA':
          value += (5 - (proj.era || 5)) * 100; // Lower ERA is better
          break;
        case 'WHIP':
          value += (1.5 - (proj.whip || 1.5)) * 200; // Lower WHIP is better
          break;
        case 'W':
          value += (proj.wins || 0) * 15;
          break;
        case 'SV':
          value += (proj.saves || 0) * 20;
          break;
        case 'K':
          value += (proj.strikeouts || 0) * 5;
          break;
        case 'QS':
          value += (proj.qualityStarts || 0) * 15;
          break;
        case 'K/9':
          value += (proj.kPer9 || 0) * 10;
          break;
        case 'W+QS':
          value += (proj.wPlusQS || 0) * 15;
          break;
        case 'SVH':
          value += (proj.svh || 0) * 15;
          break;
      }
    }
    return value;
  };

  // Get all available positions from league settings
  const availablePositions = useMemo(() => {
    return Object.keys(leagueSettings.positions).filter(pos => pos !== 'BN');
  }, [leagueSettings.positions]);

  // Group and sort players by position and value
  const positionPlayers = useMemo(() => {
    return players
      .filter(player => player.positions.includes(selectedPosition))
      .map(player => ({
        ...player,
        value: player.positions.includes('P') 
          ? calculatePitcherValue(player.id)
          : calculateHitterValue(player.id)
      }))
      .sort((a, b) => b.value - a.value);
  }, [players, selectedPosition, hittingProjections, pitchingProjections, leagueSettings]);

  const getProjectionDisplay = (player: Player) => {
    if (player.positions.includes('P')) {
      const proj = pitchingProjections[player.id];
      if (!proj) return null;
      return (
        <div className="text-sm text-gray-600">
          <div>ERA: {proj.era?.toFixed(2)} | WHIP: {proj.whip?.toFixed(2)}</div>
          <div>W: {proj.wins} | K: {proj.strikeouts} | SV: {proj.saves}</div>
        </div>
      );
    } else {
      const proj = hittingProjections[player.id];
      if (!proj) return null;
      return (
        <div className="text-sm text-gray-600">
          <div>AVG: {proj.avg?.toFixed(3)} | HR: {proj.hr} | RBI: {proj.rbi}</div>
          <div>R: {proj.runs} | SB: {proj.sb}</div>
        </div>
      );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <UserSquare2 className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Positions</h1>
      </div>

      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {availablePositions.map(position => (
          <button
            key={position}
            onClick={() => setSelectedPosition(position)}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedPosition === position
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {position}
            <span className="ml-2 text-sm">
              ({leagueSettings.positions[position]})
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-t-lg font-medium text-sm text-gray-600">
          <div className="col-span-1">Rank</div>
          <div className="col-span-3">Player</div>
          <div className="col-span-2">Team</div>
          <div className="col-span-2">ADP</div>
          <div className="col-span-4">Projections</div>
        </div>
        <div className="divide-y">
          {positionPlayers.map((player, index) => (
            <div key={player.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50">
              <div className="col-span-1 font-medium">{index + 1}</div>
              <div className="col-span-3">
                <div className="font-medium">{player.name}</div>
                <div className="text-sm text-gray-500">
                  {player.positions.join(', ')}
                </div>
              </div>
              <div className="col-span-2">{player.team}</div>
              <div className="col-span-2">{player.adp.toFixed(1)}</div>
              <div className="col-span-4">
                {getProjectionDisplay(player)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}