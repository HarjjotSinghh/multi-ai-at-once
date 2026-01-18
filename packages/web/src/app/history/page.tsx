'use client';

import { HistoryList } from '@/components/response/HistoryList';
import { useHistory, useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export default function HistoryPage() {
  const history = useHistory();
  const clearHistory = useAppStore((state) => state.clearHistory);
  const removeHistoryEntry = useAppStore((state) => state.removeHistoryEntry);

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      clearHistory();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prompt History</h1>
          <p className="text-gray-600 mt-1">
            {history.length} {history.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>

        {history.length > 0 && (
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
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
