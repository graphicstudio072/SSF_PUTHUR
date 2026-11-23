import React, { useState, useEffect } from 'react';
import { apiGetAllCandidates, apiToggleCandidateAttendance } from '../utils/api';
import TicketModal from '../components/TicketModal';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Download,
  Loader2,
  Phone,
  Ticket,
} from 'lucide-react';

export default function CandidatesListTab() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTicket, setActiveTicket] = useState(null);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (unitFilter !== 'all') params.unit = unitFilter;
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
  }, [unitFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCandidates();
  };

  const handleToggleAttendance = async (id) => {
    try {
      const res = await apiToggleCandidateAttendance(id);
      if (res.success && res.candidate) {
        setCandidates((prev) =>
          prev.map((c) => (c._id === id ? res.candidate : c))
        );
      }
    } catch (err) {
      alert('Failed to update attendance status: ' + err.message);
    }
  };

  const handleExportCSV = () => {
    if (candidates.length === 0) return;

    const headers = ['Name', 'Mobile', 'Unit', 'Ticket ID', 'Attended', 'Check-In Time', 'Registered At'];
    const rows = candidates.map((c) => [
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.unit}"`,
      `"${c.ticketId}"`,
      c.attended ? 'Yes' : 'No',
      c.checkInTime ? `"${new Date(c.checkInTime).toLocaleString()}"` : '—',
      `"${new Date(c.createdAt).toLocaleString()}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SSF-PUTHUR-CANDIDATES-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-emerald-700" />
            Candidate Roster & Registrations
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            View, search, filter and manage candidate registrations and attendance.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={candidates.length === 0}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="sm:col-span-6 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by candidate name, phone or ticket ID..."
            className="w-full pl-9 pr-16 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 outline-none"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900"
          >
            Search
          </button>
        </form>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl text-gray-700 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="attended">Attended Only</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>

        {/* Candidate Count Pill */}
        <div className="sm:col-span-3 text-right">
          <span className="inline-block px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200">
            Found: {candidates.length} Delegates
          </span>
        </div>
      </div>

      {/* Candidate Table */}
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Delegate Name</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Check-In Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidates.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{c.name}</td>
                    <td className="py-3.5 px-4 font-mono">{c.phone}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold text-[11px] border border-emerald-200">
                        {c.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-800">
                      {c.ticketId}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleAttendance(c._id)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          c.attended
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Click to toggle attendance status"
                      >
                        {c.attended ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Attended</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-gray-400" />
                            <span>Pending</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">
                      {c.checkInTime
                        ? new Date(c.checkInTime).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveTicket(c)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                        title="View Official Ticket"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Pass</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Modal popup */}
      <TicketModal
        candidate={activeTicket}
        isOpen={!!activeTicket}
        onClose={() => setActiveTicket(null)}
      />
    </div>
  );
}
