/**
 * Zustand store for client-side state management
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIServiceName } from '@multi-ai/core';
import { AppConfig, HistoryEntry, ActiveRequestState } from '@/types';

interface AppState {
  // Configuration
  config: AppConfig;

  // History
  history: HistoryEntry[];

  // Active request (for streaming)
  activeRequest: ActiveRequestState | null;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  updateConfig: (config: Partial<AppConfig>) => void;
  setSelectedServices: (services: AIServiceName[]) => void;
  toggleViewMode: () => void;

  // History actions
  addHistoryEntry: (entry: HistoryEntry) => void;
  clearHistory: () => void;
  removeHistoryEntry: (id: string) => void;

  // Active request actions
  setActiveRequest: (request: ActiveRequestState | null) => void;
  updateActiveRequest: (
    service: AIServiceName,
    response: Parameters<ActiveRequestState['responses']['set']>[1]
  ) => void;
  removeFromPending: (service: AIServiceName) => void;
  addError: (service: AIServiceName, error: string) => void;

  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const defaultConfig: AppConfig = {
  defaultServices: ['chatgpt', 'claude', 'gemini'],
  responseTimeout: 60000,
  streamResponses: true,
  viewMode: 'grid',
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      config: defaultConfig,
      history: [],
      activeRequest: null,
      isLoading: false,
      error: null,

      // Config actions
      updateConfig: (config) =>
        set((state) => ({
          config: { ...state.config, ...config },
        })),

      setSelectedServices: (services) =>
        set((state) => ({
          config: { ...state.config, defaultServices: services },
        })),

      toggleViewMode: () =>
        set((state) => ({
          config: {
            ...state.config,
            viewMode: state.config.viewMode === 'grid' ? 'comparison' : 'grid',
          },
        })),

      // History actions
      addHistoryEntry: (entry) =>
        set((state) => ({
          history: [entry, ...state.history].slice(0, 100), // Keep last 100
        })),

      clearHistory: () => set({ history: [] }),

      removeHistoryEntry: (id) =>
        set((state) => ({
          history: state.history.filter((e) => e.id !== id),
        })),

      // Active request actions
      setActiveRequest: (request) => set({ activeRequest: request }),

      updateActiveRequest: (service, response) =>
        set((state) => {
          if (!state.activeRequest) return state;
          const newResponses = new Map(state.activeRequest.responses);
          newResponses.set(service, response);
          return {
            activeRequest: {
              ...state.activeRequest,
              responses: newResponses,
            },
          };
        }),

      removeFromPending: (service) =>
        set((state) => {
          if (!state.activeRequest) return state;
          const newPending = new Set(state.activeRequest.pending);
          newPending.delete(service);
          return {
            activeRequest: {
              ...state.activeRequest,
              pending: newPending,
            },
          };
        }),

      addError: (service, error) =>
        set((state) => {
          if (!state.activeRequest) return state;
          const newErrors = new Map(state.activeRequest.errors);
          newErrors.set(service, error);
          return {
            activeRequest: {
              ...state.activeRequest,
              errors: newErrors,
            },
          };
        }),

      // UI actions
      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'multi-ai-storage',
      partialize: (state) => ({
        config: state.config,
        history: state.history,
      }),
    }
  )
);

// Selectors
export const useConfig = () => useAppStore((state) => state.config);
export const useHistory = () => useAppStore((state) => state.history);
export const useActiveRequest = () => useAppStore((state) => state.activeRequest);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);
