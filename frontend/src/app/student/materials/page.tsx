"use client";

import React, { useEffect, useState } from 'react';
import { api, API_BASE } from '@/lib/api';
import { BookOpen, FileText, StickyNote, Library, Eye, X } from 'lucide-react';

export default function StudentMaterialsPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'NOTES' | 'REVISION'>('ALL');
  const [viewingResource, setViewingResource] = useState<any>(null);

  const getFullUrl = (url: string) => {
    if (!url) return '';
    const uploadsIndex = url.indexOf('/uploads/');
    if (uploadsIndex !== -1) {
      const relativePath = url.substring(uploadsIndex);
      const cleanUrl = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
      return `${API_BASE}/${cleanUrl}`;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `${API_BASE}/${cleanUrl}`;
  };

  useEffect(() => {
    api
      .get('/api/student-resources/student')
      .then((res) => setResources(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === 'ALL' ? resources : resources.filter((r) => r.materialType === filter);

  const notes = filtered.filter((r) => r.materialType === 'NOTES');
  const revision = filtered.filter((r) => r.materialType === 'REVISION');

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const MaterialCard = ({ r }: { r: any }) => (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          r.materialType === 'REVISION' ? 'bg-amber-100' : 'bg-violet-100'
        }`}
      >
        {r.materialType === 'REVISION' ? (
          <Library className="w-6 h-6 text-amber-700" />
        ) : (
          <StickyNote className="w-6 h-6 text-violet-700" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-900">{r.title}</h3>
        {r.description && <p className="text-sm text-slate-600 mt-1">{r.description}</p>}
        <p className="text-xs text-slate-500 mt-2">
          From {r.trainer?.name} · {new Date(r.createdAt).toLocaleDateString()}
        </p>
      </div>
      <button
        onClick={() => setViewingResource(r)}
        className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg shrink-0 self-center cursor-pointer"
      >
        <Eye className="w-4 h-4" />
        View Material
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Notes & Revision</h1>
        <p className="text-slate-600 mt-1">
          Materials shared by your trainers for study and revision.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'ALL', label: 'All' },
          { key: 'NOTES', label: 'Notes' },
          { key: 'REVISION', label: 'Revision' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-violet-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">No materials available yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Your trainer will upload notes and revision files here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {(filter === 'ALL' || filter === 'NOTES') && notes.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-600" />
                Notes ({notes.length})
              </h2>
              {notes.map((r) => (
                <MaterialCard key={r.id} r={r} />
              ))}
            </section>
          )}

          {(filter === 'ALL' || filter === 'REVISION') && revision.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Library className="w-5 h-5 text-amber-600" />
                Revision Materials ({revision.length})
              </h2>
              {revision.map((r) => (
                <MaterialCard key={r.id} r={r} />
              ))}
            </section>
          )}
        </div>
      )}
      {/* Document Viewer Modal */}
      {viewingResource && (() => {
        const fullUrl = getFullUrl(viewingResource.fileUrl);
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 truncate">{viewingResource.title}</h3>
                  {viewingResource.description && (
                    <p className="text-xs text-slate-550 truncate mt-0.5">{viewingResource.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setViewingResource(null)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body / Viewer */}
              <div className="flex-1 bg-white relative">
                {viewingResource.fileUrl?.endsWith('.pdf') ? (
                  <iframe
                    src={fullUrl}
                    className="w-full h-full border-none bg-white"
                    title={viewingResource.title}
                  />
                ) : viewingResource.fileUrl?.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={fullUrl}
                    controls
                    controlsList="nodownload"
                    className="w-full h-full object-contain bg-slate-950"
                  />
                ) : viewingResource.fileUrl?.match(/\.(png|jpe?g|gif|webp|svg)$/i) ? (
                  <div className="w-full h-full flex items-center justify-center p-4 bg-white">
                    <img
                      src={fullUrl}
                      alt={viewingResource.title}
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  </div>
                ) : (
                  <iframe
                    src={fullUrl}
                    className="w-full h-full border-none bg-white"
                    title={viewingResource.title}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
