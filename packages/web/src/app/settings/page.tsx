'use client';

import { useState } from 'react';
import { useConfig, useAppStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ServiceSelector } from '@/components/prompt/ServiceSelector';
import { Label } from '@/components/ui/label';
import { CredentialsManager } from '@/components/settings/CredentialsManager';
import { Shield, Settings as SettingsIcon, Terminal, Monitor, Cpu, Database } from 'lucide-react';

type Tab = 'general' | 'account';

export default function SettingsPage() {
  const config = useConfig();
  const updateConfig = useAppStore((state) => state.updateConfig);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const [activeTab, setActiveTab] = useState<Tab>('general');

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 py-10">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
           <h1 className="text-3xl font-display font-bold text-white uppercase tracking-widest flex items-center gap-3">
             <SettingsIcon className="w-8 h-8 text-neon-green" />
             SYSTEM_CONFIG
          </h1>
          <div className="flex items-center gap-2 mt-2">
             <div className="w-2 h-2 bg-neon-green animate-pulse rounded-full"></div>
             <p className="font-mono text-xs text-cyber-text-muted uppercase tracking-widest">
                STATUS: <span className="text-neon-green">ONLINE</span>
             </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest border-b-2 transition-all duration-300 ${
            activeTab === 'general'
              ? 'text-neon-green border-neon-green bg-neon-green/5 shadow-[0_0_15px_rgba(0,255,157,0.1)]'
              : 'text-cyber-text-muted border-transparent hover:text-white hover:bg-white/5'
          }`}
        >
          <Cpu className="w-4 h-4" />
          CORE_MODULES
        </button>
        {isAuthenticated && (
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest border-b-2 transition-all duration-300 ${
              activeTab === 'account'
                ? 'text-neon-green border-neon-green bg-neon-green/5 shadow-[0_0_15px_rgba(0,255,157,0.1)]'
                : 'text-cyber-text-muted border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4" />
            SECURITY_LAYER
          </button>
        )}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-8 animate-fade-in">
          {/* Default Services */}
          <Card className="border-neon-green/30 shadow-[0_0_20px_rgba(0,255,157,0.1)]">
            <CardHeader className="border-b border-neon-green/20 pb-4">
              <CardTitle className="text-neon-green flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                DEFAULT_NEURAL_NETWORKS
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-xs font-mono text-cyber-text-muted uppercase tracking-wide">
                  {'// SELECT_ACTIVE_NODES_FOR_DEFAULT_ROUTING'}
                </p>
                <ServiceSelector />
              </div>
            </CardContent>
          </Card>

          {/* Response Settings */}
          <Card className="border-neon-blue/30 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
            <CardHeader className="border-b border-neon-blue/20 pb-4">
              <CardTitle className="text-neon-blue flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                OUTPUT_PARAMETERS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              {/* Stream Responses */}
              <div className="flex items-center justify-between p-4 bg-cyber-black/30 border border-white/5 group hover:border-neon-blue/50 transition-colors">
                <div>
                  <Label htmlFor="stream" className="mb-0 text-neon-blue cursor-pointer">REAL_TIME_STREAMING</Label>
                  <p className="text-[10px] font-mono text-cyber-text-muted uppercase tracking-wider mt-1">
                    [ENABLE] TO RENDER DATA PACKETS AS THEY ARRIVE
                  </p>
                </div>
                <div className="relative">
                    <input
                      id="stream"
                      type="checkbox"
                      checked={config.streamResponses}
                      onChange={(e) =>
                        updateConfig({ streamResponses: e.target.checked })
                      }
                      className="peer sr-only"
                    />
                    <div className="w-11 h-6 bg-cyber-dark border border-white/20 rounded-none peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-neon-blue peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-cyber-text-muted after:border-gray-300 after:border after:rounded-none after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-blue/20 peer-checked:border-neon-blue peer-checked:after:bg-neon-blue"></div>
                </div>
              </div>

              {/* Response Timeout */}
              <div className="p-4 bg-cyber-black/30 border border-white/5 group hover:border-neon-blue/50 transition-colors">
                <Label htmlFor="timeout" className="text-neon-blue">LATENCY_THRESHOLD (SEC)</Label>
                <div className="flex gap-4 items-center">
                    <input
                    id="timeout"
                    type="number"
                    min={10}
                    max={300}
                    value={config.responseTimeout / 1000}
                    onChange={(e) =>
                        updateConfig({
                        responseTimeout: parseInt(e.target.value) * 1000,
                        })
                    }
                    className="block w-24 px-3 py-2 bg-cyber-dark border border-white/10 focus:outline-none focus:border-neon-blue text-white font-mono text-sm"
                    />
                    <div className="flex-1 h-1 bg-cyber-dark relative">
                         <div 
                            className="absolute top-0 left-0 h-full bg-neon-blue" 
                            style={{ width: `${(config.responseTimeout / 300000) * 100}%` }}
                         ></div>
                    </div>
                </div>
                <p className="text-[10px] font-mono text-cyber-text-muted uppercase tracking-wider mt-2">
                  {'// MAX_WAIT_TIME_PER_NODE'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* View Settings */}
          <Card className="border-neon-pink/30 shadow-[0_0_20px_rgba(255,0,85,0.1)]">
            <CardHeader className="border-b border-neon-pink/20 pb-4">
              <CardTitle className="text-neon-pink flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                INTERFACE_LAYOUT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {/* Default View Mode */}
              <div className="p-4 bg-cyber-black/30 border border-white/5 group hover:border-neon-pink/50 transition-colors">
                <Label htmlFor="viewMode" className="text-neon-pink">DEFAULT_VIEWPORT_MODE</Label>
                <select
                  id="viewMode"
                  value={config.viewMode}
                  onChange={(e) =>
                    updateConfig({ viewMode: e.target.value as 'grid' | 'comparison' })
                  }
                  className="mt-1 block w-full px-4 py-3 bg-cyber-dark border border-white/10 focus:outline-none focus:border-neon-pink text-white font-mono text-sm uppercase"
                >
                  <option value="grid">GRID_MATRIX (3 COLUMNS)</option>
                  <option value="comparison">SPLIT_SCREEN (2 COLUMNS)</option>
                </select>
                <p className="text-[10px] font-mono text-cyber-text-muted uppercase tracking-wider mt-2">
                  {'// CONFIGURE_DATA_VISUALIZATION_GRID'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <div className="p-4 border-l-2 border-neon-yellow bg-neon-yellow/5">
              <p className="font-mono text-[10px] text-neon-yellow/80 uppercase tracking-wide">
                &gt; NOTE: CONFIGURATION_DATA IS PERSISTED LOCALLY. NO EXTERNAL TRANSMISSION DETECTED.
              </p>
          </div>
        </div>
      )}

      {/* Account Settings */}
      {activeTab === 'account' && isAuthenticated && (
        <div className="space-y-8 animate-fade-in">
          <Card className="border-neon-green/30 shadow-[0_0_20px_rgba(0,255,157,0.1)]">
            <CardHeader className="border-b border-neon-green/20 pb-4">
              <CardTitle className="text-neon-green flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  ACCESS_CREDENTIALS
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <CredentialsManager />
            </CardContent>
          </Card>

          <div className="p-4 border-l-2 border-neon-green bg-neon-green/5">
            <p className="font-mono text-[10px] text-neon-green/80 uppercase tracking-wide">
                &gt; SECURE_STORAGE_ACTIVE: AES-256-GCM ENCRYPTION ENABLED FOR ALL STORED TOKENS.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
