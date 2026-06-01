import React, { useState, useEffect } from 'react';
import { useApiKey } from '../contexts/ApiKeyContext';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { 
  Play, 
  Terminal, 
  CheckCircle, 
  XCircle, 
  Info,
  ShieldCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const ApiTester = () => {
  const { rawKey } = useApiKey();
  const toast = useToast();

  const [testKey, setTestKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  // Pre-fill with session key if available on mount or change
  useEffect(() => {
    if (rawKey) {
      setTestKey(rawKey);
    }
  }, [rawKey]);

  const handleTest = async (e) => {
    e.preventDefault();
    if (!testKey.trim()) {
      toast.error('API key is required to send test request');
      return;
    }

    setLoading(true);
    setResponse(null);
    
    try {
      const startTime = performance.now();
      const res = await api.get('/ApiSentinel/protected/', {
        headers: {
          'X-Api-Key': testKey.trim(),
        },
      });
      const endTime = performance.now();

      setResponse({
        status: res.status,
        statusText: res.statusText || 'OK',
        timeMs: Math.round(endTime - startTime),
        data: res.data,
        success: true,
      });
      toast.success('API test request completed!');
    } catch (err) {
      const endTime = performance.now();
      
      let errorData = err.message;
      let status = err.response?.status || 0;
      let statusText = err.response?.statusText || 'Error';

      if (err.response?.data) {
        errorData = err.response.data;
      }

      setResponse({
        status,
        statusText,
        timeMs: status > 0 ? Math.round(endTime - performance.now()) : 0, // estimate
        data: errorData,
        success: false,
      });
      
      if (status === 401 || status === 403) {
        toast.error('Authentication failed: Invalid or Revoked API Key');
      } else {
        toast.error(`Request failed with status ${status}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status >= 200 && status < 300) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (status >= 400) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Protected API Tester</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Perform a test query against the protected credentials endpoint to verify if your API key is authentic.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Request Parameter Card */}
        <div className="lg:col-span-2 space-y-4">
          <Card title="Request Settings" description="Configure headers for the gateway query.">
            <form onSubmit={handleTest} className="space-y-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Method & Route</span>
                <div className="flex items-center gap-2 bg-zinc-950 p-2.5 rounded-lg border border-border text-xs font-mono select-none">
                  <span className="text-emerald-400 font-bold">GET</span>
                  <span className="text-zinc-400">/ApiSentinel/protected/</span>
                </div>
              </div>

              <Input
                label="X-Api-Key Header"
                placeholder="Enter your API Key..."
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                disabled={loading}
              />

              {!rawKey && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-zinc-900/50 border border-border text-zinc-500 text-xs">
                  <Info className="w-4.5 h-4.5 shrink-0 text-zinc-400" />
                  <p>
                    Session key not loaded. Copy your API Key from creation or rotate to get a new one, then paste it here to run queries.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full"
              >
                <Play className="w-4 h-4 fill-current mr-1" />
                Send Request
              </Button>
            </form>
          </Card>
        </div>

        {/* Response Card */}
        <div className="lg:col-span-3">
          <Card title="Response Log" description="View JSON status payload returned from server.">
            {response ? (
              <div className="space-y-4 mt-1">
                {/* Meta details banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border bg-zinc-950/40 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-medium">Status:</span>
                    <span className={`px-2 py-0.5 border rounded-full font-mono font-bold ${getStatusBadgeClass(response.status)}`}>
                      {response.status} {response.statusText}
                    </span>
                  </div>
                  {response.timeMs > 0 && (
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <span>Latency:</span>
                      <span className="font-semibold text-zinc-300 font-mono">{response.timeMs}ms</span>
                    </div>
                  )}
                </div>

                {/* Validation outcome */}
                <div className={`flex items-start gap-3 p-3.5 rounded-lg border ${
                  response.success 
                    ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' 
                    : 'bg-rose-500/5 border-rose-500/10 text-rose-400'
                }`}>
                  {response.success ? (
                    <>
                      <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
                      <div className="text-xs leading-relaxed">
                        <p className="font-bold text-emerald-200">API Key Authentic</p>
                        <p className="mt-0.5 opacity-80">This credentials validation has checked out successfully. Access is granted to backend services.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                      <div className="text-xs leading-relaxed">
                        <p className="font-bold text-rose-200">Access Denied</p>
                        <p className="mt-0.5 opacity-80">The provided API Key is invalid, expired, or has been revoked. The server rejected the authentication token.</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Body Viewer */}
                <div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">Response Body</span>
                  <pre className="bg-zinc-950 border border-border p-4 rounded-lg overflow-x-auto text-xs font-mono text-indigo-300 max-h-64">
                    <code>{JSON.stringify(response.data, null, 2)}</code>
                  </pre>
                </div>
              </div>
            ) : (
              /* No Request Run yet state */
              <div className="h-64 border border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center p-6 text-center select-none text-zinc-500">
                <Terminal className="w-10 h-10 text-zinc-700 mb-3" />
                <span className="text-sm font-semibold text-zinc-400">Ready to Send Request</span>
                <span className="text-xs text-zinc-500 max-w-xs mt-1">
                  Specify an API key in headers configuration and press "Send Request" to test endpoint status.
                </span>
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};
