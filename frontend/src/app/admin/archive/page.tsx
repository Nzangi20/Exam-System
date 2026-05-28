"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { RotateCcw, Trash2 } from 'lucide-react';

interface ArchiveItem {
  id: string;
  entityType: string;
  entityId: string;
  data: { name?: string; email?: string; role?: string };
  deletedAt: string;
}

export default function AdminArchivePage() {
  const [records, setRecords] = useState<ArchiveItem[]>([]);
  const [message, setMessage] = useState('');

  const fetchArchive = async () => {
    try {
      const res = await api.get('/api/analytics/archive');
      setRecords(res.data);
    } catch {
      setMessage('Failed to load archive');
    }
  };

  useEffect(() => {
    fetchArchive();
  }, []);

  const restore = async (id: string) => {
    try {
      await api.post(`/api/analytics/archive/${id}/restore`);
      setMessage('Record restored');
      fetchArchive();
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Restore failed');
    }
  };

  const permanentDelete = async (id: string) => {
    if (!confirm('Permanently delete this record? This cannot be undone.')) return;
    try {
      await api.delete(`/api/analytics/archive/${id}`);
      setMessage('Permanently deleted');
      fetchArchive();
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Archive</h1>
        <p className="text-slate-500">Deleted information stored for recovery or permanent removal.</p>
      </div>

      {message && (
        <div className="p-3 bg-violet-50 text-violet-700 text-sm rounded-lg border border-violet-100">
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {records.length === 0 ? (
          <p className="px-6 py-12 text-center text-slate-400">No archived records</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {records.map((record) => (
              <div key={record.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {record.entityType}
                    </span>
                    <p className="font-medium text-slate-900">
                      {record.data.name || record.entityId}
                    </p>
                  </div>
                  {record.data.email && (
                    <p className="text-sm text-slate-500 mt-0.5">{record.data.email} · {record.data.role}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    Archived {new Date(record.deletedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => restore(record.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore
                  </button>
                  <button
                    onClick={() => permanentDelete(record.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
