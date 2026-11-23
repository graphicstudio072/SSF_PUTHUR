import React, { useState, useEffect } from 'react';
import {
  apiGetUnits,
  apiAddUnit,
  apiUpdateUnit,
  apiDeleteUnit,
} from '../utils/api';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  AlertCircle,
  Loader2,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function UnitsManagementTab() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Unit Form State
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitCode, setNewUnitCode] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit Unit State
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const res = await apiGetUnits();
      if (res.success && res.units) {
        setUnits(res.units);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch units');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;

    setIsAdding(true);
    setError('');
    setSuccess('');

    try {
      const res = await apiAddUnit({
        name: newUnitName.trim(),
        code: newUnitCode.trim(),
      });
      if (res.success) {
        setSuccess(`Unit "${newUnitName}" added successfully.`);
        setNewUnitName('');
        setNewUnitCode('');
        fetchUnits();
      } else {
        setError(res.message || 'Failed to add unit');
      }
    } catch (err) {
      setError(err.message || 'Server error adding unit');
    } finally {
      setIsAdding(false);
    }
  };

  const startEdit = (unit) => {
    setEditingId(unit._id);
    setEditName(unit.name);
    setEditCode(unit.code || '');
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditCode('');
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;
    setIsSavingEdit(true);
    setError('');
    setSuccess('');

    try {
      const res = await apiUpdateUnit(id, {
        name: editName.trim(),
        code: editCode.trim(),
      });
      if (res.success) {
        setSuccess(`Unit updated successfully.`);
        setEditingId(null);
        fetchUnits();
      } else {
        setError(res.message || 'Failed to update unit');
      }
    } catch (err) {
      setError(err.message || 'Server error updating unit');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete unit "${name}"?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const res = await apiDeleteUnit(id);
      if (res.success) {
        setSuccess(res.message || `Unit "${name}" deleted.`);
        fetchUnits();
      } else {
        setError(res.message || 'Failed to delete unit');
      }
    } catch (err) {
      setError(err.message || 'Server error deleting unit');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-emerald-700" />
            7 Units Management
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage the sector's official units. Changes reflect instantly on the public registration dropdown.
          </p>
        </div>
        <div className="inline-flex items-center px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
          <Layers className="w-3.5 h-3.5 mr-1 text-emerald-600" />
          <span>Total Units: {units.length}</span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center">
          <Check className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Add New Unit Form */}
      <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-3 flex items-center">
          <Plus className="w-4 h-4 mr-1 text-emerald-700" />
          Add New Sector Unit
        </h3>
        <form onSubmit={handleAddUnit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-6">
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
              Unit Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              placeholder="e.g. Kombam"
              className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
              Unit Code (Optional)
            </label>
            <input
              type="text"
              value={newUnitCode}
              onChange={(e) => setNewUnitCode(e.target.value)}
              placeholder="e.g. PT-03"
              className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={isAdding || !newUnitName.trim()}
              className="w-full py-2 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-1 disabled:opacity-50"
            >
              {isAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Add Unit</span>
            </button>
          </div>
        </form>
      </div>

      {/* Units Table / List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400 flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading sector units...</span>
          </div>
        ) : units.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            No units found. Add the sector's 7 units above.
          </div>
        ) : (
          <>
            {/* ── Mobile card view (< sm) ── */}
            <div className="sm:hidden divide-y divide-gray-100">
              {units.map((unit, index) => {
                const isEditing = editingId === unit._id;
                return (
                  <div key={unit._id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono text-gray-400">
                          #{index + 1}
                        </span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="block w-full mt-0.5 px-2 py-1.5 border border-emerald-500 rounded-lg text-sm outline-none bg-emerald-50/30 font-bold"
                            autoFocus
                          />
                        ) : (
                          <p className="font-bold text-gray-900 text-sm truncate">
                            {unit.name}
                          </p>
                        )}

                        {isEditing ? (
                          <input
                            type="text"
                            value={editCode}
                            onChange={(e) => setEditCode(e.target.value)}
                            placeholder="Code (optional)"
                            className="block w-28 mt-1 px-2 py-1 border border-emerald-500 rounded-lg text-xs outline-none bg-emerald-50/30"
                          />
                        ) : (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold text-[11px] font-mono">
                            {unit.code || '—'}
                          </span>
                        )}

                        <p className="text-[10px] text-gray-400 mt-1">
                          {unit.createdAt
                            ? new Date(unit.createdAt).toLocaleDateString()
                            : 'Initial Seed'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(unit._id)}
                              disabled={isSavingEdit}
                              className="p-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 touch-manipulation"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 touch-manipulation"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(unit)}
                              className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg touch-manipulation"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(unit._id, unit.name)}
                              className="p-2 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-lg touch-manipulation"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop table view (≥ sm) ── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Unit Name</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {units.map((unit, index) => {
                    const isEditing = editingId === unit._id;
                    return (
                      <tr key={unit._id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-gray-400">
                          {index + 1}
                        </td>

                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="px-2 py-1 border border-emerald-500 rounded-lg text-xs outline-none bg-emerald-50/30"
                              autoFocus
                            />
                          ) : (
                            <span className="font-bold text-gray-900">{unit.name}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editCode}
                              onChange={(e) => setEditCode(e.target.value)}
                              placeholder="Code"
                              className="px-2 py-1 border border-emerald-500 rounded-lg text-xs outline-none w-20 bg-emerald-50/30"
                            />
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold text-[11px]">
                              {unit.code || '—'}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-gray-400">
                          {unit.createdAt
                            ? new Date(unit.createdAt).toLocaleDateString()
                            : 'Initial Seed'}
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(unit._id)}
                                disabled={isSavingEdit}
                                className="p-1.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors"
                                title="Save Changes"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="p-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(unit)}
                                className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Edit Unit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(unit._id, unit.name)}
                                className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Unit"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
