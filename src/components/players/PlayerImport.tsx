import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePlayers } from '@/hooks/usePlayers';
import { useToast } from '@/components/ui/use-toast';
import Papa from 'papaparse';
import type { Player, Position } from '@/types';

export function PlayerImport() {
  const { bulkAddPlayers } = usePlayers();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const parseCSV = (csvText: string): Omit<Player, 'id' | 'created_at' | 'updated_at'>[] => {
    const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    return results.data.map((row: any) => {
      const positions: Position[] = (row.positions || row.position || '')
        .split(',')
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 0) as Position[];

      return {
        name: row.name || row.player || '',
        positions: positions.length > 0 ? positions : ['UTIL'],
        adp: row.adp ? parseFloat(row.adp) : null,
        auction_value: row.auction_value || row.value ? parseFloat(row.auction_value || row.value) : null,
        tier: row.tier ? parseInt(row.tier) : null,
        team: row.team || undefined,
      };
    });
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const players = parseCSV(text);

      if (players.length === 0) {
        toast({
          title: 'Error',
          description: 'No valid players found in file',
          variant: 'destructive',
        });
        return;
      }

      await bulkAddPlayers(players);
      toast({
        title: 'Success',
        description: `Imported ${players.length} players`,
      });
      setFile(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to import players',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Players</CardTitle>
        <CardDescription>Import players from a CSV file</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file">CSV File</Label>
          <Input id="file" type="file" accept=".csv" onChange={handleFileChange} />
          <p className="text-sm text-muted-foreground">
            CSV should have columns: name, positions (comma-separated), adp, auction_value, tier, team
          </p>
        </div>

        <Button onClick={handleImport} disabled={!file || loading} className="w-full">
          {loading ? 'Importing...' : 'Import Players'}
        </Button>
      </CardContent>
    </Card>
  );
}


