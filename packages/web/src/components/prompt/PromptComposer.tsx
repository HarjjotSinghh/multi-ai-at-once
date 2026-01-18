'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ServiceSelector } from './ServiceSelector';
import { useConfig, useAppStore } from '@/store';
import { sendPromptAction } from '@/lib/services/prompt';
import { SSEClient } from '@/lib/stream/client';
import { AIServiceName } from '@multi-ai/core';

export function PromptComposer() {
  const [prompt, setPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sseClientRef = useRef<SSEClient | null>(null);

  const config = useConfig();
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);
  const addHistoryEntry = useAppStore((state) => state.addHistoryEntry);
  const setActiveRequest = useAppStore((state) => state.setActiveRequest);
  const updateActiveRequest = useAppStore((state) => state.updateActiveRequest);
  const removeFromPending = useAppStore((state) => state.removeFromPending);
  const addError = useAppStore((state) => state.addError);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!prompt.trim() || config.defaultServices.length === 0) return;

    setIsSending(true);
    setLoading(true);
    setError(null);

    const requestId = crypto.randomUUID();
    const selectedServices = config.defaultServices;

    // Initialize active request state
    setActiveRequest({
      id: requestId,
      prompt,
      services: selectedServices,
      responses: new Map(),
      pending: new Set(selectedServices),
      errors: new Map(),
      startTime: Date.now(),
    });

    try {
      if (config.streamResponses) {
        // Use SSE streaming
        const sseClient = new SSEClient();
        sseClientRef.current = sseClient;

        sseClient.on('init', (event) => {
          console.log('Stream initialized:', event);
        });

        sseClient.on('response', (event) => {
          if (event.service && event.content !== undefined) {
            const serviceName = event.service as AIServiceName;
            updateActiveRequest(serviceName, {
              serviceName,
              content: event.content,
              status: 'success',
              responseTime: Date.now() - Date.now(),
              timestamp: new Date(),
            });
            removeFromPending(serviceName);
          }
        });

        sseClient.on('error', (event) => {
          if (event.service && event.error) {
            const serviceName = event.service as AIServiceName;
            addError(serviceName, event.error);
            removeFromPending(serviceName);
          }
        });

        sseClient.on('progress', (event) => {
          console.log('Progress:', event);
        });

        sseClient.on('complete', async (event) => {
          const state = useAppStore.getState().activeRequest;
          if (state) {
            addHistoryEntry({
              id: requestId,
              prompt,
              services: selectedServices,
              responses: Array.from(state.responses.values()).filter(
                (r): r is NonNullable<typeof r> => r !== null
              ),
              timestamp: new Date(),
            });
          }
          setActiveRequest(null);
          sseClient.disconnect();
          setIsSending(false);
          setLoading(false);
        });

        sseClient.onError((error) => {
          console.error('SSE error:', error);
          setError(error.message);
          sseClient.disconnect();
          setIsSending(false);
          setLoading(false);
        });

        // Connect to stream endpoint
        sseClient.connect(
          `/api/stream?${new URLSearchParams({
            prompt,
            services: selectedServices.join(','),
          })}`
        );

        // For POST request with body, we need to use fetch instead
        const response = await fetch('/api/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            services: selectedServices,
            timeout: config.responseTimeout,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to connect to stream');
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                const event = data as any;

                switch (event.type) {
                  case 'init':
                    console.log('Stream initialized');
                    break;
                  case 'response':
                    if (event.service) {
                      const serviceName = event.service as AIServiceName;
                      updateActiveRequest(serviceName, {
                        serviceName,
                        content: event.content ?? '',
                        status: 'success',
                        responseTime: Date.now() - Date.now(),
                        timestamp: new Date(),
                      });
                      removeFromPending(serviceName);
                    }
                    break;
                  case 'error':
                    if (event.service && event.error) {
                      const serviceName = event.service as AIServiceName;
                      addError(serviceName, event.error);
                      removeFromPending(serviceName);
                    }
                    break;
                  case 'progress':
                    console.log('Progress:', event.progress);
                    break;
                  case 'complete':
                    const state = useAppStore.getState().activeRequest;
                    if (state) {
                      addHistoryEntry({
                        id: requestId,
                        prompt,
                        services: selectedServices,
                        responses: Array.from(state.responses.values()).filter(
                          (r): r is NonNullable<typeof r> => r !== null
                        ),
                        timestamp: new Date(),
                      });
                    }
                    setActiveRequest(null);
                    break;
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }

        setIsSending(false);
        setLoading(false);
      } else {
        // Non-streaming request
        const result = await sendPromptAction(
          prompt,
          selectedServices,
          config.responseTimeout
        );

        addHistoryEntry({
          id: requestId,
          prompt,
          services: selectedServices,
          responses: result.responses,
          timestamp: new Date(),
        });

        setActiveRequest(null);
        setPrompt('');
        setIsSending(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error sending prompt:', error);
      setError(error instanceof Error ? error.message : 'Failed to send prompt');
      setActiveRequest(null);
      setIsSending(false);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="relative mx-auto max-w-5xl">
      {/* Decorative top bar */}
      <div className="flex justify-between items-center mb-2 px-1">
        <div className="flex items-center gap-2 text-[10px] font-mono text-neon-green tracking-widest uppercase">
           <span className="w-2 h-2 bg-neon-green animate-pulse"></span>
           SYSTEM_READY
        </div>
        <div className="text-[10px] font-mono text-cyber-text-muted">ID: {crypto.randomUUID().slice(0,8)}</div>
      </div>
      
      <div className="p-1 bg-gradient-to-br from-white/10 to-transparent">
        <div className="bg-cyber-black/80 backdrop-blur-md p-6 md:p-8 border border-white/5 relative overflow-hidden">
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-neon-green/50"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-neon-green/50"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-neon-green/50"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-neon-green/50"></div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="space-y-3">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-neon-blue mb-2 block">
                01 // SELECT_NEURAL_NETWORKS
              </label>
              <ServiceSelector />
            </div>

            <div className="space-y-3">
              <label htmlFor="prompt" className="text-[10px] font-mono font-bold uppercase tracking-widest text-neon-blue mb-2 block">
                02 // INPUT_SEQUENCE
              </label>
              <Textarea
                ref={textareaRef}
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="> Initiate prompt sequence..."
                className="min-h-[120px] resize-none font-mono text-sm leading-relaxed"
                disabled={isSending}
              />
              <div className="flex justify-between items-center pt-2">
                  <p className="text-[10px] font-mono text-cyber-text-muted uppercase tracking-wider">
                      [CMD] + [ENTER] to EXECUTE
                  </p>
                  <div className="text-[10px] font-mono text-cyber-text-muted uppercase">
                      TARGETS: <span className="text-neon-green">{config.defaultServices.length}</span>
                  </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5">
              <Button
                type="submit"
                disabled={isSending || !prompt.trim() || config.defaultServices.length === 0}
                size="lg"
                className="w-full md:w-auto"
              >
                {isSending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">/</span>
                    PROCESSING...
                  </span>
                ) : (
                  'EXECUTE_SEQUENCE >>'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
