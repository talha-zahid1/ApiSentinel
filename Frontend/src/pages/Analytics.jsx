import React, { useState, useEffect } from 'react';
import { useApiKey } from '../contexts/ApiKeyContext';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts';
import { 
  ShieldAlert, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Inbox, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const Analytics = () => {
  const { rawKey, metadata } = useApiKey();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    if (!rawKey) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/ApiSentinel/analytics/', {
        headers: {
          'X-Api-Key': rawKey,
        },
      });
      setData(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.detail || err.message || 'Failed to fetch analytics statistics.';
      setError(errMsg);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [rawKey]);

  // Render a custom Tooltip for Recharts that matches our Stripe-like dark style
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg shadow-xl font-sans text-xs">
          <p className="text-zinc-400 font-medium">Endpoint: <span className="text-zinc-200">{payload[0].payload.path}</span></p>
          <p className="text-indigo-400 font-bold mt-0.5">Requests: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  // Render Loading Skeleton
  const Skeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-zinc-900/60 border border-zinc-800/40 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-zinc-900/60 border border-zinc-800/40 rounded-xl animate-pulse" />
        <div className="h-80 bg-zinc-900/60 border border-zinc-800/40 rounded-xl animate-pulse" />
      </div>
      <div className="h-64 bg-zinc-900/60 border border-zinc-800/40 rounded-xl animate-pulse" />
    </div>
  );

  // Render Lock Warning (if raw API key is not in state)
  if (!rawKey) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center animate-scale-up">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900/60 border border-border flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-zinc-500" />
        </div>
        <h3 className="text-lg font-bold text-zinc-200 tracking-tight">Analytics Protected</h3>
        <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
          For security, the full API key is only stored in temporary browser state and cleared after refresh.
          We require the raw key as a header (<code className="bg-zinc-900 px-1 py-0.5 rounded text-indigo-400">X-Api-Key</code>) to access analytics statistics.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="primary">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-lg font-bold text-zinc-200 tracking-tight">API Request Failed</h3>
        <p className="text-sm text-rose-400 mt-2 leading-relaxed">
          {error}
        </p>
        <Button variant="outline" className="mt-6" onClick={fetchAnalytics}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Request
        </Button>
      </div>
    );
  }

  // Show Empty State if total_req is 0 or metadata has no active keys
  const hasNoData = !data || data.total_req === 0 || (!data.req_per_day?.length && !data.top_endpoints?.length);

  if (hasNoData) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900/60 border border-border flex items-center justify-center mx-auto mb-6">
          <Inbox className="w-8 h-8 text-zinc-600" />
        </div>
        <h3 className="text-lg font-bold text-zinc-200 tracking-tight">No Request Logs</h3>
        <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
          No traffic has been logged using this API Key yet. Send some requests using the API Tester to view real-time statistics.
        </p>
        <Link to="/tester">
          <Button variant="primary" className="mt-6">
            Test API Key
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate failed rate
  const failedTotal = data.failed_req?.reduce((acc, curr) => acc + curr.total, 0) || 0;
  const failurePercentage = data.total_req > 0 ? ((failedTotal / data.total_req) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Analytics Overview</h2>
          <p className="text-sm text-zinc-400 mt-1">Real-time statistics for key: <span className="font-mono text-xs text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">{metadata?.prefix}...</span></p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchAnalytics}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Refresh Stats
        </Button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Requests" description="Aggregate hit logs count.">
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold tracking-tight text-zinc-100">{data.total_req}</span>
            <Activity className="w-5 h-5 text-indigo-400 ml-1.5" />
          </div>
        </Card>

        <Card title="Failed Requests" description="Total invalid logs recorded.">
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold tracking-tight text-rose-400">{failedTotal}</span>
            <span className="text-xs font-semibold text-zinc-500">requests</span>
          </div>
        </Card>

        <Card title="Error Rate" description="Failed over total requests.">
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold tracking-tight text-amber-400">{failurePercentage}%</span>
            <TrendingUp className="w-5 h-5 text-amber-500 ml-1.5" />
          </div>
        </Card>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Requests Per Day / Path */}
        <Card title="Requests by Resource" description="Distribution of hit count across resource endpoints.">
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.req_per_day} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="path" 
                  stroke="#71717a" 
                  fontSize={11} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={11} 
                  tickLine={false} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {data.req_per_day?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#6366f1" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Endpoints (Horizontal) */}
        <Card title="Top Endpoints" description="Most active routed paths.">
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data.top_endpoints} 
                layout="vertical"
                margin={{ left: 10, right: 10, top: 10, bottom: 5 }}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <XAxis type="number" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis 
                  dataKey="path" 
                  type="category" 
                  stroke="#71717a" 
                  fontSize={11} 
                  tickLine={false} 
                  width={90}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                  {data.top_endpoints?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#4f46e5" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* FAILED REQUESTS TABLE */}
      <Card title="Failed Request Details" description="Paths encountering server side or authorization exceptions.">
        <div className="mt-4 overflow-x-auto border border-border rounded-lg bg-zinc-950/40">
          {data.failed_req?.length > 0 ? (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-zinc-900/30 text-zinc-400 font-medium">
                  <th className="p-4">Failed Route Path</th>
                  <th className="p-4 text-right">Failure Logs Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.failed_req.map((req, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/20 text-zinc-300">
                    <td className="p-4 font-mono text-xs">{req.path}</td>
                    <td className="p-4 text-right font-semibold text-rose-400">{req.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-zinc-500 text-xs italic">
              No failed requests logged. Excellent reliability!
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
