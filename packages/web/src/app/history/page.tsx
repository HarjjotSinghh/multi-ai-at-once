'use client';

import { HistoryList } from '@/components/response/HistoryList';
import { useHistory, useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Trash2, Database } from 'lucide-react';

export default function HistoryPage() {
  const history = useHistory();
  const clearHistory = useAppStore((state) => state.clearHistory);
  const removeHistoryEntry = useAppStore((state) => state.removeHistoryEntry);

  const handleClearAll = () => {
    if (confirm('WARNING: PURGE ALL ARCHIVED DATA? THIS ACTION CANNOT BE UNDONE.')) {
      clearHistory();
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white uppercase tracking-widest flex items-center gap-3">
             <Database className="w-6 h-6 text-neon-blue" />
             DATA_ARCHIVES
          </h1>
          <div className="flex items-center gap-2 mt-2">
             <div className="w-2 h-2 bg-neon-green animate-pulse rounded-full"></div>
             <p className="font-mono text-xs text-cyber-text-muted uppercase tracking-widest">
                TOTAL_RECORDS: <span className="text-neon-green">{history.length}</span>
             </p>
          </div>
        </div>

        {history.length > 0 && (
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="flex items-center gap-2 text-xs border-neon-pink/50 text-neon-pink hover:bg-neon-pink/10 hover:shadow-[0_0_15px_rgba(255,0,85,0.2)]"
          >
            <Trash2 className="w-3 h-3" />
            PURGE_DATABASE
          </Button>
        )}
      </div>

      {/* History List */}
      <HistoryList
        entries={history}
        onDeleteEntry={removeHistoryEntry}
      />
    </div>
  );
}
