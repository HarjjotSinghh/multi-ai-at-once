'use client';

import { PromptComposer } from '@/components/prompt/PromptComposer';
import { ResponseGrid } from '@/components/response/ResponseGrid';
import { Button } from '@/components/ui/button';
import { useConfig, useError, useIsLoading, useActiveRequest, useAppStore } from '@/store';
import { Grid, Columns, Terminal } from 'lucide-react';

export default function HomePage() {
  const config = useConfig();
  const error = useError();
  const isLoading = useIsLoading();
  const activeRequest = useActiveRequest();
  const toggleViewMode = useAppStore((state) => state.toggleViewMode);

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-10 space-y-16 relative">
      {/* Background decoration */}
      <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-neon-blue/5 blur-[100px] pointer-events-none rounded-full" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-neon-pink/5 blur-[100px] pointer-events-none rounded-full" />

      {/* Intro Text */}
      <div className="text-center space-y-4 max-w-2xl mx-auto relative z-10">
        <div className="inline-block border border-neon-green/30 bg-neon-green/5 px-4 py-1 rounded-none mb-4">
             <p className="font-mono text-neon-green text-[10px] uppercase tracking-[0.3em] animate-pulse">
              :: NEURAL_LINK_ESTABLISHED ::
            </p>
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            AWAITING_COMMAND<span className="animate-pulse text-neon-green">_</span>
        </h2>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-neon-pink/10 border border-neon-pink text-neon-pink font-mono text-sm uppercase tracking-widest text-center max-w-2xl mx-auto shadow-[0_0_20px_rgba(255,0,85,0.2)] backdrop-blur-sm">
          &gt; SYSTEM_FAILURE: {error}
        </div>
      )}

      {/* Prompt Composer */}
      <section className="relative z-10">
        <PromptComposer />
      </section>

      {/* View Mode Toggle & Responses */}
      {(isLoading || activeRequest) && (
        <section className="space-y-8 relative z-10">
          <div className="flex items-center justify-between border-b border-neon-blue/30 pb-4">
            <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest flex items-center gap-3">
              <Terminal className="w-5 h-5 text-neon-blue" />
              INCOMING_DATA_STREAM
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleViewMode}
              className="flex items-center gap-2 text-[10px]"
            >
              {config.viewMode === 'grid' ? (
                <>
                  <Columns className="w-3 h-3" />
                  SPLIT_VIEW
                </>
              ) : (
                <>
                  <Grid className="w-3 h-3" />
                  GRID_VIEW
                </>
              )}
            </Button>
          </div>
          <ResponseGrid viewMode={config.viewMode} />
        </section>
      )}
    </main>
  );
}
