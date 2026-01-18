'use client';

import { HistoryEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatTimestamp } from '@/lib/utils/cn';
import { Trash2, Eye, FileTerminal } from 'lucide-react';

export interface HistoryListProps {
  entries: HistoryEntry[];
  onSelectEntry?: (entry: HistoryEntry) => void;
  onDeleteEntry?: (id: string) => void;
}

export function HistoryList({ entries, onSelectEntry, onDeleteEntry }: HistoryListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-cyber-black/30 border border-dashed border-white/10 mx-auto w-full group">
        <FileTerminal className="w-12 h-12 text-cyber-text-muted/20 mb-4 group-hover:text-neon-blue/40 transition-colors" />
        <p className="font-mono text-xs text-cyber-text-muted/40 uppercase tracking-[0.2em]">
            NO_ARCHIVED_RECORDS_FOUND
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {entries.map((entry) => (
        <Card key={entry.id} className="group hover:border-neon-blue/30 transition-all duration-300">
          <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4 bg-cyber-black/20">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-[10px] font-mono text-cyber-text-muted uppercase tracking-wider">
                    ID: {entry.id.slice(0, 8)}
                 </span>
                 <span className="w-1 h-1 bg-cyber-text-muted rounded-full opacity-50"></span>
                 <span className="text-[10px] font-mono text-cyber-text-muted uppercase tracking-wider">
                    {formatTimestamp(entry.timestamp)}
                 </span>
              </div>
              <CardTitle className="text-sm md:text-base font-mono font-normal text-neon-blue truncate pr-4">
                {entry.prompt}
              </CardTitle>
            </div>

            <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
              {onSelectEntry && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectEntry(entry)}
                  title="VIEW_RECORD"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              {onDeleteEntry && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteEntry(entry.id)}
                  title="DELETE_RECORD"
                  className="hover:text-neon-pink hover:bg-neon-pink/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="bg-cyber-dark/40">
            <div className="flex flex-wrap gap-2">
              {entry.services.map((service) => {
                const response = entry.responses.find(
                  (r) => r.serviceName === service
                );
                const statusStyle =
                  response?.status === 'success'
                    ? 'border-neon-green/30 text-neon-green bg-neon-green/5'
                    : response?.status === 'error'
                    ? 'border-neon-pink/30 text-neon-pink bg-neon-pink/5'
                    : 'border-neon-yellow/30 text-neon-yellow bg-neon-yellow/5';

                return (
                  <span
                    key={service}
                    className={cn(
                      'inline-flex items-center px-2 py-1 border text-[10px] font-mono uppercase tracking-widest',
                      statusStyle
                    )}
                  >
                    {service}
                  </span>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
