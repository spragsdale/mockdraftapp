import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import Papa from 'papaparse';
import type { Player, HittingProjections, PitchingProjections } from '../types';

interface CSVUploadProps {
  onUploadADP: (players: Partial<Player>[]) => void;
  onUploadHitting: (projections: Partial<HittingProjections>[]) => void;
  onUploadPitching: (projections: Partial<PitchingProjections>[]) => void;
}

export function FileUpload({ onUploadADP, onUploadHitting, onUploadPitching }: CSVUploadProps) {
  const [files, setFiles] = useState({
    adp: null as File | null,
    hitting: null as File | null,
    pitching: null as File | null
  });

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processCSV = (file: File, type: keyof typeof files) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(results.errors[0].message);
            return;
          }

          const data = results.data as Record<string, string>[];

          switch (type) {
            case 'adp':
              const players = data.map(row => ({
                id: row.id || String(Math.random()),
                name: row.Name,
                team: row.Team,
                adp: parseFloat(row.ADP) || 999,
                positions: [] // Will be set later when combining with projections
              }));
              resolve(players);
              break;

            case 'hitting':
              const hittingProjections = data.map(row => ({
                playerId: row.id || String(Math.random()),
                avg: parseFloat(row.AVG),
                hr: parseInt(row.HR),
                rbi: parseInt(row.RBI),
                runs: parseInt(row.R),
                sb: parseInt(row.SB),
                obp: parseFloat(row.OBP),
                slg: parseFloat(row.SLG),
                ops: parseFloat(row.OPS)
              }));
              resolve(hittingProjections);
              break;

            case 'pitching':
              const pitchingProjections = data.map(row => ({
                playerId: row.id || String(Math.random()),
                era: parseFloat(row.ERA),
                whip: parseFloat(row.WHIP),
                wins: parseInt(row.W),
                saves: parseInt(row.SV),
                holds: parseInt(row.HLD),
                strikeouts: parseInt(row.SO),
                innings: parseFloat(row.IP),
                qualityStarts: parseInt(row.QS),
                kPer9: parseFloat(row['K/9']),
                wPlusQS: parseInt(row.W) + parseInt(row.QS),
                svh: parseInt(row.SV) + parseInt(row.HLD)
              }));
              resolve(pitchingProjections);
              break;
          }
        },
        error: (error) => {
          reject(error.message);
        }
      });
    });
  };

  const handleFileUpload = (type: keyof typeof files) => async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFiles(prev => ({ ...prev, [type]: file }));
    setError(null);

    try {
      setProcessing(true);
      const data = await processCSV(file, type);
      
      switch (type) {
        case 'adp':
          onUploadADP(data as Partial<Player>[]);
          break;
        case 'hitting':
          onUploadHitting(data as Partial<HittingProjections>[]);
          break;
        case 'pitching':
          onUploadPitching(data as Partial<PitchingProjections>[]);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing file');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Upload className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Upload Projections</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { type: 'adp' as const, label: 'ADP Data' },
          { type: 'hitting' as const, label: 'Hitting Projections' },
          { type: 'pitching' as const, label: 'Pitching Projections' }
        ].map(({ type, label }) => (
          <div key={type} className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">{label}</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload(type)}
                  className="hidden"
                  id={`file-${type}`}
                  disabled={processing}
                />
                <label
                  htmlFor={`file-${type}`}
                  className={`cursor-pointer text-blue-600 hover:text-blue-700 ${
                    processing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {files[type]
                    ? files[type]?.name
                    : 'Click to upload CSV'}
                </label>
              </div>
              {files[type] && (
                <button
                  onClick={() => setFiles(prev => ({ ...prev, [type]: null }))}
                  className="text-red-600 text-sm hover:text-red-700"
                  disabled={processing}
                >
                  Remove file
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={() => console.log('Files:', files)}
          className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
          disabled={!files.adp && !files.hitting && !files.pitching || processing}
        >
          {processing ? 'Processing...' : 'Process Files'}
        </button>
      </div>
    </div>
  );
}