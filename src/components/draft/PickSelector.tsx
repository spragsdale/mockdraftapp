import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { Player } from '@/types';

interface PickSelectorProps {
  readonly availablePlayers: Player[];
  readonly onSelect: (playerId: string, slot: number) => void;
}

export function PickSelector({ availablePlayers, onSelect }: PickSelectorProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [slot, setSlot] = useState<number>(1);

  const handleSelect = () => {
    if (selectedPlayerId) {
      onSelect(selectedPlayerId, slot);
      setSelectedPlayerId('');
      setSlot(1);
    }
  };

  const selectedPlayer = availablePlayers.find((p) => p.id === selectedPlayerId);

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="player-select" className="text-sm font-medium">Select Player</label>
          <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
            <SelectTrigger id="player-select">
              <SelectValue placeholder="Choose a player..." />
            </SelectTrigger>
            <SelectContent>
              {[...availablePlayers]
                .sort((a, b) => (a.adp || 999) - (b.adp || 999))
                .map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name} - {player.positions.join(', ')} (ADP: {player.adp || 'N/A'})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPlayer && (
          <div className="p-4 border rounded bg-muted/50">
            <div className="space-y-1">
              <div className="font-semibold">{selectedPlayer.name}</div>
              <div className="text-sm text-muted-foreground">
                Positions: {selectedPlayer.positions.join(', ')}
              </div>
              <div className="text-sm text-muted-foreground">ADP: {selectedPlayer.adp || 'N/A'}</div>
              {selectedPlayer.tier && (
                <div className="text-sm text-muted-foreground">Tier: {selectedPlayer.tier}</div>
              )}
              {selectedPlayer.auction_value && (
                <div className="text-sm text-muted-foreground">
                  Auction Value: ${selectedPlayer.auction_value}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="slot-select" className="text-sm font-medium">Roster Slot</label>
          <Select value={slot.toString()} onValueChange={(value) => setSlot(Number.parseInt(value, 10))}>
            <SelectTrigger id="slot-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 25 }, (_, i) => i + 1).map((s) => (
                <SelectItem key={s} value={s.toString()}>
                  Slot {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSelect} disabled={!selectedPlayerId} className="w-full">
          Make Pick
        </Button>
      </CardContent>
    </Card>
  );
}

