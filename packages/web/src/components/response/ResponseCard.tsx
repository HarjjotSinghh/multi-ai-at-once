'use client';

import { AIResponse } from '@multi-ai/core';
import { getServiceMetadata } from '@/lib/services/constants';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Markdown } from '@/components/ui/markdown';
import { Loading } from '@/components/ui/loading';
import { formatDuration, formatTimestamp } from '@/lib/utils/cn';
import { CheckCircle, XCircle, Clock, Terminal } from 'lucide-react';

export interface ResponseCardProps {
  response: AIResponse | null;
  serviceName: string;
  isPending?: boolean;
  error?: string;
}

export function ResponseCard({ response, serviceName, isPending, error }: ResponseCardProps) {
  const metadata = getServiceMetadata(serviceName as any);

  return (
    <Card className="h-full flex flex-col group relative overflow-hidden">
      {/* Scanline decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none z-0"></div>
      
      <CardHeader className="pb-3 relative z-10 bg-cyber-black/40 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
                 <div
                  className="w-2 h-2"
                  style={{ backgroundColor: metadata.color, boxShadow: `0 0 10px ${metadata.color}` }}
                />
                 {isPending && (
                    <div className="absolute inset-0 animate-ping opacity-75 w-2 h-2" style={{ backgroundColor: metadata.color }}></div>
                 )}
            </div>
           
            <CardTitle className="text-xs md:text-sm font-mono tracking-widest text-neon-blue">
                {metadata.displayName}
            </CardTitle>
          </div>

          {!isPending && response && (
            <div className="flex items-center gap-1.5">
              {response.status === 'success' && (
                <Badge variant="success" className="gap-1">
                  <CheckCircle className="w-3 h-3" />
                  200_OK
                </Badge>
              )}
              {response.status === 'error' && (
                <Badge variant="error" className="gap-1">
                  <XCircle className="w-3 h-3" />
                  ERR_500
                </Badge>
              )}
              {response.status === 'timeout' && (
                <Badge variant="warning" className="gap-1">
                  <Clock className="w-3 h-3" />
                  TIMEOUT
                </Badge>
              )}
            </div>
          )}

          {!isPending && error && (
            <Badge variant="error" className="gap-1">
              <XCircle className="w-3 h-3" />
              sys_failure
            </Badge>
          )}
        </div>

        {response && (
          <div className="flex items-center gap-3 text-[10px] font-mono text-cyber-text-muted mt-2 uppercase tracking-widest">
            <span>T+{formatDuration(response.responseTime)}</span>
            <span className="text-neon-green">::</span>
            <span>{formatTimestamp(response.timestamp)}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-auto relative z-10 bg-cyber-dark/30">
        {isPending && (
          <div className="flex flex-col items-center justify-center h-40 text-cyber-text-muted gap-4">
            <Loading size="lg" />
            <div className="text-xs font-mono uppercase tracking-widest text-neon-green animate-pulse">
                DECRYPTING_STREAM<span className="animate-pulse">_</span>
            </div>
          </div>
        )}

        {!isPending && error && (
          <div className="p-4 bg-neon-pink/5 border border-neon-pink/20 text-neon-pink font-mono text-sm shadow-[inset_0_0_20px_rgba(255,0,85,0.1)]">
            &gt; SYSTEM_ERROR: {error}
          </div>
        )}

        {!isPending && response && response.status === 'error' && (
          <div className="p-4 bg-neon-pink/5 border border-neon-pink/20 text-neon-pink font-mono text-sm shadow-[inset_0_0_20px_rgba(255,0,85,0.1)]">
            &gt; PROCESS_TERMINATED: {response.error || 'Unknown Error'}
          </div>
        )}

        {!isPending && response && response.status === 'timeout' && (
          <div className="p-4 bg-neon-yellow/5 border border-neon-yellow/20 text-neon-yellow font-mono text-sm">
            &gt; CONNECTION_LOST: Latency threshold exceeded.
          </div>
        )}

        {!isPending && response && response.status === 'success' && (
          <div className="prose prose-sm max-w-none prose-invert font-mono text-sm prose-p:text-cyber-text prose-headings:text-neon-blue prose-pre:bg-cyber-black prose-pre:border prose-pre:border-white/10 prose-code:text-neon-pink">
            <Markdown content={response.content} />
          </div>
        )}

        {!isPending && !response && !error && (
          <div className="flex flex-col items-center justify-center h-full text-cyber-text-muted/30 py-10">
            <Terminal className="w-8 h-8 mb-2 opacity-20" />
            <span className="text-[10px] font-mono uppercase tracking-widest">Awaiting Input Signal...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
