'use client';

import { HistoryEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatTimestamp } from '@/lib/utils/cn';
import { Trash2, Eye } from 'lucide-react';

export interface HistoryListProps {
  entries: HistoryEntry[];
  onSelectEntry?: (entry: HistoryEntry) => void;
  onDeleteEntry?: (id: string) => void;
}

export function HistoryList({ entries, onSelectEntry, onDeleteEntry }: HistoryListProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          No history yet. Send a prompt to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Card key={entry.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">
                  {entry.prompt}
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimestamp(entry.timestamp)} • {entry.services.length} service
                  {entry.services.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {onSelectEntry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectEntry(entry)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                {onDeleteEntry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteEntry(entry.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap gap-2">
              {entry.services.map((service) => {
                const response = entry.responses.find(
                  (r) => r.serviceName === service
                );
                const statusColor =
                  response?.status === 'success'
                    ? 'bg-green-100 text-green-800'
                    : response?.status === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800';

                return (
                  <span
                    key={service}
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
                      statusColor
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
