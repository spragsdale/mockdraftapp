import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePlayers } from '@/hooks/usePlayers';
import { useToast } from '@/components/ui/use-toast';
import { importHistoryApi } from '@/lib/api/importHistory';
import { playersApi } from '@/lib/api/players';
import { fuzzyMatchPlayerName } from '@/lib/playerMatching';
import { parseHitterProjections, parsePitcherProjections, parseAuctionValues } from '@/lib/csvParsers';
import type { ImportType, ImportHistory } from '@/types';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface UploadSectionProps {
  title: string;
  description: string;
  importType: ImportType;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onUpload: () => Promise<void>;
  loading: boolean;
  lastUpload: ImportHistory | null;
}

function UploadSection({ title, description, importType, file, onFileChange, onUpload, loading, lastUpload }: UploadSectionProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
      <div className="space-y-1">
        <h3 className="font-semibold text-base">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {lastUpload && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-2 rounded border">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span>
            Last uploaded: <span className="font-medium text-foreground">{lastUpload.filename}</span> on {formatDate(lastUpload.uploaded_at)}
          </span>
        </div>
      )}

      {!lastUpload && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-2 rounded border">
          <AlertCircle className="h-4 w-4" />
          <span>No uploads yet</span>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          type="file"
          accept=".csv"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] || null;
            onFileChange(selectedFile);
          }}
          className="flex-1"
          disabled={loading}
        />
        <Button onClick={onUpload} disabled={!file || loading} size="default">
          {loading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
    </div>
  );
}

