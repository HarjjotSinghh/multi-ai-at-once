'use client';

import { AIServiceName, AIResponse } from '@multi-ai/core';
import { ResponseCard } from './ResponseCard';
import { useActiveRequest, useHistory } from '@/store';
import { cn } from '@/lib/utils/cn';

export interface ResponseGridProps {
  requestId?: string;
  responses?: Map<AIServiceName, AIResponse>;
  pending?: Set<AIServiceName>;
  errors?: Map<AIServiceName, string>;
  viewMode?: 'grid' | 'comparison';
}

export function ResponseGrid({
  requestId,
  responses,
  pending,
  errors,
  viewMode = 'grid',
}: ResponseGridProps) {
  const activeRequest = useActiveRequest();
  const history = useHistory();

  // Use props or fall back to active request
  const displayResponses = responses ?? activeRequest?.responses ?? new Map();
  const displayPending = pending ?? activeRequest?.pending ?? new Set();
  const displayErrors = errors ?? activeRequest?.errors ?? new Map();
  const services =
    activeRequest?.services ?? (displayResponses.size > 0
      ? Array.from(displayResponses.keys())
      : []);

  if (services.length === 0 && !activeRequest) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-cyber-black/30 border border-dashed border-white/10 mx-auto max-w-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none"></div>
        <div className="text-center z-10 space-y-2">
            <h3 className="font-display font-bold text-2xl text-cyber-text-muted/20 uppercase tracking-[0.2em] group-hover:text-neon-blue/40 transition-colors">
                NO_SIGNAL_DETECTED
            </h3>
            <p className="font-mono text-xs text-cyber-text-muted/40 uppercase tracking-widest">
                {'// INITIATE_NEURAL_LINK TO BEGIN'}
            </p>
        </div>
      </div>
    );
  }

  // Grid layout
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ResponseCard
            key={service}
            serviceName={service}
            response={displayResponses.get(service) ?? null}
            isPending={displayPending.has(service)}
            error={displayErrors.get(service)}
          />
        ))}
      </div>
    );
  }

  // Comparison layout (2 columns)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {services.map((service) => (
        <ResponseCard
          key={service}
          serviceName={service}
          response={displayResponses.get(service) ?? null}
          isPending={displayPending.has(service)}
          error={displayErrors.get(service)}
        />
      ))}
    </div>
  );
}
