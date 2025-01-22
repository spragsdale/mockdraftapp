import React, { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import type { LeagueSettings } from '../types';

const defaultSettings: LeagueSettings = {
  hittingCategories: ['AVG', 'HR', 'RBI', 'R', 'SB'],
  pitchingCategories: ['ERA', 'WHIP', 'W', 'SV', 'K'],
  positions: {
    'C': 2,
    '1B': 1,
    '2B': 1,
    '3B': 1,
    'SS': 1,
    'CI': 1,
    'MI': 1,
    'OF': 3,
    'UTIL': 2,
    'P': 9,
    'BN': 5
  },
  numTeams: 12,
  draftOrder: Array.from({ length: 12 }, (_, i) => i + 1),
  ohtaniRule: 'separate',
  teamNames: Array.from({ length: 12 }, (_, i) => `Team ${i + 1}`)
};

export function Settings() {
  const [settings, setSettings] = useState<LeagueSettings>(defaultSettings);

  const handleCategoryChange = (category: string, type: 'hitting' | 'pitching', checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      [`${type}Categories`]: checked 
        ? [...prev[`${type}Categories`], category]
        : prev[`${type}Categories`].filter(c => c !== category)
    }));
  };

  const handlePositionChange = (position: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      positions: {
        ...prev.positions,
        [position]: value
      }
    }));
  };

  const handleTeamNameChange = (index: number, name: string) => {
    setSettings(prev => ({
      ...prev,
      teamNames: prev.teamNames.map((teamName, i) => i === index ? name : teamName)
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="w-6 h-6" />
        <h1 className="text-2xl font-bold">League Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Hitting Categories</h2>
            <div className="space-y-2">
              {['AVG', 'OBP', 'HR', 'RBI', 'R', 'SB', 'OPS', 'SLG'].map(category => (
                <label key={category} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.hittingCategories.includes(category)}
                    onChange={(e) => handleCategoryChange(category, 'hitting', e.target.checked)}
                    className="rounded"
                  />
                  {category}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Pitching Categories</h2>
            <div className="space-y-2">
              {[
                'ERA', 'WHIP', 'W', 'SV', 'K', 'QS', 'IP', 'K/9',
                { id: 'W+QS', label: 'W+QS (Wins + Quality Starts)' },
                { id: 'SVH', label: 'SVH (Saves + Holds)' }
              ].map(category => {
                const id = typeof category === 'string' ? category : category.id;
                const label = typeof category === 'string' ? category : category.label;
                return (
                  <label key={id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.pitchingCategories.includes(id)}
                      onChange={(e) => handleCategoryChange(id, 'pitching', e.target.checked)}
                      className="rounded"
                    />
                    {label}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Roster Positions</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(settings.positions).map(([position, count]) => (
                <div key={position} className="flex items-center gap-2">
                  <label className="w-20">
                    {position}
                    {position === 'CI' && <span className="text-xs text-gray-500 block">1B/3B</span>}
                    {position === 'MI' && <span className="text-xs text-gray-500 block">2B/SS</span>}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={count}
                    onChange={(e) => handlePositionChange(position, parseInt(e.target.value))}
                    className="w-16 rounded border-gray-300"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">League Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Number of Teams</label>
                <input
                  type="number"
                  min="4"
                  max="20"
                  value={settings.numTeams}
                  onChange={(e) => {
                    const numTeams = parseInt(e.target.value);
                    setSettings(prev => ({
                      ...prev,
                      numTeams,
                      draftOrder: Array.from({ length: numTeams }, (_, i) => i + 1),
                      teamNames: prev.teamNames.slice(0, numTeams).concat(
                        Array.from({ length: Math.max(0, numTeams - prev.teamNames.length) }, 
                          (_, i) => `Team ${prev.teamNames.length + i + 1}`)
                      )
                    }));
                  }}
                  className="w-24 rounded border-gray-300"
                />
              </div>

              <div>
                <label className="block mb-2">Shohei Ohtani Rule</label>
                <select
                  value={settings.ohtaniRule}
                  onChange={(e) => setSettings(prev => ({ ...prev, ohtaniRule: e.target.value as 'separate' | 'combined' }))}
                  className="w-full max-w-xs rounded border-gray-300"
                >
                  <option value="separate">Separate Hitter/Pitcher</option>
                  <option value="combined">Combined Player</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Team Names</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {settings.teamNames.map((name, index) => (
            <div key={index} className="flex items-center gap-2">
              <label className="w-20 text-sm">Team {index + 1}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleTeamNameChange(index, e.target.value)}
                className="flex-1 rounded border-gray-300"
                placeholder={`Team ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={() => console.log('Settings saved:', settings)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}