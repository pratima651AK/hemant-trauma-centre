'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Phone, Mail, Clock, Save, Lock, MessageSquare, Search, Filter, X, ChevronRight, MessageCircle, RefreshCcw, LogOut } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { useSession, signIn, signOut } from 'next-auth/react';

interface Appointment {
  id: number;
  name: string;
  mobile: string;
  email: string | null;
  message: string | null;
  contacted: boolean;
  visited: boolean;
  admin_notes: string;
  created_at: string;
  version: number;
}

type FilterStatus = 'all' | 'new' | 'contacted' | 'visited';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminKey, setAdminKey] = useState(''); // Used only for input field in login form
  const [loginError, setLoginError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  
  // Secret Delete Mode State
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);
  const pressTimer = React.useRef<NodeJS.Timeout | null>(null);

  // Ref to track latest appointments for polling closure
  const appointmentsRef = React.useRef(appointments);
  useEffect(() => {
    appointmentsRef.current = appointments;
  }, [appointments]);

  const syncAppointments = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setIsRefreshing(true);

      // Use Ref to get latest state inside interval/async closures
      const currentApps = appointmentsRef.current;

      // Map current appointments to { id: version } and compute global hash
      const knownVersions: Record<number, number> = {};
      const hashParts: string[] = [];
      
      // Sort to ensure consistent hashing
      const sortedApps = [...currentApps].sort((a, b) => a.id - b.id);
      
      sortedApps.forEach(a => { 
        knownVersions[a.id] = a.version;
        hashParts.push(`${a.id}:${a.version}`);
      });

      // 1. First Pass: Send ONLY the global hash (Unknown Payload Optimization)
      const clientGlobalHash = CryptoJS.MD5(hashParts.join('|')).toString();
      console.log(`[Sync] Checking Hash: ${clientGlobalHash}`);

      let response = await fetch('/api/admin/appointments/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientGlobalHash }) // No knownVersions yet
      });

      let data = await response.json();

      // 2. Second Pass: If mismatch, send full map to get deltas
      if (data.mismatch) {
        console.log('[Sync] Mismatch detected. Triggering Batch Mail & requesting Deltas...');
        
        // Trigger the batch mailer via the dedicated hash endpoint
        // Using NEXT_PUBLIC_ADMIN_SECRET_KEY for client-side authorization
        fetch('/api/admin/appointments/hash', {
           headers: { 'Authorization': process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || '' }
        }).catch(e => console.error('Batch mail trigger failed', e));

        response = await fetch('/api/admin/appointments/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ knownVersions, clientGlobalHash })
        });
        data = await response.json();
      }

      if (response.ok) {
        // Data is already parsed above (either from first or second pass)
        
        // 304-style check (Server says "You are up to date")
        if (data.synced) {
          console.log('[Sync] Server says: In Sync');
          return; // No changes needed
        }

        const { updates, deletions, serverTime } = data;
        console.log(`[Sync] Updates: ${updates.length}, Deletions: ${deletions.length}`);
        
        if (updates.length > 0 || deletions.length > 0) {
          setAppointments(prev => {
            // Create a map for faster updates
            const appointmentMap = new Map(prev.map(a => [a.id, a]));
            
            // Apply Updates
            updates.forEach((updatedApp: Appointment) => {
              appointmentMap.set(updatedApp.id, updatedApp);
            });
            
            // Apply Deletions
            deletions.forEach((id: number) => {
              appointmentMap.delete(id);
            });
            
            // Convert back to sorted array (newest first)
            return Array.from(appointmentMap.values()).sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          });
        }
      } else {
        console.error('Sync failed', response.status);
        if (response.status === 401) {
          // Session expired or invalid
          setAppointments([]); // Clear sensitive data immediately
          signOut(); // Force re-login
        }
      }
    } catch (err) {
      console.error('Sync connection failed', err);
    } finally {
      if (!isSilent) setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Efficient Delta Sync Polling
  useEffect(() => {
    if (status === 'authenticated') {
      // Immediate fetch on mount/auth
      syncAppointments(); 
      
      const interval = setInterval(() => {
        syncAppointments(true);
      }, 60000); // Check every 1 minute
      return () => clearInterval(interval);
    }
  }, [status]); // Removed session dependency to avoid re-running if session object strictly changes but logic doesn't need to

  const updateAppointment = async (id: number, updates: Partial<Appointment>) => {
    try {
      const response = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, ...updates }),
      });
      if (response.ok) {
        const updated = await response.json();
        setAppointments(prev => prev.map(a => a.id === id ? updated : a));
      }
    } catch (err) {
      console.error('Update failed');
    }
  };

  const deleteAppointment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/appointments?id=${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || '' 
        }
      });

      if (response.ok) {
        setAppointments(prev => prev.filter(a => a.id !== id));
      } else {
        alert('Failed to delete appointment');
      }
    } catch (err) {
      console.error('Delete failed', err);
      alert('Delete failed');
    }
  };

  const archiveAppointments = async () => {
    if (!confirm('Are you sure you want to permanently archive all deleted appointments?')) return;

    try {
      const response = await fetch('/api/admin/archive', {
        method: 'POST',
        headers: {
            'Authorization': process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || '' 
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        alert(`Successfully archived ${data.count} appointments.`);
      } else {
        alert('Archive failed: ' + data.error);
      }
    } catch (err) {
      console.error('Archive failed', err);
      alert('Archive connection failed');
    }
  };

  const handleLogoPressStart = () => {
    pressTimer.current = setTimeout(() => {
      setIsDeleteEnabled(prev => !prev);
    }, 5000); // 5 seconds long press
  };

  const handleLogoPressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  // Filter and Search Logic
  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      // Status Filter
      if (activeFilter === 'new' && (app.contacted || app.visited)) return false;
      if (activeFilter === 'contacted' && (!app.contacted || app.visited)) return false;
      if (activeFilter === 'visited' && !app.visited) return false;

      // Search Query
      if (!searchQuery) return true;
      
      const q = searchQuery.toLowerCase().trim();
      const mobileDigits = app.mobile.replace(/\D/g, '');
      const searchDigits = q.replace(/\D/g, '');

      return (
        app.name.toLowerCase().includes(q) ||
        (searchDigits && mobileDigits.includes(searchDigits)) ||
        (app.email && app.email.toLowerCase().includes(q)) ||
        app.id.toString() === q
      );
    });
  }, [appointments, searchQuery, activeFilter]);

  const stats = useMemo(() => {
    return {
      new: appointments.filter(a => !a.contacted && !a.visited).length,
      contacted: appointments.filter(a => a.contacted && !a.visited).length,
      visited: appointments.filter(a => a.visited).length,
    };
  }, [appointments]);

  const handleLogin = async () => {
    setLoginError('');
    const res = await signIn('credentials', {
      password: adminKey,
      redirect: false,
    });

    if (res?.error) {
      setLoginError('Invalid Admin Key');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-2xl">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Admin Access</h1>
          <p className="text-slate-500 text-center mb-6 whitespace-nowrap">Enter your secret key to manage appointments</p>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter Admin Key"
              className="w-full p-4 border-2 border-slate-100 rounded-xl outline-none focus:border-primary transition-all text-lg"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button
              onClick={handleLogin}
              className="w-full bg-primary text-white font-black py-4 rounded-xl hover:bg-primary/90 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black active:translate-y-0.5 active:shadow-none"
            >
              Authorize Access
            </button>
            {loginError && <p className="text-red-500 text-sm font-medium text-center">{loginError}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div 
                className="flex items-center gap-2 mb-2 select-none cursor-pointer active:scale-95 transition-transform"
                onMouseDown={handleLogoPressStart}
                onMouseUp={handleLogoPressEnd}
                onMouseLeave={handleLogoPressEnd}
                onTouchStart={handleLogoPressStart}
                onTouchEnd={handleLogoPressEnd}
                onDoubleClick={() => setIsDeleteEnabled(prev => !prev)}
                title="Double click or hold for 5s to toggle admin mode"
              >
                  <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-bold text-lg">+</div>
                  <div className="text-xl font-bold text-slate-900 leading-none">
                    Hemant <span className="text-primary">Trauma Centre</span>
                  </div>
              </div>
              <h1 className={`text-xl sm:text-2xl font-black tracking-tight transition-colors ${isDeleteEnabled ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
                ADMIN DASHBOARD
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`flex h-2 w-2 rounded-full ${isRefreshing ? 'bg-blue-500 scale-125' : 'bg-green-500'} transition-all duration-300 animate-pulse`} />
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                  {isRefreshing ? 'Checking for updates...' : 'Live Updates Active'}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-slate-600 hover:text-red-500 text-xs font-bold uppercase tracking-wider transition-all border-2 border-black rounded-lg hover:bg-red-50 bg-white"
            >
              Logout
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by name, mobile, or email..."
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-black rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-md transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex gap-3 mt-6 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 border-black whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
                activeFilter === 'all' 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              All ({appointments.length})
            </button>
            <button
              onClick={() => setActiveFilter('new')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 border-black whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
                activeFilter === 'new' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              New ({stats.new})
            </button>
            <button
              onClick={() => setActiveFilter('contacted')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 border-black whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
                activeFilter === 'contacted' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              Contacted ({stats.contacted})
            </button>
            <button
              onClick={() => setActiveFilter('visited')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 border-black whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
                activeFilter === 'visited' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
            >
              Visited ({stats.visited})
            </button>
          </div>
        </div>
      </div>

      {isDeleteEnabled && (
        <div className="sticky top-[89px] z-20 bg-red-600 text-white text-center py-2 font-bold text-sm uppercase tracking-widest animate-in slide-in-from-top flex items-center justify-center gap-4">
          <span>⚠ Deletion Mode Active</span>
          <button 
            onClick={archiveAppointments}
            className="bg-white text-red-600 px-3 py-1 rounded text-xs font-black hover:bg-slate-100 transition shadow-sm"
          >
            ARCHIVE TRASH
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && appointments.length === 0 && (
            // Skeleton Loader
            [...Array(6)].map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-white rounded-2xl border-2 border-slate-100 p-5 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2 mb-2"></div>
                <div className="h-20 bg-slate-100 rounded w-full mt-4"></div>
              </div>
            ))
          )}

          {filteredAppointments.map((app, index) => {
            const isNew = !app.contacted && !app.visited;
            const isContacted = app.contacted && !app.visited;
            const isVisited = app.visited;

            let statusStyles = "border-slate-200 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.15)]";
            let borderAccent = "border-l-[6px] border-slate-300";
            
            if (isNew) {
              statusStyles = "border-red-500 shadow-[8px_8px_0px_0px_rgba(239,68,68,0.2)] hover:shadow-[12px_12px_0px_0px_rgba(239,68,68,0.3)]";
              borderAccent = "border-l-[6px] border-red-500";
            } else if (isContacted) {
              statusStyles = "border-blue-500 shadow-[8px_8px_0px_0px_rgba(59,130,246,0.2)] hover:shadow-[12px_12px_0px_0px_rgba(59,130,246,0.3)]";
              borderAccent = "border-l-[6px] border-blue-500";
            } else if (isVisited) {
              statusStyles = "border-green-500 shadow-[8px_8px_0px_0px_rgba(34,197,94,0.2)] hover:shadow-[12px_12px_0px_0px_rgba(34,197,94,0.3)]";
              borderAccent = "border-l-[6px] border-green-500";
            }

            if (isDeleteEnabled) {
               statusStyles = "border-orange-500 shadow-[8px_8px_0px_0px_rgba(249,115,22,0.2)] hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,0.3)]";
               borderAccent = "border-l-[6px] border-orange-500";
            }

            return (
              <div 
                key={app.id} 
                className={`bg-white rounded-2xl border-2 transition-all ${statusStyles} ${borderAccent} overflow-hidden group`}
              >
                {/* Header */}
                <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        #{app.id}
                      </span>
                      <span className="text-xs text-slate-400 font-medium font-mono lowercase">
                        {new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} @ {new Date(app.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors capitalize">
                      {app.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-slate-500 font-mono text-xs font-medium">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{app.mobile}</span>
                    </div>
                  </div>
                  {isNew && (
                    <span className="flex h-2 w-2 rounded-full bg-red-500 ring-4 ring-red-50" />
                  )}
                </div>

                {/* Contact Actions */}
                <div className="flex border-y-2 border-black divide-x-2 divide-black bg-white relative">
                  <a 
                    href={`tel:${app.mobile}`}
                    className="flex-1 flex flex-col items-center justify-center gap-2 py-4 hover:bg-red-50 transition-colors text-slate-900 font-black"
                  >
                    <Phone className="w-5 h-5 text-red-500" />
                    <span className="text-[10px] uppercase tracking-widest">Call</span>
                  </a>
                  <a 
                    href={`https://wa.me/${app.mobile.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex flex-col items-center justify-center gap-2 py-4 hover:bg-green-50 transition-colors text-slate-900 font-black"
                  >
                    <MessageCircle className="w-5 h-5 text-green-500" />
                    <span className="text-[10px] uppercase tracking-widest">WhatsApp</span>
                  </a>
                  {isDeleteEnabled && (
                    <button
                      onClick={() => deleteAppointment(app.id)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-red-600 text-white p-3 rounded-full shadow-xl hover:bg-red-700 transition hover:scale-110 active:scale-95"
                      title="Delete Appointment"
                    >
                      <LogOut className="w-8 h-8" />
                    </button>
                  )}
                </div>

                {/* Message Body */}
                <div className="p-5">
                  <div className="relative">
                    <div className="max-h-24 overflow-y-auto text-sm text-slate-600 leading-relaxed scrollbar-thin scrollbar-thumb-slate-200 pr-2">
                      {app.message || <span className="italic text-slate-300">No message provided</span>}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white pointer-events-none" />
                  </div>
                  
                  {app.email && (
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs text-slate-400">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{app.email}</span>
                    </div>
                  )}
                </div>

                {/* Tracking & Notes */}
                <div className="p-5 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer group/label">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={app.contacted} 
                          onChange={(e) => updateAppointment(app.id, { contacted: e.target.checked })}
                          className="peer sr-only"
                        />
                        <div className="w-10 h-6 bg-slate-200 peer-checked:bg-blue-500 rounded-full transition-colors" />
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-transform shadow-sm" />
                      </div>
                      <span className={`text-[11px] font-black uppercase tracking-wider ${app.contacted ? 'text-blue-600' : 'text-slate-400'}`}>
                        Contacted
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group/label">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={app.visited} 
                          onChange={(e) => updateAppointment(app.id, { visited: e.target.checked })}
                          className="peer sr-only"
                        />
                        <div className="w-10 h-6 bg-slate-200 peer-checked:bg-green-500 rounded-full transition-colors" />
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-transform shadow-sm" />
                      </div>
                      <span className={`text-[11px] font-black uppercase tracking-wider ${app.visited ? 'text-green-600' : 'text-slate-400'}`}>
                        Visited
                      </span>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Add admin notes..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-primary transition-all pr-10 shadow-sm"
                      value={app.admin_notes}
                      onChange={(e) => {
                        const newNotes = e.target.value;
                        setAppointments(prev => prev.map(a => a.id === app.id ? { ...a, admin_notes: newNotes } : a));
                      }}
                      onBlur={(e) => updateAppointment(app.id, { admin_notes: e.target.value })}
                    />
                    <Save className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAppointments.length === 0 && !loading && (
          <div className="py-24 text-center">
            <div className="bg-slate-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
              <MessageSquare className="w-10 h-10 text-slate-300 -rotate-12" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No appointments found</h3>
            <p className="text-slate-400 max-w-xs mx-auto mt-2">Try adjusting your filters or search query to find what you're looking for.</p>
            {(searchQuery || activeFilter !== 'all') && (
              <button 
                onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                className="mt-6 text-primary font-bold text-sm hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
