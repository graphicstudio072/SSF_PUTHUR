import React, { useState, useEffect } from 'react';
import {
  apiGetAllCandidates,
  apiToggleCandidateAttendance,
  apiDeleteCandidate,
} from '../utils/api';
import TicketModal from '../components/TicketModal';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  Loader2,
  Trash2,
  X,
  AlertTriangle,
  Briefcase,
} from 'lucide-react';

// --- Toast Notification Component ---
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-5 right-4 left-4 sm:left-auto sm:right-5 sm:w-80 z-[60] flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium animate-in slide-in-from-bottom-3 duration-300 ${
        type === 'success'
          ? 'bg-emerald-800 text-white border-emerald-700'
          : 'bg-red-700 text-white border-red-600'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
      ) : (
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      )}
      <span className="flex-1 text-xs sm:text-sm">{message}</span>
      <button onClick={onClose} className="ml-auto opacity-70 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// --- Delete Confirmation Modal ---
function DeleteConfirmModal({ candidate, onConfirm, onCancel, loading }) {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-red-100 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
          <Trash2 className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Candidate?</h3>
        <p className="text-xs text-gray-500 mb-1">
          Are you sure you want to permanently delete:
        </p>
        <p className="text-sm font-bold text-gray-900 mb-1">{candidate.name}</p>
        <p className="text-xs text-gray-500 font-mono mb-4">{candidate.ticketId}</p>
        <p className="text-xs text-red-600 font-semibold mb-5 p-2.5 bg-red-50 rounded-xl border border-red-200">
          ⚠️ This action cannot be undone. The candidate record will be permanently removed from the database.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>{loading ? 'Deleting...' : 'Yes, Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CandidatesListTab() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTicket, setActiveTicket] = useState(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.attended = statusFilter === 'attended';

      const res = await apiGetAllCandidates(params);
      if (res.success && res.candidates) {
        setCandidates(res.candidates);
      }
    } catch (err) {
      console.warn('Failed to load candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCandidates();
  };

  const handleToggleAttendance = async (id) => {
    try {
      const res = await apiToggleCandidateAttendance(id);
      if (res.success && res.candidate) {
        setCandidates((prev) => prev.map((c) => (c._id === id ? res.candidate : c)));
      }
    } catch (err) {
      showToast('Failed to update attendance: ' + err.message, 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await apiDeleteCandidate(deleteTarget._id);
      if (res.success) {
        setCandidates((prev) => prev.filter((c) => c._id !== deleteTarget._id));
        showToast(`"${deleteTarget.name}" deleted successfully.`, 'success');
        setDeleteTarget(null);
      } else {
        showToast(res.message || 'Deletion failed.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Server error during deletion.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (candidates.length === 0) return;
    const headers = ['Name', 'Mobile', 'Unit', 'Role', 'Ticket ID', 'Attended', 'Check-In Time', 'Registered At'];
    const rows = candidates.map((c) => [
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.unit}"`,
      `"${c.role || ''}"`,
      `"${c.ticketId}"`,
      c.attended ? 'Yes' : 'No',
      c.checkInTime ? `"${new Date(c.checkInTime).toLocaleString()}"` : '—',
      `"${new Date(c.createdAt).toLocaleString()}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `SSF-PUTHUR-CANDIDATES-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        candidate={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {/* Header */}
      <div className="pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-emerald-700" />
            Candidate Roster & Registrations
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            View, search, filter, manage attendance, and delete registrations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={candidates.length === 0}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50 touch-manipulation"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, role or ticket ID..."
            className="w-full pl-9 pr-16 py-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 outline-none"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 touch-manipulation"
          >
            Go
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl text-gray-700 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none sm:w-40"
        >
          <option value="all">All Statuses</option>
          <option value="attended">Attended Only</option>
          <option value="pending">Pending Only</option>
        </select>

        <span className="inline-flex items-center justify-center px-3 py-2 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 whitespace-nowrap">
          {candidates.length} Delegates
        </span>
      </div>

      {/* Candidate List */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading candidates...</span>
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">
            No candidates found matching the filters.
          </div>
        ) : (
          <>
            {/* Desktop Table — hidden on small screens */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Delegate Name</th>
                    <th className="py-3 px-4">Mobile</th>
                    <th className="py-3 px-4">Unit</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Check-In</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {candidates.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">{c.name}</td>
                      <td className="py-3 px-4 font-mono whitespace-nowrap">{c.phone}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold text-[11px] border border-emerald-200">
                          {c.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold text-[11px] border border-blue-200">
                          {c.role || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-800 whitespace-nowrap">{c.ticketId}</td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(c._id)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors touch-manipulation ${
                            c.attended
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {c.attended ? (
                            <><CheckCircle2 className="w-3 h-3 text-emerald-600" /><span>Attended</span></>
                          ) : (
                            <><XCircle className="w-3 h-3 text-gray-400" /><span>Pending</span></>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                        {c.checkInTime
                          ? new Date(c.checkInTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveTicket(c)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors touch-manipulation"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Pass</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(c)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors touch-manipulation"
                            title="Delete candidate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List — shown only on small screens */}
            <div className="sm:hidden divide-y divide-gray-100">
              {candidates.map((c) => (
                <div key={c._id} className="p-4 space-y-3">
                  {/* Top Row: Name + Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-900 text-sm leading-tight">{c.name}</p>
                      <p className="font-mono text-xs text-gray-500 mt-0.5">{c.phone}</p>
                    </div>
                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveTicket(c)}
                        className="p-2 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl touch-manipulation"
                        title="View pass"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(c)}
                        className="p-2 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl touch-manipulation"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Tags Row */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold text-[11px] border border-emerald-200">
                      {c.unit}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold text-[11px] border border-blue-200 flex items-center space-x-1">
                      <Briefcase className="w-2.5 h-2.5" />
                      <span>{c.role || '—'}</span>
                    </span>
                    <span className="font-mono text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                      {c.ticketId}
                    </span>
                  </div>

                  {/* Status + Check-in Row */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleAttendance(c._id)}
                      className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors touch-manipulation ${
                        c.attended
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {c.attended ? (
                        <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /><span>Attended</span></>
                      ) : (
                        <><XCircle className="w-3.5 h-3.5 text-gray-400" /><span>Pending</span></>
                      )}
                    </button>

                    {c.checkInTime && (
                      <span className="text-[10px] text-gray-400">
                        {new Date(c.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <TicketModal
        candidate={activeTicket}
        isOpen={!!activeTicket}
        onClose={() => setActiveTicket(null)}
      />
    </div>
  );
}
