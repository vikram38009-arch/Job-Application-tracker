// src/components/AnalyticsDashboard.tsx
import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Briefcase, 
  Award, 
  Percent, 
  Loader2, 
  AlertCircle,
  Activity,
  BarChart3
} from 'lucide-react';
import api from '../api';

export interface StatsData {
  total_jobs_by_status: {
    APPLIED: number;
    INTERVIEW: number;
    OFFER: number;
    REJECTED: number;
  };
  weekly_trend_last_6_weeks: Array<{
    week_start: string;
    label: string;
    count: number;
  }>;
  avg_days_to_interview: number;
  total_pipeline_jobs: number;
  total_count: number;
}

const COLORS = {
  APPLIED: '#38bdf8',   // Sky-400
  INTERVIEW: '#fbbf24', // Amber-400 
  OFFER: '#34d399',     // Emerald-400
  REJECTED: '#f87171'   // Rose-400
};

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('applications/stats/');
      setStats(response.data);
    } catch (err: any) {
      console.error('Failed to query system analytics metrics:', err);
      setError('Failed to load application statistics from Django server. Ensure Django and PostgreSQL are online.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex flex-col gap-6 py-12" id="analytics-loader">
        {/* Loading HUD cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-3 animate-pulse">
              <div className="h-4 w-1/3 bg-slate-800 rounded" />
              <div className="h-8 w-1/2 bg-slate-800 rounded" />
              <div className="h-3 w-2/3 bg-slate-800 rounded" />
            </div>
          ))}
        </div>

        {/* Loading charts skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/10 border border-slate-850 p-6 rounded-2xl flex flex-col gap-4 items-center justify-center h-[380px]">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="text-xs text-slate-550 font-medium">Aggregating database status distribution...</span>
          </div>
          <div className="lg:col-span-6 bg-slate-900/10 border border-slate-850 p-6 rounded-2xl flex flex-col gap-4 items-center justify-center h-[380px]">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="text-xs text-slate-550 font-medium">Computing historical timeline coordinates...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-slate-900/20 border border-slate-800/80 p-12 rounded-3xl text-center flex flex-col items-center justify-center gap-4 max-w-2xl mx-auto my-8">
        <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 p-4 rounded-2xl">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-white text-lg tracking-tight">Database Pipeline Error</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {error || 'Unable to connect to the active Django REST Framework. Please make sure the service has compiled successfully.'}
        </p>
        <button
          onClick={fetchStats}
          className="mt-2 text-xs bg-indigo-650 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-md shadow-indigo-600/10"
        >
          Check Connectivity Again
        </button>
      </div>
    );
  }

  // Handle empty state gracefully
  const hasRecords = stats.total_count > 0;

  // Prepare data for status distribution pie chart
  const pieData = [
    { name: 'Applied', value: stats.total_jobs_by_status.APPLIED, key: 'APPLIED' },
    { name: 'Interview', value: stats.total_jobs_by_status.INTERVIEW, key: 'INTERVIEW' },
    { name: 'Offer', value: stats.total_jobs_by_status.OFFER, key: 'OFFER' },
    { name: 'Rejected', value: stats.total_jobs_by_status.REJECTED, key: 'REJECTED' }
  ].filter(item => item.value > 0);

  // Offers & Interviews share percent
  const conversionRate = stats.total_count > 0 
    ? Math.round(((stats.total_jobs_by_status.OFFER + stats.total_jobs_by_status.INTERVIEW) / stats.total_count) * 100) 
    : 0;

  return (
    <div className="w-full flex flex-col gap-6" id="analytics-master-hud">
      {/* HUD Cards Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI Card 1 */}
        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 shadow-md flex items-center gap-4.5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-550/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-550/10 transition-all duration-500" />
          <div className="bg-indigo-600/10 border border-indigo-550/20 p-3.5 rounded-2xl text-indigo-400 shrink-0 select-none">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recruitment Velocity</span>
            <strong className="text-2xl font-black text-white font-mono block mt-1.5 leading-none">
              {stats.avg_days_to_interview > 0 ? `${stats.avg_days_to_interview} Days` : 'N/A'}
            </strong>
            <p className="text-[10px] text-slate-400/80 mt-1">Avg application to interview duration</p>
          </div>
        </div>

        {/* KPI Card 2 */}
        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 shadow-md flex items-center gap-4.5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-550/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-550/10 transition-all duration-500" />
          <div className="bg-amber-500/10 border border-amber-550/20 p-3.5 rounded-2xl text-amber-400 shrink-0 select-none">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Pipeline Rows</span>
            <strong className="text-2xl font-black text-white font-mono block mt-1.5 leading-none">
              {stats.total_pipeline_jobs} Jobs
            </strong>
            <p className="text-[10px] text-slate-400/80 mt-1">Total in Applied or Interview state</p>
          </div>
        </div>

        {/* KPI Card 3 */}
        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 shadow-md flex items-center gap-4.5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-555/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-555/10 transition-all duration-500" />
          <div className="bg-emerald-500/10 border border-emerald-550/20 p-3.5 rounded-2xl text-emerald-400 shrink-0 select-none">
            <Percent className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Positive Return Rate</span>
            <strong className="text-2xl font-black text-white font-mono block mt-1.5 leading-none">
              {conversionRate}%
            </strong>
            <p className="text-[10px] text-slate-400/80 mt-1">Contract offer or interview ratio</p>
          </div>
        </div>
      </div>

      {/* Main visualization charts panel */}
      {!hasRecords ? (
        <div className="bg-slate-900/10 border border-slate-800 py-16 px-6 rounded-2xl text-center flex flex-col items-center justify-center text-slate-400">
          <BarChart3 className="w-10 h-10 text-slate-600 mb-3" />
          <h4 className="font-bold text-white text-md tracking-tight">No metrics available for this account</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Database seeding is recommended. Please use the <strong>"Populate Backend Seeds"</strong> module at the top of the workspace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
          {/* Pie Chart: Status Breakdown */}
          <div className="lg:col-span-5 bg-[#0a0f1d] border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between text-left relative overflow-hidden">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
                <h4 className="font-bold text-xs tracking-wider uppercase text-slate-300">Status Distribution</h4>
              </div>
              <p className="text-[11px] text-slate-400">Current status breakdown over all tracked logs</p>
            </div>

            <div className="h-[240px] flex items-center justify-center relative my-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.key as keyof typeof COLORS] || '#94a3b8'} 
                        stroke="#070b13" 
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#1e293b', 
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontFamily: 'Inter, sans-serif'
                    }} 
                    itemStyle={{ color: '#ffffff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Stats Circle */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-white font-mono">{stats.total_count}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-450 font-bold">Applications</span>
              </div>
            </div>

            {/* Custom Legend to match aesthetics */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-850">
              {pieData.map((item) => (
                <div key={item.key} className="flex items-center gap-2 font-medium">
                  <span 
                    className="h-2.5 w-2.5 rounded shrink-0" 
                    style={{ backgroundColor: COLORS[item.key as keyof typeof COLORS] }} 
                  />
                  <div className="flex justify-between w-full pr-1">
                    <span className="text-slate-300 font-sans">{item.name}</span>
                    <span className="text-slate-400 font-mono font-bold">
                      {item.value} ({Math.round((item.value / stats.total_count) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Area Chart: Trend Last 6 Weeks */}
          <div className="lg:col-span-7 bg-[#0a0f1d] border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
                <h4 className="font-bold text-xs tracking-wider uppercase text-slate-300">Pipeline Growth Velocity</h4>
              </div>
              <p className="text-[11px] text-slate-400">Weekly count of status Applied jobs over the last 6 weeks</p>
            </div>

            <div className="h-[250px] w-full my-4 font-mono select-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.weekly_trend_last_6_weeks}
                  margin={{ top: 12, right: 12, left: -24, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="appliedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/40" opacity={0.3} vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    stroke="#475569" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false}
                    dy={8}
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false} 
                    allowDecimals={false}
                    dx={-4}
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#1e293b', 
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    name="Applied count"
                    stroke="#6366f1" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#appliedGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-450 pt-3 border-t border-slate-850 font-sans font-medium">
              <span>Time Horizon: Last 6 Calendar Weeks</span>
              <span className="flex items-center gap-1 text-indigo-400 font-bold">
                <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-pulse" />
                Real-time DB Coordinates Engaged
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
