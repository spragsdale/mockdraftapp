import React, { useState, useMemo } from 'react';
import { Users, Search, Filter, ChevronUp, ChevronDown } from 'lucide-react';
import type { Player, HittingProjections, PitchingProjections } from '../types';

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface PlayersProps {
  players: Player[];
  hittingProjections: { [key: string]: HittingProjections };
  pitchingProjections: { [key: string]: PitchingProjections };
  availablePositions: string[];
}

export function Players({ 
  players = [], 
  hittingProjections = {}, 
  pitchingProjections = {},
  availablePositions = ['C', '1B', '2B', '3B', 'SS', 'OF', 'P', 'DH']
}: PlayersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePositionToggle = (playerId: string, position: string) => {
    // In a real app, this would update the player's positions in the database
    console.log(`Toggle position ${position} for player ${playerId}`);
  };

  const filteredAndSortedPlayers = useMemo(() => {
    return players
      .filter(player => {
        const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPosition = positionFilter === 'ALL' || player.positions.includes(positionFilter);
        return matchesSearch && matchesPosition;
      })
      .sort((a, b) => {
        const aValue = sortConfig.key === 'name' ? a.name : a.adp;
        const bValue = sortConfig.key === 'name' ? b.name : b.adp;
        const modifier = sortConfig.direction === 'asc' ? 1 : -1;
        
        if (typeof aValue === 'string') {
          return aValue.localeCompare(bValue as string) * modifier;
        }
        return ((aValue as number) - (bValue as number)) * modifier;
      });
  }, [players, searchTerm, positionFilter, sortConfig]);

  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Players</h1>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="rounded-lg border border-gray-300 py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Positions</option>
            {availablePositions.map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none"
                  onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  Player {renderSortIcon('name')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none"
                  onClick={() => handleSort('adp')}>
                <div className="flex items-center gap-1">
                  ADP {renderSortIcon('adp')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Team</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Positions</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Projections</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedPlayers.map(player => (
              <tr key={player.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{player.name}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{player.adp.toFixed(1)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{player.team}</td>
                <td className="px-4 py-3 text-sm">
                  {editingPlayer === player.id ? (
                    <div className="flex flex-wrap gap-2">
                      {availablePositions.map(position => (
                        <label key={position} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={player.positions.includes(position)}
                            onChange={() => handlePositionToggle(player.id, position)}
                            className="rounded"
                          />
                          <span className="text-sm">{position}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {player.positions.map(pos => (
                        <span key={pos} className="px-2 py-1 text-xs font-medium bg-gray-100 rounded">
                          {pos}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {player.positions.includes('P') ? (
                    pitchingProjections[player.id] && (
                      <div className="space-y-1">
                        <div>ERA: {pitchingProjections[player.id].era?.toFixed(2)}</div>
                        <div>WHIP: {pitchingProjections[player.id].whip?.toFixed(2)}</div>
                        <div>K: {pitchingProjections[player.id].strikeouts}</div>
                        <div>W: {pitchingProjections[player.id].wins}</div>
                        <div>SV: {pitchingProjections[player.id].saves}</div>
                      </div>
                    )
                  ) : (
                    hittingProjections[player.id] && (
                      <div className="space-y-1">
                        <div>AVG: {hittingProjections[player.id].avg?.toFixed(3)}</div>
                        <div>HR: {hittingProjections[player.id].hr}</div>
                        <div>RBI: {hittingProjections[player.id].rbi}</div>
                        <div>R: {hittingProjections[player.id].runs}</div>
                        <div>SB: {hittingProjections[player.id].sb}</div>
                      </div>
                    )
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => setEditingPlayer(editingPlayer === player.id ? null : player.id)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {editingPlayer === player.id ? 'Done' : 'Edit Positions'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}