export function PlayerImport() {
  console.log('[PlayerImport] Component rendering...');
  
  const { players, refetch } = usePlayers();
  const { toast } = useToast();
  
  console.log('[PlayerImport] Hooks initialized, players count:', players?.length || 0);

  const [hitterFile, setHitterFile] = useState<File | null>(null);
  const [pitcherFile, setPitcherFile] = useState<File | null>(null);
  const [auctionFile, setAuctionFile] = useState<File | null>(null);

  const [hitterLoading, setHitterLoading] = useState(false);
  const [pitcherLoading, setPitcherLoading] = useState(false);
  const [auctionLoading, setAuctionLoading] = useState(false);

  const [lastHitterUpload, setLastHitterUpload] = useState<ImportHistory | null>(null);
  const [lastPitcherUpload, setLastPitcherUpload] = useState<ImportHistory | null>(null);
  const [lastAuctionUpload, setLastAuctionUpload] = useState<ImportHistory | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Fetch upload history on mount
  useEffect(() => {
    console.log('[PlayerImport] Component mounted, fetching upload history...');
    setError(null);
    setIsLoadingHistory(true);
    
    const fetchHistory = async () => {
      try {
        console.log('[PlayerImport] Starting to fetch upload history for all types...');
        
        const [hitter, pitcher, auction] = await Promise.all([
          importHistoryApi.getLatest('hitter_projections').catch((err) => {
            console.warn('[PlayerImport] Failed to fetch hitter upload history:', err);
            return null;
          }),
          importHistoryApi.getLatest('pitcher_projections').catch((err) => {
            console.warn('[PlayerImport] Failed to fetch pitcher upload history:', err);
            return null;
          }),
          importHistoryApi.getLatest('auction_values').catch((err) => {
            console.warn('[PlayerImport] Failed to fetch auction upload history:', err);
            return null;
          }),
        ]);
        
        console.log('[PlayerImport] Upload history fetched:', { hitter, pitcher, auction });
        setLastHitterUpload(hitter);
        setLastPitcherUpload(pitcher);
        setLastAuctionUpload(auction);
        setIsLoadingHistory(false);
      } catch (error: any) {
        console.error('[PlayerImport] Critical error fetching upload history:', error);
        console.error('[PlayerImport] Error details:', {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
          stack: error?.stack,
        });
        setError(`Failed to load upload history: ${error?.message || 'Unknown error'}`);
        setIsLoadingHistory(false);
        // Don't crash - upload history is not critical for functionality
      }
    };
    
    fetchHistory();
  }, []);

  // Error boundary wrapper
  if (error && !isLoadingHistory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Import Player Data</CardTitle>
          <CardDescription>Upload player projections and auction values from CSV files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
            <p className="text-sm font-semibold text-destructive mb-2">Error Loading Component</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <p className="text-xs text-muted-foreground">
              Check the browser console (F12) for more details. You can still use the upload functionality below.
            </p>
            <Button
              onClick={() => {
                setError(null);
                setIsLoadingHistory(true);
                window.location.reload();
              }}
              variant="outline"
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleHitterUpload = async () => {
    if (!hitterFile) return;

    setHitterLoading(true);
    let rowsProcessed = 0;
    let rowsSuccessful = 0;

    try {
      const text = await hitterFile.text();
      let parsed;
      try {
        parsed = parseHitterProjections(text);
      } catch (parseError: any) {
        throw new Error(`CSV parsing error: ${parseError?.message || 'Invalid CSV format'}`);
      }
      rowsProcessed = parsed.length;

      if (parsed.length === 0) {
        toast({
          title: 'Error',
          description: 'No valid players found in file',
          variant: 'destructive',
        });
        return;
      }

      // Get all existing players for matching
      const existingPlayers = await playersApi.getAll();

      // Match and update/create players
      const toUpsert: Array<Omit<import('@/types').Player, 'id' | 'created_at' | 'updated_at'>> = [];
      const toUpdate: Array<{ id: string; updates: Partial<import('@/types').Player> }> = [];

      for (const projection of parsed) {
        const matched = fuzzyMatchPlayerName(projection.name, existingPlayers);
        if (matched) {
          // Update existing player with hitter stats
          toUpdate.push({
            id: matched.id,
            updates: {
              name: projection.name,
              team: projection.team || matched.team,
              adp: projection.adp ?? matched.adp,
              g: projection.g,
              pa: projection.pa,
              ab: projection.ab,
              h: projection.h,
              doubles: projection.doubles,
              triples: projection.triples,
              hr: projection.hr,
              runs: projection.runs,
              rbi: projection.rbi,
              bb: projection.bb,
              so: projection.so,
              hbp: projection.hbp,
              sb: projection.sb,
              cs: projection.cs,
              avg: projection.avg,
              obp: projection.obp,
              slg: projection.slg,
              ops: projection.ops,
              woba: projection.woba,
              wrc_plus: projection.wrc_plus,
              bsr: projection.bsr,
              fld: projection.fld,
              off: projection.off,
              def: projection.def,
              war: projection.war,
            },
          });
        } else {
          // Create new player
          toUpsert.push({
            name: projection.name,
            positions: [],
            team: projection.team || undefined,
            adp: projection.adp,
            auction_value: null,
            tier: null,
            g: projection.g,
            pa: projection.pa,
            ab: projection.ab,
            h: projection.h,
            doubles: projection.doubles,
            triples: projection.triples,
            hr: projection.hr,
            runs: projection.runs,
            rbi: projection.rbi,
            bb: projection.bb,
            so: projection.so,
            hbp: projection.hbp,
            sb: projection.sb,
            cs: projection.cs,
            avg: projection.avg,
            obp: projection.obp,
            slg: projection.slg,
            ops: projection.ops,
            woba: projection.woba,
            wrc_plus: projection.wrc_plus,
            bsr: projection.bsr,
            fld: projection.fld,
            off: projection.off,
            def: projection.def,
            war: projection.war,
          });
        }
        rowsSuccessful++;
      }

      // Perform updates and inserts
      if (toUpdate.length > 0) {
        await playersApi.bulkUpdate(toUpdate);
      }
      if (toUpsert.length > 0) {
        await playersApi.bulkCreate(toUpsert);
      }

      // Record upload history
      await importHistoryApi.create({
        import_type: 'hitter_projections',
        filename: hitterFile.name,
        rows_processed: rowsProcessed,
        rows_successful: rowsSuccessful,
        uploaded_at: new Date().toISOString(),
      });

      // Refresh history and players
      const latest = await importHistoryApi.getLatest('hitter_projections');
      setLastHitterUpload(latest);
      await refetch();

      toast({
        title: 'Success',
        description: `Imported ${rowsSuccessful} hitter projections`,
      });
      setHitterFile(null);
    } catch (error: any) {
      console.error('Error importing hitter projections:', error);
      let errorMessage = 'Failed to import hitter projections';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Check for common database errors
      if (errorMessage.includes('column') && errorMessage.includes('does not exist')) {
        errorMessage = 'Database columns missing. Please run migration 003_add_player_stats.sql in Supabase.';
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setHitterLoading(false);
    }
  };

  const handlePitcherUpload = async () => {
    if (!pitcherFile) return;

    setPitcherLoading(true);
    let rowsProcessed = 0;
    let rowsSuccessful = 0;

    try {
      const text = await pitcherFile.text();
      const parsed = parsePitcherProjections(text);
      rowsProcessed = parsed.length;

      if (parsed.length === 0) {
        toast({
          title: 'Error',
          description: 'No valid players found in file',
          variant: 'destructive',
        });
        return;
      }

      // Get all existing players for matching
      const existingPlayers = await playersApi.getAll();

      // Match and update/create players
      const toUpsert: Array<Omit<import('@/types').Player, 'id' | 'created_at' | 'updated_at'>> = [];
      const toUpdate: Array<{ id: string; updates: Partial<import('@/types').Player> }> = [];

      for (const projection of parsed) {
        const matched = fuzzyMatchPlayerName(projection.name, existingPlayers);
        if (matched) {
          // Update existing player with pitcher stats
          toUpdate.push({
            id: matched.id,
            updates: {
              name: projection.name,
              team: projection.team || matched.team,
              adp: projection.adp ?? matched.adp,
              gs: projection.gs,
              g: projection.g,
              ip: projection.ip,
              w: projection.w,
              l: projection.l,
              qs: projection.qs,
              sv: projection.sv,
              hld: projection.hld,
              h: projection.h,
              er: projection.er,
              hr: projection.hr,
              so: projection.so,
              bb: projection.bb,
              whip: projection.whip,
              k_per_9: projection.k_per_9,
              bb_per_9: projection.bb_per_9,
              era: projection.era,
              fip: projection.fip,
              war: projection.war,
              ra9_war: projection.ra9_war,
            },
          });
        } else {
          // Create new player
          toUpsert.push({
            name: projection.name,
            positions: [],
            team: projection.team || undefined,
            adp: projection.adp,
            auction_value: null,
            tier: null,
            gs: projection.gs,
            g: projection.g,
            ip: projection.ip,
            w: projection.w,
            l: projection.l,
            qs: projection.qs,
            sv: projection.sv,
            hld: projection.hld,
            h: projection.h,
            er: projection.er,
            hr: projection.hr,
            so: projection.so,
            bb: projection.bb,
            whip: projection.whip,
            k_per_9: projection.k_per_9,
            bb_per_9: projection.bb_per_9,
            era: projection.era,
            fip: projection.fip,
            war: projection.war,
            ra9_war: projection.ra9_war,
          });
        }
        rowsSuccessful++;
      }

      // Perform updates and inserts
      if (toUpdate.length > 0) {
        await playersApi.bulkUpdate(toUpdate);
      }
      if (toUpsert.length > 0) {
        await playersApi.bulkCreate(toUpsert);
      }

      // Record upload history
      await importHistoryApi.create({
        import_type: 'pitcher_projections',
        filename: pitcherFile.name,
        rows_processed: rowsProcessed,
        rows_successful: rowsSuccessful,
        uploaded_at: new Date().toISOString(),
      });

      // Refresh history and players
      const latest = await importHistoryApi.getLatest('pitcher_projections');
      setLastPitcherUpload(latest);
      await refetch();

      toast({
        title: 'Success',
        description: `Imported ${rowsSuccessful} pitcher projections`,
      });
      setPitcherFile(null);
    } catch (error: any) {
      console.error('Error importing pitcher projections:', error);
      let errorMessage = 'Failed to import pitcher projections';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Check for common database errors
      if (errorMessage.includes('column') && errorMessage.includes('does not exist')) {
        errorMessage = 'Database columns missing. Please run migration 003_add_player_stats.sql in Supabase.';
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setPitcherLoading(false);
    }
  };

  const handleAuctionUpload = async () => {
    if (!auctionFile) return;

    setAuctionLoading(true);
    let rowsProcessed = 0;
    let rowsSuccessful = 0;

    try {
      const text = await auctionFile.text();
      const parsed = parseAuctionValues(text);
      rowsProcessed = parsed.length;

      if (parsed.length === 0) {
        toast({
          title: 'Error',
          description: 'No valid players found in file',
          variant: 'destructive',
        });
        return;
      }

      // Get all existing players for matching
      const existingPlayers = await playersApi.getAll();

      // Match and update players (don't create new ones)
      const toUpdate: Array<{ id: string; updates: Partial<import('@/types').Player> }> = [];

      for (const auction of parsed) {
        const matched = fuzzyMatchPlayerName(auction.name, existingPlayers);
        if (matched) {
          // Update existing player with auction data
          toUpdate.push({
            id: matched.id,
            updates: {
              name: auction.name,
              team: auction.team || matched.team,
              positions: auction.positions.length > 0 ? auction.positions : matched.positions,
              adp: auction.adp ?? matched.adp,
              auction_value: auction.auction_value ?? matched.auction_value,
            },
          });
          rowsSuccessful++;
        }
        // Skip if player not found (don't create new players from auction values)
      }

      // Perform updates
      if (toUpdate.length > 0) {
        await playersApi.bulkUpdate(toUpdate);
      }

      // Record upload history
      await importHistoryApi.create({
        import_type: 'auction_values',
        filename: auctionFile.name,
        rows_processed: rowsProcessed,
        rows_successful: rowsSuccessful,
        uploaded_at: new Date().toISOString(),
      });

      // Refresh history and players
      const latest = await importHistoryApi.getLatest('auction_values');
      setLastAuctionUpload(latest);
      await refetch();

      toast({
        title: 'Success',
        description: `Updated ${rowsSuccessful} players with auction values`,
      });
      setAuctionFile(null);
    } catch (error: any) {
      console.error('Error importing auction values:', error);
      let errorMessage = 'Failed to import auction values';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setAuctionLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Player Data</CardTitle>
        <CardDescription>
          Upload three separate CSV files to import player data. Upload hitter and pitcher projections first, then auction values.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingHistory && (
          <div className="p-2 text-sm text-muted-foreground">
            Loading upload history...
          </div>
        )}
        <UploadSection
          title="1. Hitter Projections CSV"
          description="Upload hitter stat projections and ADP. This file should contain batting statistics (HR, RBI, Runs, SB, AVG, OBP, SLG, etc.) and Average Draft Position for all hitters. Players will be matched by name and updated, or created if they don't exist."
          importType="hitter_projections"
          file={hitterFile}
          onFileChange={setHitterFile}
          onUpload={handleHitterUpload}
          loading={hitterLoading}
          lastUpload={lastHitterUpload}
        />

        <UploadSection
          title="2. Pitcher Projections CSV"
          description="Upload pitcher stat projections and ADP. This file should contain pitching statistics (Wins, Saves, ERA, WHIP, Strikeouts, etc.) and Average Draft Position for all pitchers. Players will be matched by name and updated, or created if they don't exist."
          importType="pitcher_projections"
          file={pitcherFile}
          onFileChange={setPitcherFile}
          onUpload={handlePitcherUpload}
          loading={pitcherLoading}
          lastUpload={lastPitcherUpload}
        />

        <UploadSection
          title="3. Auction Values CSV"
          description="Upload auction dollar values, ADP, positions, and team information. This file should contain player names, their positions, auction values, and ADP. Only existing players will be updated (new players won't be created from this file)."
          importType="auction_values"
          file={auctionFile}
          onFileChange={setAuctionFile}
          onUpload={handleAuctionUpload}
          loading={auctionLoading}
          lastUpload={lastAuctionUpload}
        />
      </CardContent>
    </Card>
  );
}
