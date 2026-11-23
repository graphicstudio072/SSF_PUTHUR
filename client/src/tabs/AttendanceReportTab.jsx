import React, { useState, useEffect } from 'react';
import { apiGetAttendanceStats } from '../utils/api';
import { useSettings } from '../context/SettingsContext';
import {
  BarChart3,
  Users,
  UserCheck,
  UserX,
  Share2,
  Copy,
  Check,
  Building,
  RefreshCw,
  Loader2,
  Calendar,
} from 'lucide-react';

export default function AttendanceReportTab() {
  const { settings } = useSettings();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [copiedUnit, setCopiedUnit] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await apiGetAttendanceStats();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.warn('Failed to load attendance stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Format single unit text report for WhatsApp or Clipboard
  const generateUnitReportText = (unit) => {
    if (!unit) return '';
    const now = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    let text = `*SSF PUTHUR SECTOR - UNIT ATTENDANCE REPORT*\n`;
    text += `📌 *Unit:* ${unit.unitName}\n`;
    text += `👥 *Attended / Total:* ${unit.attendedCount} / ${unit.total} (${unit.percentage}%)\n`;
    text += `🕒 *Generated:* ${now}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (unit.attendees && unit.attendees.length > 0) {
      text += `*ATTENDEES LIST (${unit.attendees.length}):*\n`;
      unit.attendees.forEach((c, idx) => {
        const timeStr = c.checkInTime
          ? new Date(c.checkInTime).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '';
        text += `${idx + 1}. ${c.name} (${c.ticketId})${timeStr ? ` - ${timeStr}` : ''}\n`;
      });
    } else {
      text += `_No attendees checked in yet from this unit._\n`;
    }

    if (unit.absentees && unit.absentees.length > 0) {
      text += `\n*PENDING ATTENDEES (${unit.absentees.length}):*\n`;
      unit.absentees.forEach((c, idx) => {
        text += `${idx + 1}. ${c.name} (${c.phone})\n`;
      });
    }

    text += `\n_Generated via SSF Puthur Sector Portal_`;
    return text;
  };

  // Format full sector report for WhatsApp or Clipboard
  const generateFullSectorReportText = () => {
    if (!stats) return '';
    const now = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    let text = `*SSF PUTHUR SECTOR - FULL ATTENDANCE REPORT*\n`;
    text += `🌟 *Event:* ${settings.eventName || 'SSF PUTHUR SECTOR EVENT 2026'}\n`;
    text += `📊 *Total Sector Attendance:* ${stats.totalAttended} / ${stats.totalRegistered} (${stats.overallPercentage}%)\n`;
    text += `🕒 *Report Time:* ${now}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `*UNIT-WISE SUMMARY BREAKDOWN:*\n`;
    if (stats.unitStats && stats.unitStats.length > 0) {
      stats.unitStats.forEach((u, i) => {
        text += `${i + 1}. *${u.unitName}*: ${u.attendedCount} / ${u.total} (${u.percentage}%)\n`;
      });
    }

    text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `✅ *Total Attended:* ${stats.totalAttended}\n`;
    text += `⏳ *Total Pending:* ${stats.totalPending}\n`;
    text += `\n_Generated via SSF Puthur Sector Official Portal_`;
    return text;
  };

  const handleShareUnitWhatsApp = (unit) => {
    const text = generateUnitReportText(unit);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyUnitText = (unit) => {
    const text = generateUnitReportText(unit);
    navigator.clipboard.writeText(text);
    setCopiedUnit(true);
    setTimeout(() => setCopiedUnit(false), 2000);
  };

  const handleShareFullWhatsApp = () => {
    const text = generateFullSectorReportText();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyFullText = () => {
    const text = generateFullSectorReportText();
    navigator.clipboard.writeText(text);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  if (loading && !stats) {
    return (
      <div className="p-12 text-center text-xs text-gray-400 flex items-center justify-center space-x-2">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
        <span>Calculating attendance statistics...</span>
      </div>
    );
  }

  const selectedUnitData =
    selectedUnit === 'all'
      ? null
      : stats?.unitStats?.find((u) => u.unitName === selectedUnit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-emerald-700" />
            Unit-Wise Attendance & WhatsApp Reports
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time sector statistics with one-click WhatsApp broadcast sharing.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Stats</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Registered */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
              Total Registered
            </span>
            <span className="text-2xl font-extrabold text-gray-900">
              {stats?.totalRegistered || 0}
            </span>
            <span className="text-[11px] text-gray-500 block">Across all units</span>
          </div>
        </div>

        {/* Total Attended */}
        <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl border border-emerald-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-700/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
              Checked In / Attended
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-emerald-950">
                {stats?.totalAttended || 0}
              </span>
              <span className="text-xs font-bold text-emerald-700">
                ({stats?.overallPercentage || 0}%)
              </span>
            </div>
            <span className="text-[11px] text-emerald-800/70 block">Official gate scans</span>
          </div>
        </div>

        {/* Total Pending */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
              Pending Check-In
            </span>
            <span className="text-2xl font-extrabold text-amber-950">
              {stats?.totalPending || 0}
            </span>
            <span className="text-[11px] text-amber-700/80 block">Yet to arrive</span>
          </div>
        </div>
      </div>

      {/* Broadcast Full Sector Report Card */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white p-6 rounded-3xl shadow-lg border border-emerald-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-200 uppercase tracking-widest mb-1">
            Sector-Wide Report
          </span>
          <h3 className="text-lg font-bold text-white">Full Sector Attendance Report</h3>
          <p className="text-xs text-emerald-200/80 mt-0.5">
            Share the comprehensive 7-unit summary and turnout metrics directly to WhatsApp.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleShareFullWhatsApp}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Full to WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleCopyFullText}
            className="inline-flex items-center space-x-1.5 px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all"
            title="Copy Report Text"
          >
            {copiedFull ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedFull ? 'Copied!' : 'Copy Text'}</span>
          </button>
        </div>
      </div>

      {/* Unit Selector & Single Unit WhatsApp Share */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center">
              <Building className="w-4 h-4 mr-1.5 text-emerald-700" />
              Unit-Specific Attendance & WhatsApp Share
            </h3>
            <p className="text-xs text-gray-500">
              Select an individual unit to view its attendees and broadcast only that unit's report.
            </p>
          </div>

          {/* Unit Dropdown Selector */}
          <div className="w-full sm:w-64">
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 outline-none"
            >
              <option value="all">-- Select a Unit to Share --</option>
              {stats?.unitStats?.map((u) => (
                <option key={u.unitId} value={u.unitName}>
                  {u.unitName} ({u.attendedCount}/{u.total} - {u.percentage}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* If a unit is selected, show details & single-unit share buttons */}
        {selectedUnitData ? (
          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 animate-in fade-in duration-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/60">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Selected Unit
                </span>
                <h4 className="text-base font-extrabold text-gray-900">
                  {selectedUnitData.unitName} Unit
                </h4>
                <div className="flex items-center space-x-3 text-xs text-gray-600 mt-1">
                  <span>
                    Attended: <strong className="text-emerald-800">{selectedUnitData.attendedCount}</strong>
                  </span>
                  <span>•</span>
                  <span>Total: <strong>{selectedUnitData.total}</strong></span>
                  <span>•</span>
                  <span>Rate: <strong className="text-emerald-800">{selectedUnitData.percentage}%</strong></span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleShareUnitWhatsApp(selectedUnitData)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Unit to WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyUnitText(selectedUnitData)}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl text-xs font-semibold transition-all"
                >
                  {copiedUnit ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedUnit ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Attendees list in this unit */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                Attendees Checked In ({selectedUnitData.attendees.length})
              </span>
              {selectedUnitData.attendees.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No attendees checked in yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedUnitData.attendees.map((c) => (
                    <div
                      key={c._id}
                      className="p-2.5 bg-white rounded-xl border border-gray-200 text-xs shadow-2xs"
                    >
                      <span className="font-bold text-gray-900 block truncate">{c.name}</span>
                      <div className="flex justify-between items-center text-[10px] text-gray-500 mt-1">
                        <span className="font-mono text-emerald-700 font-semibold">{c.ticketId}</span>
                        <span>
                          {c.checkInTime
                            ? new Date(c.checkInTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">
            Select a unit from the dropdown above to view attendees and share that unit's customized report.
          </p>
        )}
      </div>

      {/* All Units Breakdown Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Sector 7-Units Breakdown
          </h3>
          <span className="text-[11px] text-gray-500">Live Attendance Percentages</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/50 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Unit Name</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4">Attended</th>
                <th className="py-3 px-4">Pending</th>
                <th className="py-3 px-4">Attendance %</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats?.unitStats?.map((u) => (
                <tr key={u.unitId} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">{u.unitName}</td>
                  <td className="py-3.5 px-4">{u.total}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-800">{u.attendedCount}</td>
                  <td className="py-3.5 px-4 text-amber-700">{u.pendingCount}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{ width: `${Math.min(u.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-gray-800 text-[11px]">
                        {u.percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleShareUnitWhatsApp(u)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                      title="Share to WhatsApp"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
