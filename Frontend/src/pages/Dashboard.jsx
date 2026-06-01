import React, { useState } from 'react';
import { useApiKey } from '../contexts/ApiKeyContext';
import { useToast } from '../components/ui/Toast';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { 
  Copy, 
  Check, 
  RefreshCw, 
  Trash2, 
  AlertTriangle, 
  Info, 
  Lock, 
  Eye, 
  EyeOff, 
  Calendar,
  Key,
  Layers,
  ArrowRight
} from 'lucide-react';

export const Dashboard = () => {
  const { 
    rawKey, 
    metadata, 
    loading, 
    error, 
    generateApiKey, 
    rotateApiKey, 
    revokeApiKey,
    clearKeySession
  } = useApiKey();

  const toast = useToast();

  const [appName, setAppName] = useState('');
  const [showRawKey, setShowRawKey] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isRotateOpen, setIsRotateOpen] = useState(false);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!appName.trim()) {
      toast.error('App name is required');
      return;
    }
    const result = await generateApiKey(appName.trim());
    if (result.success) {
      toast.success('API Key generated successfully!');
      setAppName('');
    } else {
      toast.error(result.error || 'Failed to generate key');
    }
  };

  const handleCopy = () => {
    if (!rawKey) return;
    navigator.clipboard.writeText(rawKey);
    setCopied(true);
    toast.success('API Key copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRotate = async () => {
    setIsRotateOpen(false);
    const result = await rotateApiKey();
    if (result.success) {
      toast.success('API Key rotated successfully! Please save your new key.');
      setShowRawKey(true);
    } else {
      toast.error(result.error || 'Failed to rotate key');
    }
  };

  const handleRevoke = async () => {
    setIsRevokeOpen(false);
    const result = await revokeApiKey();
    if (result.success) {
      toast.success('API Key revoked successfully.');
    } else {
      toast.error(result.error || 'Failed to revoke key');
    }
  };

  const formatExpiry = (dateStr) => {
    if (!dateStr) return 'No expiry date';
    const date = new Date(dateStr);
    // Guard against invalid date strings parsed from local storage
    if (isNaN(date.getTime())) return 'No expiry date';
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if current key is inactive
  const isKeyInactive = metadata?.status === 'Revoked' || metadata?.status === 'Expired';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">API Key Management</h2>
        <p className="text-sm text-zinc-400 mt-1">Generate and rotate security credentials for your applications.</p>
      </div>

      {/* GENERATE CARD */}
      {!metadata ? (
        <div className="max-w-xl animate-scale-up">
          <Card 
            title="Create Application Credentials" 
            description="Generate a unique API key for your backend service to securely authenticate request logs."
          >
            <form onSubmit={handleGenerate} className="space-y-4 mt-2">
              <Input
                label="Application Name"
                placeholder="e.g. Production API Service"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                disabled={loading}
              />
              <Button 
                type="submit" 
                variant="primary" 
                loading={loading}
                className="w-full sm:w-auto"
              >
                Generate API Key
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          </Card>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* ACTIVE KEY MANAGEMENT VIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Key Card */}
            <div className="lg:col-span-2">
              <Card>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <Key className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-100 text-base">{metadata.app_name}</h3>
                      <p className="text-xs text-zinc-500 font-medium mt-0.5">Application Credentials</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={metadata.status} />
                  </div>
                </div>

                {/* API KEY DISPLAY BOX */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">
                      API Key
                    </label>

                    {rawKey ? (
                      /* ONE-TIME RAW KEY VIEW */
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 bg-zinc-950 border border-border p-3.5 rounded-lg select-all font-mono text-sm overflow-x-auto relative">
                          <code className="text-zinc-200 pr-12 whitespace-nowrap block">
                            {showRawKey ? rawKey : `${metadata.prefix || 'key'}.${'•'.repeat(32)}`}
                          </code>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-zinc-950 pl-2">
                            <button
                              onClick={() => setShowRawKey(!showRawKey)}
                              className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-900 transition-colors"
                              title={showRawKey ? 'Hide key' : 'Show key'}
                            >
                              {showRawKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={handleCopy}
                              className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-900 transition-colors"
                              title="Copy API key"
                            >
                              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* WARNING BANNER */}
                        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                          <div className="text-xs font-medium leading-relaxed">
                            <p className="font-semibold text-amber-200">Save this API key now. It will never be shown again.</p>
                            <p className="mt-0.5 text-amber-300/80">For security compliance, this credential is only kept in temporary React state and is never saved to the local storage.</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* METADATA-ONLY MASKED VIEW (Post-Refresh) */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 bg-zinc-900/50 border border-border p-3.5 rounded-lg font-mono text-sm text-zinc-400 select-none">
                          <code>{metadata.prefix || 'key'}.••••••••••••••••••••••••••••••••</code>
                          <Lock className="w-4 h-4 text-zinc-600 mr-1 shrink-0" />
                        </div>

                        {/* INFO BANNER */}
                        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-zinc-900 border border-border text-zinc-400">
                          <Info className="w-5 h-5 shrink-0 text-zinc-500 mt-0.5" />
                          <div className="text-xs leading-relaxed">
                            <p className="font-semibold text-zinc-300">Raw API key is hidden</p>
                            <p className="mt-0.5 text-zinc-400/80">The key is safely registered on the backend, but its raw value cannot be revealed again. You can continue sending API calls or rotate the credentials if you lost your key.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Panel */}
                  <div className="pt-4 border-t border-border flex flex-wrap gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsRotateOpen(true)}
                      disabled={loading || isKeyInactive}
                      title="Rotate key"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
                      Rotate Key
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setIsRevokeOpen(true)}
                      disabled={loading || isKeyInactive}
                      title="Revoke key"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Revoke Credentials
                    </Button>

                    {isKeyInactive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearKeySession}
                      >
                        Generate New Credentials
                      </Button>
                    )}
                  </div>

                  {/* Context Session Alert */}
                  {!rawKey && !isKeyInactive && (
                    <div className="text-xs text-zinc-400 italic bg-zinc-950/40 p-3 rounded-lg border border-border/50 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>Management options are active using your tracking context. To reveal a raw key again, perform a rotation.</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Sidebar Metadata Card */}
            <div>
              <Card title="Key Metadata" description="System details for this key integration.">
                <div className="space-y-4 mt-2">
                  <div className="flex flex-col gap-1 border-b border-border pb-3">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Key Prefix</span>
                    <span className="text-sm font-mono text-zinc-300">{metadata.prefix || 'N/A'}</span>
                  </div>

                  <div className="flex flex-col gap-1 border-b border-border pb-3">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Created For</span>
                    <span className="text-sm font-medium text-zinc-300">{metadata.app_name}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      Expiry Date
                    </span>
                    <span className="text-xs text-zinc-300 font-semibold leading-relaxed">
                      {formatExpiry(metadata.exp_date)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

          </div>
        </div>
      )}

      {/* ROTATION CONFIRMATION MODAL */}
      <Modal
        isOpen={isRotateOpen}
        onClose={() => setIsRotateOpen(false)}
        title="Confirm Key Rotation"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-400 leading-relaxed">
            Are you sure you want to rotate this key? The current API key will be permanently invalidated immediately, and a new one will be generated. Any services utilizing the current key will start failing.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsRotateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleRotate} loading={loading}>
              Rotate Key
            </Button>
          </div>
        </div>
      </Modal>

      {/* REVOCATION CONFIRMATION MODAL */}
      <Modal
        isOpen={isRevokeOpen}
        onClose={() => setIsRevokeOpen(false)}
        title="Revoke Credentials permanently"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20 text-red-400">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
            <p className="text-xs font-semibold">
              Warning: This operation is destructive and cannot be undone. Any traffic using this API key will be rejected permanently.
            </p>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Please confirm that you want to revoke the credentials for <span className="font-semibold text-zinc-200">"{metadata?.app_name}"</span>.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsRevokeOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleRevoke} loading={loading}>
              Revoke Key
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};