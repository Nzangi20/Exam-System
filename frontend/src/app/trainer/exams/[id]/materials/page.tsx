"use client";

import React, { useEffect, useState, use, useRef } from 'react';
import axios from 'axios';
import { API_BASE } from '@/lib/api';
import { ArrowLeft, Upload, Trash2, FileText, FileVideo, File, Download, BookOpen } from 'lucide-react';
import Link from 'next/link';

const FILE_TYPE_OPTIONS = [
  { value: 'document', label: '📄 Document (PDF, Word, etc.)' },
  { value: 'slides',   label: '📊 Slides / Presentation' },
  { value: 'video',    label: '🎬 Video Recording' },
  { value: 'code',     label: '💻 Code / Script' },
  { value: 'other',    label: '📎 Other' },
];

const FILE_ICONS: Record<string, React.ReactNode> = {
  document: <FileText className="w-5 h-5 text-red-500" />,
  slides:   <FileText className="w-5 h-5 text-orange-500" />,
  video:    <FileVideo className="w-5 h-5 text-purple-500" />,
  code:     <FileText className="w-5 h-5 text-blue-500" />,
  other:    <File className="w-5 h-5 text-slate-500" />,
};

export default function TrainerMaterialsPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const examId = params.id;

  const [exam, setExam] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState('document');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [examRes, matsRes] = await Promise.all([
          axios.get(`${API_BASE}/api/exams/${examId}`, { headers }),
          axios.get(`${API_BASE}/api/materials/${examId}`, { headers }),
        ]);

        setExam(examRes.data);
        setMaterials(matsRes.data);
      } catch (err) {
        console.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a file to upload.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please provide a title for the material.');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('examId', examId);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('fileType', fileType);

      const res = await axios.post(`${API_BASE}/api/materials`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMaterials([res.data, ...materials]);
      setTitle('');
      setDescription('');
      setFileType('document');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSuccessMsg('Material uploaded successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/materials/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMaterials(materials.filter(m => m.id !== id));
    } catch (err) {
      alert("Failed to delete material.");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/trainer/exams/${examId}`} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900">Course Materials</h1>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {exam ? `For: ${exam.title}` : 'Loading exam...'} — Upload notes, PDFs, slides, and revision resources for students.
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload New Material
          </h2>
        </div>

        <form onSubmit={handleUpload} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{errorMsg}</div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100">{successMsg}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Week 1 - Introduction to Python"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Material Type</label>
              <select
                value={fileType}
                onChange={e => setFileType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                {FILE_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief description of what this material covers..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">File <span className="text-red-500">*</span></label>
            <div
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">
                {selectedFile ? (
                  <span className="font-semibold text-indigo-600">{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                ) : (
                  <>Click to browse or drag & drop <span className="text-indigo-600 font-semibold">any file type</span></>
                )}
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOCX, PPTX, MP4, PY, R, and more</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={e => setSelectedFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload Material'}
            </button>
          </div>
        </form>
      </div>

      {/* Materials List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Uploaded Materials ({materials.length})</h2>

        {materials.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-10 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No materials uploaded yet</p>
            <p className="text-sm text-slate-400 mt-1">Upload your first revision resource above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {materials.map((mat: any) => (
              <div key={mat.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 group hover:border-indigo-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  {FILE_ICONS[mat.fileType] || FILE_ICONS.other}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{mat.title}</h3>
                  {mat.description && (
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{mat.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="capitalize">{mat.fileType}</span>
                    <span>•</span>
                    <span>Uploaded by {mat.uploader?.name}</span>
                    <span>•</span>
                    <span>{new Date(mat.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={mat.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(mat.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
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
