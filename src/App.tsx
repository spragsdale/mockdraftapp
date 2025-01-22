import React, { useState } from 'react';
import { Settings } from './components/Settings';
import { FileUpload } from './components/FileUpload';
import { Players } from './components/Players';
import { Positions } from './components/Positions';
import { 
  Settings as SettingsIcon, 
  Upload, 
  Users, 
  List, 
  UserSquare2,
  LayoutGrid
} from 'lucide-react';

type Tab = 'settings' | 'upload' | 'players' | 'draft' | 'positions' | 'rosters';

// Temporary mock data for development
const mockPlayers = [
  {
    id: '1',
    name: 'Mike Trout',
    positions: ['OF'],
    team: 'LAA',
    adp: 1.5,
  },
  {
    id: '2',
    name: 'Shohei Ohtani',
    positions: ['DH', 'P'],
    team: 'LAD',
    adp: 2.1,
    isOhtani: true
  },
  // Add more mock players as needed
];

const mockHittingProjections = {
  '1': {
    playerId: '1',
    avg: 0.295,
    hr: 39,
    rbi: 95,
    runs: 110,
    sb: 15
  }
};

const mockPitchingProjections = {
  '2': {
    playerId: '2',
    era: 2.85,
    whip: 1.05,
    wins: 15,
    saves: 0,
    strikeouts: 220,
    innings: 180,
    qualityStarts: 20
  }
};

const mockLeagueSettings = {
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
  ohtaniRule: 'separate' as const,
  teamNames: Array.from({ length: 12 }, (_, i) => `Team ${i + 1}`)
};

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('settings');

  const tabs = [
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'players', label: 'Players', icon: Users },
    { id: 'draft', label: 'Draft', icon: List },
    { id: 'positions', label: 'Positions', icon: UserSquare2 },
    { id: 'rosters', label: 'Rosters', icon: LayoutGrid },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 
                  ${activeTab === id 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {activeTab === 'settings' && <Settings />}
        {activeTab === 'upload' && <FileUpload 
          onUploadADP={(data) => console.log('ADP:', data)}
          onUploadHitting={(data) => console.log('Hitting:', data)}
          onUploadPitching={(data) => console.log('Pitching:', data)}
        />}
        {activeTab === 'players' && (
          <Players 
            players={mockPlayers}
            hittingProjections={mockHittingProjections}
            pitchingProjections={mockPitchingProjections}
            availablePositions={['C', '1B', '2B', '3B', 'SS', 'OF', 'P', 'DH', 'UTIL']}
          />
        )}
        {activeTab === 'positions' && (
          <Positions
            players={mockPlayers}
            hittingProjections={mockHittingProjections}
            pitchingProjections={mockPitchingProjections}
            leagueSettings={mockLeagueSettings}
          />
        )}
        {/* TODO: Implement remaining tabs */}
      </main>
    </div>
  );
}

export default App;