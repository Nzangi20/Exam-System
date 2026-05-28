"use client";

import React, { useEffect, useState, use } from 'react';
import axios from 'axios';
import { API_BASE } from '@/lib/api';
import { ArrowLeft, Plus, Trash2, BookOpen, Upload } from 'lucide-react';
import Link from 'next/link';

const CATEGORY_LABELS: Record<string, string> = { PYTHON: '🐍 Python', R: '📊 R Language' };
const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: '🟢 Beginner',
  INTERMEDIATE: '🟡 Intermediate',
  PROFESSIONAL: '🔴 Professional',
};

export default function ExamDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const examId = params.id;
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Question Form State
  const [isAdding, setIsAdding] = useState(false);
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState('MCQ');
  const [qMarks, setQMarks] = useState(1);
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState('');

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/api/exams/${examId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExam(res.data);
        setQuestions(res.data.questions || []);
      } catch (err) {
        console.error("Failed to fetch exam details");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        examId,
        text: qText,
        type: qType,
        marks: Number(qMarks),
        options: qType === 'MCQ' ? qOptions.filter(o => o.trim() !== '') : null,
        correctAnswer: qCorrect
      };
      const res = await axios.post(`${API_BASE}/api/questions`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions([...questions, res.data]);
      setIsAdding(false);
      setQText(''); setQType('MCQ'); setQMarks(1); setQOptions(['', '', '', '']); setQCorrect('');
    } catch (err) {
      console.error("Failed to add question");
      alert("Failed to add question");
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      console.error("Failed to delete");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );
  if (!exam) return <div>Exam not found</div>;

  const totalMarksAdded = questions.reduce((acc, q) => acc + q.marks, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/trainer/exams" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{exam.title}</h1>
              {exam.category && (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                  {CATEGORY_LABELS[exam.category] || exam.category}
                </span>
              )}
              {exam.level && (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700">
                  {LEVEL_LABELS[exam.level] || exam.level}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">Add questions and manage exam structure.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/trainer/exams/${examId}/materials`}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            Materials
          </Link>
          <div className="text-right bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Marks</p>
            <p className="text-xl font-bold text-slate-900">{totalMarksAdded} / {exam.totalMarks}</p>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Questions ({questions.length})</h2>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>
          )}
        </div>

        {isAdding && (
          <form onSubmit={handleAddQuestion} className="bg-white p-6 rounded-xl border border-blue-200 shadow-md space-y-4">
            <h3 className="font-bold text-lg text-slate-800 border-b pb-2">New Question</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">Question Text</label>
                <textarea required value={qText} onChange={e => setQText(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Marks</label>
                <input type="number" required min={1} value={qMarks} onChange={e => setQMarks(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Question Type</label>
                <select value={qType} onChange={e => setQType(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="MCQ">Multiple Choice</option>
                  <option value="TRUE_FALSE">True / False</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                  <option value="ESSAY">Essay</option>
                  <option value="FILE_UPLOAD">File Upload</option>
                </select>
              </div>
            </div>

            {qType === 'MCQ' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-700">Options & Correct Answer</p>
                {qOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input type="radio" name="correctOpt" value={opt} onChange={() => setQCorrect(opt)} required />
                    <input
                      type="text"
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={e => {
                        const newOpts = [...qOptions];
                        newOpts[i] = e.target.value;
                        setQOptions(newOpts);
                      }}
                      className="flex-1 px-3 py-1.5 border rounded outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                ))}
              </div>
            )}

            {qType === 'TRUE_FALSE' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-700">Select Correct Answer</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="tf" value="True" onChange={e => setQCorrect(e.target.value)} required /> True
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="tf" value="False" onChange={e => setQCorrect(e.target.value)} required /> False
                  </label>
                </div>
              </div>
            )}

            {(qType === 'SHORT_ANSWER' || qType === 'ESSAY') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expected Answer / Rubric (Optional)</label>
                <textarea value={qCorrect} onChange={e => setQCorrect(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm">Save Question</button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-slate-900">{q.text}</h4>
                  <span className="shrink-0 ml-4 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded">{q.marks} Marks</span>
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">{q.type.replace('_', ' ')}</div>

                {q.type === 'MCQ' && q.options && (
                  <ul className="space-y-1 mt-2">
                    {JSON.parse(q.options).map((opt: string, i: number) => (
                      <li key={i} className={`text-sm px-3 py-1.5 rounded-md ${opt === q.correctAnswer ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}

                {(q.type === 'TRUE_FALSE' || q.type === 'SHORT_ANSWER') && q.correctAnswer && (
                  <div className="mt-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-md border border-emerald-100">
                    <span className="font-semibold">Correct Answer:</span> {q.correctAnswer}
                  </div>
                )}
              </div>
              <button onClick={() => deleteQuestion(q.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {questions.length === 0 && !isAdding && (
            <div className="text-center py-12 bg-white border border-slate-200 border-dashed rounded-xl">
              <p className="text-slate-500">No questions added yet. Click "Add Question" to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
