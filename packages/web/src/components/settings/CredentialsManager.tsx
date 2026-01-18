'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Upload, Check, X, Shield, FileCode } from 'lucide-react';
import type { AIServiceName, CookieData } from '@multi-ai/core';

interface StoredCredential {
  id: string;
  serviceName: AIServiceName;
  cookies: CookieData[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
}

export function CredentialsManager() {
  const [credentials, setCredentials] = useState<StoredCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadService, setUploadService] = useState<AIServiceName>('chatgpt');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const allServices: AIServiceName[] = ['chatgpt', 'claude', 'gemini', 'perplexity', 'grok', 'deepseek', 'zai'];

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      const response = await fetch('/api/credentials');
      if (response.ok) {
        const data = await response.json();
        setCredentials(data.credentials || []);
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    setMessage(null);

    try {
      const fileContent = await uploadFile.text();
      let cookies: CookieData[];

      if (uploadFile.name.endsWith('.json')) {
        cookies = JSON.parse(fileContent);
      } else {
        // Parse cookies.txt format
        cookies = parseCookiesTxt(fileContent);
      }

      const response = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName: uploadService,
          cookies,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `ACCESS_GRANTED: Credentials for ${uploadService} updated.` });
        setUploadFile(null);
        loadCredentials();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: `ACCESS_DENIED: ${data.error || 'Write operation failed'}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'SYSTEM_ERROR: File parsing failed' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (serviceName: AIServiceName) => {
    if (!confirm(`CONFIRM: PURGE CREDENTIALS FOR ${serviceName.toUpperCase()}?`)) return;

    try {
      const response = await fetch(`/api/credentials?service=${serviceName}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCredentials(credentials.filter((c) => c.serviceName !== serviceName));
      }
    } catch (error) {
      console.error('Error deleting credentials:', error);
    }
  };

  const parseCookiesTxt = (content: string): CookieData[] => {
    const lines = content.split('\n');
    const cookies: CookieData[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const parts = trimmed.split('\t');
      if (parts.length >= 7) {
        cookies.push({
          name: parts[5],
          value: parts[6],
          domain: parts[0],
          path: parts[2],
          expires: parseInt(parts[4], 10) || undefined,
          httpOnly: parts[1] === 'TRUE',
          secure: parts[3] === 'TRUE',
          sameSite: parts[3] === 'TRUE' ? 'None' : 'Lax',
        });
      }
    }

    return cookies;
  };

  const serviceLabels: Record<AIServiceName, string> = {
    chatgpt: 'ChatGPT',
    claude: 'Claude',
    gemini: 'Gemini',
    perplexity: 'Perplexity',
    grok: 'Grok',
    deepseek: 'DeepSeek',
    zai: 'Zai',
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <Card className="border-neon-green/30 shadow-[0_0_20px_rgba(0,255,157,0.1)]">
        <CardHeader className="border-b border-neon-green/20 pb-4">
            <CardTitle className="text-neon-green flex items-center gap-2">
                <Upload className="w-4 h-4" />
                IMPORT_CREDENTIALS
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyber-text-muted mb-2 block">
                  TARGET_SYSTEM
              </label>
              <select
                value={uploadService}
                onChange={(e) => setUploadService(e.target.value as AIServiceName)}
                className="w-full px-4 py-3 bg-cyber-dark border border-white/10 rounded-none focus:outline-none focus:border-neon-green text-white font-mono text-sm uppercase"
              >
                {allServices.map((service) => (
                  <option key={service} value={service}>
                    {serviceLabels[service]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyber-text-muted mb-2 block">
                  DATA_SOURCE (.json / .txt)
              </label>
              <div className="relative">
                  <input
                    type="file"
                    accept=".json,.txt"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full px-4 py-3 bg-cyber-dark border border-white/10 flex items-center justify-between text-sm font-mono text-cyber-text-muted group-hover:border-white/30 transition-colors">
                      <span className={uploadFile ? "text-neon-blue" : ""}>
                          {uploadFile ? uploadFile.name : "SELECT_FILE..."}
                      </span>
                      <FileCode className="w-4 h-4 opacity-50" />
                  </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleFileUpload}
            disabled={!uploadFile || isUploading}
            className="w-full bg-neon-green/10 text-neon-green border-neon-green hover:bg-neon-green hover:text-black"
          >
            {isUploading ? (
                <span className="animate-pulse">UPLOADING_DATA...</span>
            ) : (
                'INITIATE_UPLOAD'
            )}
          </Button>

          {message && (
            <div
              className={`p-3 border text-xs font-mono uppercase tracking-wide flex items-center gap-2 ${
                message.type === 'success' 
                    ? 'bg-neon-green/10 border-neon-green text-neon-green' 
                    : 'bg-neon-pink/10 border-neon-pink text-neon-pink'
              }`}
            >
              {message.type === 'success' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              {message.text}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stored Credentials */}
      <div className="space-y-4">
        <h3 className="text-sm font-display font-bold text-neon-blue uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-2">
            <Shield className="w-4 h-4" />
            SECURE_STORAGE_VAULT
        </h3>

        {isLoading ? (
          <div className="text-cyber-text-muted font-mono text-xs animate-pulse">SCANNING_DATABASE...</div>
        ) : credentials.length === 0 ? (
          <div className="p-8 border border-dashed border-white/10 text-center">
              <p className="text-cyber-text-muted font-mono text-xs uppercase tracking-widest">
                  NO_CREDENTIALS_DETECTED
              </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {credentials.map((cred) => (
              <Card key={cred.id} className="p-0 border-white/10 group hover:border-neon-blue/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between bg-cyber-black/40">
                  <div className="space-y-1">
                    <div className="font-display font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full bg-neon-green shadow-[0_0_5px_rgba(0,255,157,0.5)]`}></span>
                        {serviceLabels[cred.serviceName]}
                    </div>
                    <div className="text-[10px] font-mono text-cyber-text-muted uppercase tracking-wide">
                      COOKIES: <span className="text-neon-blue">{cred.cookies.length}</span> <span className="mx-2">|</span> UPDATED: {new Date(cred.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cred.serviceName)}
                    className="border-neon-pink/30 text-neon-pink hover:bg-neon-pink hover:text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
