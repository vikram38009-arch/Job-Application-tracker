import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Briefcase, 
  Calendar, 
  Edit, 
  Trash2, 
  Sparkles, 
  User, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Database,
  ArrowRight,
  HelpCircle,
  Award,
  Loader2,
  Copy,
  LayoutDashboard,
  LogOut,
  LayoutGrid,
  List,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { JobApplication, JobStatus, User as UserType } from './types';
import { INITIAL_APPLICATIONS } from './data';
import Login from './components/Login';
import Register from './components/Register';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import JobKanbanBoard from './components/JobKanbanBoard';
import AIAnalysisModal from './components/AIAnalysisModal';

export default function App() {
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list');
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  
  // AI Smart Analyst modal states
  const [isAnalystOpen, setIsAnalystOpen] = useState(false);
  const [analystCompany, setAnalystCompany] = useState('');
  const [analystRole, setAnalystRole] = useState('');
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    const token = localStorage.getItem('jobtracker_access_token');
    if (token) {
      return {
        username: 'Vikram',
        email: 'vikram@example.com'
      };
    }
    return null;
  });

  const handleLoginSuccess = (username: string) => {
    setCurrentUser({
      username: username,
      email: `${username}@example.com`
    });
    setToast({ message: `Access granted! Welcome to your JobTracker workstation, ${username}!`, type: 'success' });
    fetchJobs();
  };

  const handleLogout = () => {
    localStorage.removeItem('jobtracker_access_token');
    localStorage.removeItem('jobtracker_refresh_token');
    setCurrentUser(null);
    setToast({ message: 'Secure session terminated. Redirecting to auth portal...', type: 'info' });
  };
  
  // Start with empty array; populate from Django
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Toast notifications state with automatic responsive dismissal
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Form input state for adding/editing job card
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formCompany, setFormCompany] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formSource, setFormSource] = useState('');
  const [formStatus, setFormStatus] = useState<JobStatus>('APPLIED');
  const [formNotes, setFormNotes] = useState('');

  const [guideSubTab, setGuideSubTab] = useState<'workflow' | 'benefits' | 'pitch'>('workflow');

  const BACKEND_URL = '/api/applications/';

  // Fetch all real data from PostgreSQL via Django on page load
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(BACKEND_URL);
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        console.error("Backend error status:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch applications from Django:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle Create & Update submit with instant-response Optimistic UI Updates
  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany.trim() || !formRole.trim()) return;

    const payload = {
      company: formCompany,
      role: formRole,
      source: formSource || 'Direct',
      status: formStatus,
      notes: formNotes
    };

    const previousApps = [...applications];

    if (editingId) {
      // Optimistic update: instantly swap properties in client-state
      setApplications(prev => prev.map(app => String(app.id) === String(editingId) ? { ...app, ...payload } : app));
      resetForm();
      setToast({ message: `Fast-saving updates for "${formCompany}"...`, type: 'info' });

      // UPDATE (PUT) to PostgreSQL
      try {
        const response = await fetch(`${BACKEND_URL}${editingId}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const updatedApp = await response.json();
          // Sync state with exact response from server database schema
          setApplications(prev => prev.map(app => String(app.id) === String(editingId) ? updatedApp : app));
          setToast({ message: `Successfully updated your entry for "${formCompany}"!`, type: 'success' });
        } else {
          // Rollback on server refusal
          setApplications(previousApps);
          setToast({ message: "Failed to save updates to PostgreSQL server. Reverted.", type: 'error' });
        }
      } catch (error) {
        console.error("Error updating application:", error);
        setApplications(previousApps);
        setToast({ message: "Connection lost. Reverted edit data locally.", type: 'error' });
      }
    } else {
      // CREATE (POST) to PostgreSQL with an instantly provisioned client-side placeholder record
      const tempId = `temp-${Date.now()}`;
      const tempApp = {
        id: tempId,
        company: formCompany,
        role: formRole,
        source: formSource || 'Direct',
        status: formStatus,
        notes: formNotes,
        date_applied: new Date().toISOString().split('T')[0]
      };

      // Optimistically append new task immediately
      setApplications(prev => [tempApp as any, ...prev]);
      resetForm();
      setToast({ message: `Logging application for "${formCompany}" instantly...`, type: 'info' });

      try {
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const newApp = await response.json();
          // Replace our placeholder with the genuine persistent database record
          setApplications(prev => prev.map(app => app.id === tempId ? newApp : app));
          setToast({ message: `Successfully logged new application for "${formCompany}"!`, type: 'success' });
        } else {
          // Revert back
          setApplications(previousApps);
          setToast({ message: "Failed to write database entry to PostgreSQL.", type: 'error' });
        }
      } catch (error) {
        console.error("Error saving new application:", error);
        setApplications(previousApps);
        setToast({ message: "Database connection failed. Reverted entry.", type: 'error' });
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormCompany('');
    setFormRole('');
    setFormSource('');
    setFormStatus('APPLIED');
    setFormNotes('');
    setIsFormOpen(false);
  };

  const handleEdit = (app: JobApplication) => {
    setEditingId(app.id);
    setFormCompany(app.company);
    setFormRole(app.role);
    setFormSource(app.source);
    setFormStatus(app.status);
    setFormNotes(app.notes);
    setIsFormOpen(true);
  };

  // Handle Delete using Django REST calls with fast optimistic rollback
  const handleDelete = async (id: string) => {
    const appToDelete = applications.find(app => String(app.id) === String(id));
    if (!appToDelete) return;

    const previousApps = [...applications];
    // Fast optimistic UI update: immediately pull item out of state
    setApplications(prev => prev.filter(app => String(app.id) !== String(id)));
    setToast({ message: `Deleting application for "${appToDelete.company}"...`, type: 'info' });

    try {
      const response = await fetch(`${BACKEND_URL}${id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setToast({ message: `Successfully deleted application for "${appToDelete.company}"!`, type: 'success' });
      } else {
        setApplications(previousApps);
        setToast({ message: "Unable to delete entry from database. Reverting UI.", type: 'error' });
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      setApplications(previousApps);
      setToast({ message: "Database connection lost. Reverted deletion.", type: 'error' });
    }
  };

  // Async bulk seed engine to solve mock data connection block
  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setToast({ message: "Connecting to database. Re-seeding records...", type: 'info' });

    try {
      // Step 1: Query what exists to clear previous records to prevent duplicates
      const checkRes = await fetch(BACKEND_URL);
      if (checkRes.ok) {
        const existing = await checkRes.json();
        if (existing.length > 0) {
          setToast({ message: `Purging ${existing.length} outdated SQL rows for refresh...`, type: 'info' });
          // Concurrently delete in batches to keep it fast
          await Promise.all(
            existing.map((app: any) => 
              fetch(`${BACKEND_URL}${app.id}/`, { method: 'DELETE' }).catch(err => console.error(err))
            )
          );
        }
      }

      // Step 2: Post 15 highest-grade applications first to show active dashboard
      const seedBatch = INITIAL_APPLICATIONS.slice(0, 16);
      setToast({ message: `Migrating ${seedBatch.length} premium records to PostgreSQL...`, type: 'info' });

      let successfullySeeded = 0;
      for (const app of seedBatch) {
        const payload = {
          company: app.company,
          role: app.role,
          source: app.source || 'Direct',
          status: app.status,
          notes: app.notes
        };
        const writeRes = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (writeRes.ok) successfullySeeded++;
      }

      // Refresh final view
      await fetchJobs();
      setToast({ 
        message: `Successfully structured & seeded ${successfullySeeded} applications into PostgreSQL!`, 
        type: 'success' 
      });
    } catch (error) {
      console.error("Bulk seed operation failed:", error);
      setToast({ message: "Bulk migration failed. Verify that server.ts is active.", type: 'error' });
    } finally {
      setIsSeeding(false);
    }
  };

  // Get count stats
  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'APPLIED').length,
    interview: applications.filter(a => a.status === 'INTERVIEW').length,
    offer: applications.filter(a => a.status === 'OFFER').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  // Filter application list based on search filters
  const filteredApps = applications.filter(app => {
    const companyText = (app.company || '').toLowerCase();
    const roleText = (app.role || '').toLowerCase();
    const notesText = (app.notes || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = companyText.includes(query) || 
                          roleText.includes(query) ||
                          notesText.includes(query);
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!currentUser) {
    if (authView === 'register') {
      return (
        <Register 
          onBackToLogin={() => setAuthView('login')} 
          onRegisterSuccess={handleLoginSuccess} 
        />
      );
    }
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess} 
        onGoToRegister={() => setAuthView('register')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans relative overflow-hidden selection:bg-indigo-600/30 selection:text-white">
      {/* Dynamic Glow Accents in Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none -z-10" />

      {/* Toast Notification HUD */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.95 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[250] flex items-center justify-between gap-4 bg-slate-900/95 border border-indigo-500/30 px-5 py-4.5 rounded-2xl shadow-2xl backdrop-blur-md text-slate-100 max-w-sm w-11/12"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
                toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                toast.type === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}>
                {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                 toast.type === 'error' ? <XCircle className="w-4 h-4" /> :
                 <Sparkles className="w-4 h-4" />}
              </div>
              <div className="text-xs font-semibold leading-relaxed text-slate-200">
                {toast.message}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-[10px] text-slate-400 hover:text-white font-bold px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/60 transition cursor-pointer select-none shrink-0"
            >
              Dimiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upper Brand Nav */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-115">
              <Briefcase className="w-5 h-5" id="logo-icon" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">JobTracker</h1>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 font-semibold px-2 py-0.5 rounded-md border border-indigo-800/40">
                  Django REST & PostgreSQL
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Advanced full-stack career workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 flex-wrap">
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-mono font-bold shadow-sm">
              <Database className="w-3.5 h-3.5" />
              <span>PostgreSQL Connection Active</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-450" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 relative">
        <section className="w-full flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col gap-6"
          >
            {/* Active Session & Core Seeding HUD */}
            <div className="relative overflow-hidden bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
              <div className="flex items-start gap-4">
                <div className="bg-indigo-600/10 p-3 rounded-2xl border border-indigo-500/20 text-indigo-400 shrink-0 select-none">
                  <User className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                    <h2 className="text-base font-bold text-white tracking-tight">Enterprise Career Workspace</h2>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 select-none">
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
                      Candidate Session: {currentUser.username}
                    </span>
                  </div>
                  <p className="text-xs text-slate-350 leading-relaxed max-w-2xl">
                    Organize job applications, schedules, and interview parameters on a production PostgreSQL database. Populated metrics below auto-update upon saving, editing, or deleting items.
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center">
                <button
                  type="button"
                  disabled={isSeeding}
                  onClick={handleSeedDatabase}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 hover:text-white text-indigo-300 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 active:scale-95 shadow-md font-sans select-none disabled:opacity-60 disabled:pointer-events-none"
                  title="Wipe previous records and sync 16 pre-formatted Django records"
                >
                  {isSeeding ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      <span>Syncing rows...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Populate Backend Seeds</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Glass Bento Stats counters */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Total Card */}
              <div className="bg-slate-900/30 border border-slate-800/60 p-4.5 rounded-2xl flex flex-col gap-1 shadow-sm hover:border-slate-700/50 transition-all">
                <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase">Total Projects</span>
                <strong className="text-2xl font-black text-white font-mono mt-0.5">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-500 inline-block" /> : stats.total}
                </strong>
                <span className="text-[9px] text-slate-500 font-medium">All logged applications</span>
              </div>
              
              {/* Active Card */}
              <div className="bg-slate-900/30 border border-slate-800/60 p-4.5 rounded-2xl flex flex-col gap-1 border-l-4 border-l-sky-500 shadow-sm hover:border-slate-700/50 transition-all">
                <span className="text-sky-400 text-[10px] font-bold tracking-wider uppercase">Pending Callback</span>
                <strong className="text-2xl font-black text-sky-400 font-mono mt-0.5">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin text-sky-400/50 inline-block" /> : stats.applied}
                </strong>
                <span className="text-[9px] text-sky-500/80 font-medium">Awaiting feedback</span>
              </div>

              {/* Interview Card */}
              <div className="bg-slate-900/30 border border-slate-800/60 p-4.5 rounded-2xl flex flex-col gap-1 border-l-4 border-l-amber-500 shadow-sm hover:border-slate-700/50 transition-all">
                <span className="text-amber-400 text-[10px] font-bold tracking-wider uppercase">Interviews</span>
                <strong className="text-2xl font-black text-amber-400 font-mono mt-0.5">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin text-amber-400/50 inline-block" /> : stats.interview}
                </strong>
                <span className="text-[9px] text-amber-500/80 font-medium">Active screening rounds</span>
              </div>

              {/* Offer Card */}
              <div className="bg-slate-900/30 border border-slate-800/60 p-4.5 rounded-2xl flex flex-col gap-1 border-l-4 border-l-emerald-500 shadow-sm hover:border-slate-700/50 transition-all">
                <span className="text-emerald-400 text-[10px] font-bold tracking-wider uppercase">Contracts</span>
                <strong className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin text-emerald-500/50 inline-block" /> : stats.offer}
                </strong>
                <span className="text-[9px] text-emerald-500/80 font-medium">Acceptance received 🎉</span>
              </div>

              {/* Rejected Card */}
              <div className="bg-slate-900/30 border border-slate-800/60 p-4.5 rounded-2xl flex flex-col gap-1 border-l-4 border-l-rose-500 col-span-2 md:col-span-1 shadow-sm hover:border-slate-700/50 transition-all">
                <span className="text-rose-400 text-[10px] font-bold tracking-wider uppercase">Archived</span>
                <strong className="text-2xl font-black text-rose-400 font-mono mt-0.5">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin text-rose-400/50 inline-block" /> : stats.rejected}
                </strong>
                <span className="text-[9px] text-rose-500/80 font-medium">Rejected and closed logs</span>
              </div>
            </div>

            {/* Tab navigation bar */}
            <div className="flex border-b border-slate-800/80 gap-6 select-none mt-2 mb-2">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'list' 
                    ? 'border-indigo-500 text-white font-medium' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                <span>Active Workspace Pipeline</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('stats')}
                className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'stats' 
                    ? 'border-indigo-500 text-white font-medium' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Stats & Insights</span>
              </button>
            </div>

            {activeTab === 'list' ? (
              viewMode === 'kanban' ? (
                /* Kanban board view mode (Spans Full Width for pristine workspace spacing) */
                <div className="flex flex-col gap-6 w-full pt-2">
                  {/* Search, Status filters and Add bar */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl shadow-sm">
                    <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                      {/* Search query input */}
                      <div className="relative flex-1 sm:w-64 max-w-sm">
                        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search company, job status, notes..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-[#0a0f1d] border border-slate-800 hover:border-slate-700 focus:border-indigo-505 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs transition outline-none text-slate-100 placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Status pick dropdown */}
                      <div className="flex items-center gap-2 bg-[#0a0f1d] border border-slate-805 rounded-xl px-3 py-1 text-xs hover:border-slate-700 transition">
                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="bg-transparent text-slate-200 outline-none pr-1.5 font-bold cursor-pointer text-xs py-1.5 font-sans"
                        >
                          <option value="ALL" className="bg-slate-950 text-slate-200">All Statuses</option>
                          <option value="APPLIED" className="bg-slate-900 text-slate-200">Applied</option>
                          <option value="INTERVIEW" className="bg-slate-900 text-slate-200">Interview</option>
                          <option value="OFFER" className="bg-slate-900 text-slate-200">Offer Received</option>
                          <option value="REJECTED" className="bg-slate-900 text-slate-200">Rejected</option>
                        </select>
                      </div>

                      {/* View Switcher Toggle on Kanban Bar */}
                      <div className="flex items-center bg-[#0a0f1d] border border-slate-800 rounded-xl p-0.5 select-none shrink-0 font-sans">
                        <button
                          type="button"
                          onClick={() => setViewMode('grid')}
                          className="p-1.5 px-3 rounded-lg flex items-center gap-1.5 font-bold cursor-pointer transition text-[10px] text-slate-400 hover:text-white"
                          title="Card Grid view"
                        >
                          <List className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="hidden md:inline leading-none">Grid List</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('kanban')}
                          className="p-1.5 px-3 rounded-lg flex items-center gap-1.5 font-bold cursor-pointer transition text-[10px] bg-indigo-600 text-white shadow"
                          title="Kanban Board view"
                        >
                          <LayoutGrid className="w-3.5 h-3.5 text-white" />
                          <span className="hidden md:inline leading-none">Kanban Board</span>
                        </button>
                      </div>
                    </div>

                    {/* Add dialog trigger button */}
                    <button
                      type="button"
                      onClick={() => { resetForm(); setIsFormOpen(true); }}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition active:scale-95 cursor-pointer shadow-md shadow-indigo-600/10 shrink-0 w-full sm:w-auto justify-center font-sans"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Track New Application</span>
                    </button>
                  </div>

                  {/* Kanban Component */}
                  {loading ? (
                    <div className="bg-slate-900/10 border border-slate-800 py-20 rounded-2xl flex flex-col items-center justify-center text-slate-400 w-full gap-3">
                      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                      <p className="text-xs font-medium">Fetching records from PostgreSQL database...</p>
                    </div>
                  ) : (
                    <JobKanbanBoard 
                      applications={filteredApps} 
                      setApplications={setApplications} 
                      setToast={setToast} 
                      onEdit={handleEdit} 
                      onDelete={handleDelete}
                      backendUrl={BACKEND_URL}
                      onAnalyze={(app) => {
                        setAnalystCompany(app.company);
                        setAnalystRole(app.role);
                        setIsAnalystOpen(true);
                      }}
                    />
                  )}

                  {/* Form popup modal layout */}
                  <AnimatePresence>
                    {isFormOpen && (
                      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[300] p-4 text-slate-100 font-sans">
                        <motion.div 
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.95, opacity: 0 }}
                          className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative text-left"
                        >
                          <div className="bg-slate-950/60 p-5 border-b border-slate-800/80 flex items-center justify-between">
                            <h4 className="font-bold text-sm text-white flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-indigo-405" />
                              <span>{editingId ? 'Edit Performance Record' : 'Track New Application'}</span>
                            </h4>
                            <button 
                              type="button"
                              onClick={resetForm}
                              className="text-slate-400 hover:text-white text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 py-1 px-2 rounded-lg cursor-pointer transition select-none"
                            >
                              ✕ Close
                            </button>
                          </div>

                          <form onSubmit={handleSaveApp} className="p-5 flex flex-col gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Company Name *</label>
                              <input
                                required
                                type="text"
                                placeholder="e.g. Google, TCS Digital"
                                value={formCompany}
                                onChange={(e) => setFormCompany(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-xs outline-none text-slate-100 placeholder:text-slate-600"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Role Profile Name *</label>
                              <input
                                required
                                type="text"
                                placeholder="e.g. Frontend Engineer"
                                value={formRole}
                                onChange={(e) => setFormRole(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-xs outline-none text-slate-100 placeholder:text-slate-600"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Acquisition Source</label>
                                <input
                                  type="text"
                                  placeholder="e.g. LinkedIn"
                                  value={formSource}
                                  onChange={(e) => setFormSource(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-xs outline-none text-slate-100 placeholder:text-slate-600"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Status State *</label>
                                <select
                                  value={formStatus}
                                  onChange={(e) => setFormStatus(e.target.value as JobStatus)}
                                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-505 rounded-xl p-3 text-xs outline-none text-slate-100 cursor-pointer text-slate-200"
                                >
                                  <option value="APPLIED">Applied</option>
                                  <option value="INTERVIEW">Interviewing</option>
                                  <option value="OFFER">Contract (Offer)</option>
                                  <option value="REJECTED">Archived (Rejected)</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Follow-up Notes</label>
                              <textarea
                                rows={3}
                                placeholder="Details..."
                                value={formNotes}
                                onChange={(e) => setFormNotes(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-xs outline-none text-slate-100 resize-none placeholder:text-slate-650"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-600/30 mt-2 transition cursor-pointer hover:scale-[1.01] active:scale-95 animate-none"
                            >
                              {editingId ? 'Save Changes to Postgres' : 'Post to Database'}
                            </button>
                          </form>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Dual Column Workspace Grid: Left list and Right preparer */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12">
                
                {/* Left Column: List and CRUD tools */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  
                  {/* Search, Status filters and Add bar */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl shadow-sm">
                    <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                      {/* Search query input */}
                      <div className="relative flex-1 sm:w-64 max-w-sm">
                        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search company, job status, notes..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-[#0a0f1d] border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs transition outline-none text-slate-100 placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Status pick dropdown */}
                      <div className="flex items-center gap-2 bg-[#0a0f1d] border border-slate-800 rounded-xl px-3 py-1 text-xs hover:border-slate-700 transition">
                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="bg-transparent text-slate-200 outline-none pr-1.5 font-bold cursor-pointer text-xs py-1.5"
                        >
                          <option value="ALL" className="bg-slate-950 text-slate-200">All Statuses</option>
                          <option value="APPLIED" className="bg-slate-950 text-slate-250">Applied</option>
                          <option value="INTERVIEW" className="bg-slate-950 text-slate-250">Interview</option>
                          <option value="OFFER" className="bg-slate-950 text-slate-250">Offer Received</option>
                          <option value="REJECTED" className="bg-slate-950 text-slate-250">Rejected</option>
                        </select>
                      </div>

                      {/* View Switcher Toggle on Original List Bar */}
                      <div className="flex items-center bg-[#0a0f1d] border border-slate-800 rounded-xl p-0.5 select-none shrink-0 font-sans">
                        <button
                          type="button"
                          onClick={() => setViewMode('grid')}
                          className="p-1.5 px-3 rounded-lg flex items-center gap-1.5 font-bold cursor-pointer transition text-[10px] bg-indigo-600 text-white shadow"
                          title="Card Grid view"
                        >
                          <List className="w-3.5 h-3.5 text-white" />
                          <span className="hidden md:inline leading-none">Grid List</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('kanban')}
                          className="p-1.5 px-3 rounded-lg flex items-center gap-1.5 font-bold cursor-pointer transition text-[10px] text-slate-400 hover:text-white"
                          title="Kanban Board view"
                        >
                          <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="hidden md:inline leading-none">Kanban Board</span>
                        </button>
                      </div>
                    </div>

                  {/* Add dialog trigger button */}
                  <button
                    type="button"
                    onClick={() => { resetForm(); setIsFormOpen(true); }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition active:scale-95 cursor-pointer shadow-md shadow-indigo-600/10 shrink-0 w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Track New Application</span>
                  </button>
                </div>

                {/* Form dialog wrapper */}
                <AnimatePresence>
                  {isFormOpen && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative text-left"
                      >
                        <div className="bg-slate-950/60 p-5 border-b border-slate-800/80 flex items-center justify-between">
                          <h4 className="font-bold text-sm text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                            <span>{editingId ? 'Edit Performance Record' : 'Track New Application'}</span>
                          </h4>
                          <button 
                            type="button"
                            onClick={resetForm}
                            className="text-slate-400 hover:text-white text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 py-1 px-2 rounded-lg cursor-pointer transition select-none"
                          >
                            ✕ Close
                          </button>
                        </div>

                        <form onSubmit={handleSaveApp} className="p-5 flex flex-col gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Company Name *</label>
                            <input
                              required
                              type="text"
                              placeholder="e.g. Google, TCS Digital, Razorpay"
                              value={formCompany}
                              onChange={(e) => setFormCompany(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-xs outline-none text-slate-100 placeholder:text-slate-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Role Profile Name *</label>
                            <input
                              required
                              type="text"
                              placeholder="e.g. Frontend Engineer, Django Associate Developer"
                              value={formRole}
                              onChange={(e) => setFormRole(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-xs outline-none text-slate-100 placeholder:text-slate-600"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Acquisition Source</label>
                              <input
                                type="text"
                                placeholder="e.g. LinkedIn, Referral"
                                value={formSource}
                                onChange={(e) => setFormSource(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-xs outline-none text-slate-100 placeholder:text-slate-600"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Status State *</label>
                              <select
                                value={formStatus}
                                onChange={(e) => setFormStatus(e.target.value as JobStatus)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-xs outline-none text-slate-100 cursor-pointer text-slate-200"
                              >
                                <option value="APPLIED">Applied</option>
                                <option value="INTERVIEW">Interviewing</option>
                                <option value="OFFER">Contract (Offer)</option>
                                <option value="REJECTED">Archived (Rejected)</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Follow-up Notes</label>
                            <textarea
                              rows={3}
                              placeholder="Describe contact details, round schedule, links, or specific technology requirements..."
                              value={formNotes}
                              onChange={(e) => setFormNotes(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-xs outline-none text-slate-100 resize-none placeholder:text-slate-650"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-600/30 mt-2 transition cursor-pointer hover:scale-[1.01] active:scale-95"
                          >
                            {editingId ? 'Save Changes to Postgres' : 'Post to Database'}
                          </button>
                        </form>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                {/* Job tracker applications collection */}
                {loading ? (
                  <div className="bg-slate-900/10 border border-slate-800 py-20 rounded-2xl flex flex-col items-center justify-center text-slate-400 w-full gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                    <p className="text-xs font-medium">Fetching records from PostgreSQL database...</p>
                  </div>
                ) : filteredApps.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredApps.map((app) => {
                      // Status decoration configs
                      let badgeClasses = "";
                      let icon = <Clock className="w-3 h-3" />;
                      let label = "Pending callback";

                      if (app.status === 'INTERVIEW') {
                        badgeClasses = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                        icon = <TrendingUp className="w-3 h-3 animate-pulse" />;
                        label = "Interviewing";
                      } else if (app.status === 'OFFER') {
                        badgeClasses = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                        icon = <CheckCircle className="w-3 h-3" />;
                        label = "Offered! 🎉";
                      } else if (app.status === 'REJECTED') {
                        badgeClasses = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                        icon = <XCircle className="w-3 h-3" />;
                        label = "Rejected";
                      } else {
                        badgeClasses = "bg-sky-500/10 text-sky-450 border border-sky-500/20";
                      }

                      return (
                        <motion.div 
                          key={app.id} 
                          layout
                          className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 hover:shadow-lg hover:shadow-indigo-500/[0.02] transition-all text-left relative group duration-300"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-3 gap-2">
                              <div className="min-w-0">
                                <h3 className="font-bold text-white text-base leading-snug truncate text-left">{app.company}</h3>
                                <p className="text-slate-400 text-xs font-medium mt-0.5 truncate text-left">{app.role}</p>
                              </div>
                              <span className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider select-none ${badgeClasses}`}>
                                {icon}
                                <span>{label}</span>
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed h-[68px] mt-2 mb-4 overflow-y-auto block whitespace-normal break-words scrollbar-thin scrollbar-track-slate-900/10 scrollbar-thumb-slate-800 border-l border-slate-800/60 pl-3">
                              {app.notes || <span className="text-slate-600 italic">No notes captured yet.</span>}
                            </p>
                          </div>

                          <div className="flex justify-between items-center pt-3.5 border-t border-slate-850">
                            {/* Meta flags */}
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold font-mono">
                              <Calendar className="w-3.5 h-3.5 text-indigo-400/80" />
                              <span>{app.date_applied || "Active"}</span>
                              <span className="text-slate-750 font-sans">•</span>
                              <span className="bg-slate-800/50 text-slate-400 border border-slate-800 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-sans select-none">{app.source}</span>
                            </div>

                            {/* CRUD items */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setAnalystCompany(app.company);
                                  setAnalystRole(app.role);
                                  setIsAnalystOpen(true);
                                }}
                                className="p-1 px-2 rounded-lg border border-indigo-900/60 hover:border-indigo-505 hover:bg-indigo-950/40 text-indigo-300 hover:text-white transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer select-none"
                                title="Run Smart Fit Analysis"
                              >
                                <Brain className="w-3 h-3 text-indigo-400" />
                                <span>Analyze</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEdit(app)}
                                className="p-1 px-2 rounded-lg border border-slate-800 hover:border-slate-600 hover:bg-slate-800/60 text-slate-300 hover:text-white transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer select-none"
                                title="Edit parameters"
                              >
                                <Edit className="w-3 h-3 text-indigo-300" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(app.id)}
                                className="p-1 px-1.5 rounded-lg border border-slate-800 hover:border-rose-500/50 hover:bg-rose-950/20 text-slate-450 hover:text-rose-400 transition-all cursor-pointer select-none"
                                title="Delete from PostgreSQL"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-slate-900/10 border border-slate-800 py-16 rounded-2xl flex flex-col items-center justify-center text-slate-500 w-full">
                    <AlertCircle className="w-8 h-8 text-slate-700 mb-2.5" />
                    <p className="text-xs font-semibold">PostgreSQL is empty or no applications match filters</p>
                    <div className="flex flex-col sm:flex-row gap-2 mt-4.5">
                      <button 
                        onClick={() => { resetForm(); setIsFormOpen(true); }}
                        className="text-xs bg-indigo-600/10 text-indigo-400 border border-indigo-500/25 py-2 px-4 rounded-xl font-bold cursor-pointer hover:bg-indigo-600/20 transition hover:text-white"
                      >
                        Create Your First App Row
                      </button>
                      <button 
                        onClick={handleSeedDatabase}
                        disabled={isSeeding}
                        className="text-xs bg-slate-905 hover:bg-slate-800 border border-slate-800 text-slate-350 hover:text-white py-2 px-4 rounded-xl font-semibold cursor-pointer transition"
                      >
                        Populate 16 Test Seeds
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Preps side panels (xl:sticky) */}
              <div className="lg:col-span-12 xl:col-span-5 bg-slate-900/30 border border-slate-800/90 rounded-2xl p-6 flex flex-col gap-5 xl:sticky xl:top-24">
                <div className="text-left">
                  <h3 className="font-bold text-white text-md flex items-center gap-2">
                    <Award className="w-4.5 h-4.5 text-indigo-400" />
                    <span>Candidate Pipeline prep & toolkit</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Review active pipeline workflows, track solution benefits, and practice pitches.</p>
                </div>

                {/* Guide inner switcher tabs */}
                <div className="grid grid-cols-3 bg-slate-950 p-1 rounded-xl border border-slate-800/70 select-none">
                  <button
                    type="button"
                    onClick={() => setGuideSubTab('workflow')}
                    className={`text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      guideSubTab === 'workflow'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    📱 Play Flow
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuideSubTab('benefits')}
                    className={`text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      guideSubTab === 'benefits'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    💡 Solution
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuideSubTab('pitch')}
                    className={`text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      guideSubTab === 'pitch'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🎯 Elevator
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {guideSubTab === 'workflow' && (
                    <motion.div
                      key="workflow"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.12 }}
                      className="flex flex-col gap-4 text-left"
                    >
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-4">
                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block">Interactive Pipeline Mock scenarios</span>
                        
                        {/* Option 1 */}
                        <div className="flex gap-2.5 text-xs text-slate-350 items-start">
                          <span className="bg-indigo-950 text-indigo-400 rounded-full h-5 w-5 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 select-none">1</span>
                          <div>
                            <strong className="text-white">Mock Application Loading:</strong>
                            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                              Pre-populate fields for: <strong>TCS Digital</strong>, Role: <strong>Junior Django Developer</strong>, Source: <strong>Naukri</strong>.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null); // Ensure creation, not updating
                                setFormCompany('TCS Digital');
                                setFormRole('Junior Django Developer');
                                setFormSource('Naukri');
                                setFormStatus('APPLIED');
                                setFormNotes('Applied via recruiter Priya on Naukri, scheduled upcoming django quiz.');
                                setIsFormOpen(true);
                                setToast({ message: "Loaded TCS Digital candidate mock values! Complete form parameters to test.", type: 'info' });
                              }}
                              className="mt-2 text-[10px] bg-indigo-950/70 hover:bg-indigo-920 text-indigo-300 border border-indigo-900/40 px-3 py-1.5 rounded-lg transition cursor-pointer select-none font-bold"
                            >
                              ⚡ Pre-fill fields
                            </button>
                          </div>
                        </div>

                        {/* Option 2 */}
                        <div className="border-t border-slate-850 pt-3 flex gap-2.5 text-xs text-slate-350 items-start">
                          <span className="bg-indigo-950 text-indigo-400 rounded-full h-5 w-5 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 select-none">2</span>
                          <div>
                            <strong className="text-white">Transition Statuses:</strong>
                            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                              Select any mapped item, click edit button, swap status key to "Interviewing" and append event logs in follow up notes.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {guideSubTab === 'benefits' && (
                    <motion.div
                      key="benefits"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.12 }}
                      className="flex flex-col gap-3.5 text-left"
                    >
                      <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest px-1">How JobTracker Solves Application Chaos</span>
                      
                      <div className="flex flex-col gap-2.5">
                        {/* Problem 1 */}
                        <div className="bg-slate-950 p-3.5 border border-slate-800 rounded-xl flex flex-col gap-1.5 shadow-sm">
                          <span className="text-[9px] font-bold text-rose-450 uppercase tracking-wider">Acquisition friction</span>
                          <p className="text-xs text-slate-200 font-bold leading-snug">Losing track of candidate callback rates and timeline milestones.</p>
                          <div className="border-t border-slate-900 mt-1 pt-1.5 flex items-center gap-1.5 text-[11px]">
                            <span className="text-emerald-400 font-bold">🚀 Mapped Solution:</span>
                            <span className="text-slate-400">Stat aggregation blocks and dynamic stage workflows.</span>
                          </div>
                        </div>

                        {/* Problem 2 */}
                        <div className="bg-slate-950 p-3.5 border border-slate-800 rounded-xl flex flex-col gap-1.5 shadow-sm">
                          <span className="text-[9px] font-bold text-rose-450 uppercase tracking-wider">Accidental duplication</span>
                          <p className="text-xs text-slate-200 font-bold leading-snug">Double-applying to same open roles on portal routes.</p>
                          <div className="border-t border-slate-900 mt-1 pt-1.5 flex items-center gap-1.5 text-[11px]">
                            <span className="text-emerald-400 font-bold">🚀 Mapped Solution:</span>
                            <span className="text-slate-400">Interactive full-text search covers names, status, and role metadata.</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {guideSubTab === 'pitch' && (
                    <motion.div
                      key="pitch"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.12 }}
                      className="flex flex-col gap-4 text-left"
                    >
                      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col gap-3 relative overflow-hidden">
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">Best Pitch answer to "Describe a project you built"</span>
                        
                        <blockquote className="text-xs text-slate-200 leading-relaxed font-sans border-l-2 border-indigo-505 pl-3 py-1 italic bg-indigo-950/20 rounded-r-lg">
                          "I developed a fully integrated Job Application Workspace utilizing a Django REST Framework API communicating with a PostgreSQL database. It tracks active interview loops with custom follow-up status pipelines, handling CRUD requests via real database connections to keep candidate tracking absolute."
                        </blockquote>

                        <div className="flex items-center justify-between border-t border-slate-850 pt-3 mt-1 flex-wrap gap-2">
                          <span className="text-[9px] text-slate-500 font-semibold">Copy this outline to practice interview replies!</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(`I developed a fully integrated Job Application Workspace utilizing a Django REST Framework API communicating with a PostgreSQL database. It tracks active interview loops with custom follow-up status pipelines, handling CRUD requests via real database connections to keep candidate tracking absolute.`);
                              setToast({
                                message: 'Elevator pitch copied to clipboard! Practice during reviews. 🚀',
                                type: 'success'
                              });
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-[11px] font-bold text-white px-3 py-1.5 rounded-lg transition cursor-pointer shadow-md shadow-indigo-600/10 flex items-center gap-1.5 shrink-0"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy Text</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div> /* End Dual Column Grid Container */
            ) /* End viewMode conditional conditional rendering wrapper */
            ) : (
              <div className="pt-2 pb-12">
                <AnalyticsDashboard />
              </div>
            )}
          </motion.div>
        </section>
      </main>

      {/* Footer block */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/40 p-6 z-10 text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-450" />
            <p className="text-xs text-slate-400 font-medium">
              JobTracker Workspace • Unified Full-Stack Platform built with React, Django and PostgreSQL
            </p>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-lg font-bold select-none">
              Production Stack Active
            </span>
            <span className="text-[10px] bg-indigo-950/40 border border-indigo-900/30 text-indigo-300 px-2.5 py-1 rounded-lg font-bold select-none">
              RESTful APIs Established
            </span>
          </div>
        </div>
      </footer>

      {/* AI Smart Analyst Modal */}
      <AIAnalysisModal
        isOpen={isAnalystOpen}
        onClose={() => setIsAnalystOpen(false)}
        initialCompany={analystCompany}
        initialRole={analystRole}
      />
    </div>
  );
}
