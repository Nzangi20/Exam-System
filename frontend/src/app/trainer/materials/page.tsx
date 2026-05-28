"use client";

import React, { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { inputClass } from '@/lib/ui';
import { Upload, Trash2, FileText, BookOpen, GraduationCap, Download } from 'lucide-react';

const MATERIAL_TYPES = [
  { value: 'NOTES', label: '📝 Notes' },
  { value: 'REVISION', label: '📚 Revision Material' },
];

const FILE_TYPES = [
  { value: 'document', label: 'Document (PDF, Word)' },
  { value: 'slides', label: 'Slides / Presentation' },
  { value: 'video', label: 'Video' },
  { value: 'other', label: 'Other' },
];

export default function TrainerStudentMaterialsPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialType, setMaterialType] = useState('NOTES');
  const [fileType, setFileType] = useState('document');
  const [category, setCategory] = useState('ALL');
  const [level, setLevel] = useState('ALL');
  const [studentId, setStudentId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const [resRes, studentsRes] = await Promise.all([
        api.get('/api/student-resources/trainer'),
        api.get('/api/users/students'),
      ]);
      setResources(resRes.data);
      setStudents(studentsRes.data);
    } catch {
      setErrorMsg('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title.trim()) {
      setErrorMsg('Please provide a title and select a file.');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('materialType', materialType);
      formData.append('fileType', fileType);
      formData.append('category', category);
      formData.append('level', level);
      if (studentId) formData.append('studentId', studentId);

      const res = await api.post('/api/student-resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResources([res.data, ...resources]);
      setTitle('');
      setDescription('');
      setMaterialType('NOTES');
      setCategory('ALL');
      setLevel('ALL');
      setStudentId('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSuccessMsg('File shared with students successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this material? Students will no longer see it.')) return;
    try {
      await api.delete(`/api/student-resources/${id}`);
      setResources(resources.filter((r) => r.id !== id));
    } catch {
      alert('Failed to delete');
    }
  };

  const audienceLabel = (r: any) => {
    if (r.student) return `Only: ${r.student.name}`;
    const parts = [];
    if (r.category) parts.push(r.category);
    else parts.push('All tracks');
    if (r.level) parts.push(r.level);
    else parts.push('All levels');
    return parts.join(' · ');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Materials</h1>
        <p className="text-slate-600 mt-1">
          Upload notes and revision files for your students to download.
        </p>
      </div>

      <form
        onSubmit={handleUpload}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="cdam-accent-bar" />
        <div className="p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-violet-600" />
            Upload new file
          </h2>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100">
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="e.g. Python Week 3 Revision Notes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                className={inputClass}
              >
                {MATERIAL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">File category</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className={inputClass}
              >
                {FILE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className={inputClass}
                placeholder="Optional details for students..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Share with track</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
                disabled={!!studentId}
              >
                <option value="ALL">All tracks (Python & R)</option>
                <option value="PYTHON">Python only</option>
                <option value="R">R only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Share with level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className={inputClass}
                disabled={!!studentId}
              >
                <option value="ALL">All levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="PROFESSIONAL">Professional</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Or send to one student (optional)
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className={inputClass}
              >
                <option value="">All matching students</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">File *</label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className={`${inputClass} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-violet-50 file:text-violet-700`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 cdam-btn-primary font-medium rounded-lg disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Upload for Students'}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Uploaded materials ({resources.length})
        </h2>

        {resources.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            No materials uploaded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {resources.map((r) => (
              <div
                key={r.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900">{r.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.materialType === 'REVISION'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {r.materialType === 'REVISION' ? 'Revision' : 'Notes'}
                    </span>
                  </div>
                  {r.description && (
                    <p className="text-sm text-slate-600 mt-1">{r.description}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {audienceLabel(r)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(r.createdAt).toLocaleString()}
                    {r.fileName && ` · ${r.fileName}`}
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <a
                    href={r.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
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
