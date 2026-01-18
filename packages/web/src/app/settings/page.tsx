'use client';

import { useConfig, useAppStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ServiceSelector } from '@/components/prompt/ServiceSelector';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const config = useConfig();
  const updateConfig = useAppStore((state) => state.updateConfig);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure your Multi AI experience
        </p>
      </div>

      {/* Default Services */}
      <Card>
        <CardHeader>
          <CardTitle>Default Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select the AI services you want to use by default
            </p>
            <ServiceSelector />
          </div>
        </CardContent>
      </Card>

      {/* Response Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Response Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stream Responses */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="stream">Stream Responses</Label>
              <p className="text-sm text-gray-600 mt-1">
                Show responses as they arrive in real-time
              </p>
            </div>
            <input
              id="stream"
              type="checkbox"
              checked={config.streamResponses}
              onChange={(e) =>
                updateConfig({ streamResponses: e.target.checked })
              }
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </div>

          {/* Response Timeout */}
          <div>
            <Label htmlFor="timeout">Response Timeout (seconds)</Label>
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              How long to wait for each AI service to respond
            </p>
          </div>
        </CardContent>
      </Card>

      {/* View Settings */}
      <Card>
        <CardHeader>
          <CardTitle>View Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Default View Mode */}
          <div>
            <Label htmlFor="viewMode">Default View Mode</Label>
            <select
              id="viewMode"
              value={config.viewMode}
              onChange={(e) =>
                updateConfig({ viewMode: e.target.value as 'grid' | 'comparison' })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="grid">Grid (3 columns)</option>
              <option value="comparison">Comparison (2 columns)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Choose how responses are displayed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Settings are automatically saved to your
            browser&apos;s local storage. Configuration is stored locally and
            never sent to any server.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
