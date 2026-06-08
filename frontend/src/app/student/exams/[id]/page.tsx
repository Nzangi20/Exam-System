"use client";

import React, { useEffect, useState, use } from 'react';
import axios from 'axios';
import { API_BASE } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AntiCheatWrapper from '@/components/AntiCheatWrapper';
import { Clock, AlertCircle, BookOpen, FileText, FileVideo, File, Play, Eye, X } from 'lucide-react';

const FILE_ICONS: Record<string, React.ReactNode> = {
  document: <FileText className="w-4 h-4 text-red-500" />,
  slides:   <FileText className="w-4 h-4 text-orange-500" />,
  video:    <FileVideo className="w-4 h-4 text-purple-500" />,
  code:     <FileText className="w-4 h-4 text-blue-500" />,
  other:    <File className="w-4 h-4 text-slate-500" />,
};

export default function TakeExamPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const examId = params.id;
  const { user } = useAuth();
  const router = useRouter();

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [viewingResource, setViewingResource] = useState<any>(null);

  const getFullUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `${API_BASE}/${cleanUrl}`;
  };

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const [examRes, matsRes] = await Promise.all([
          axios.get(`${API_BASE}/api/exams/${examId}`, { headers }),
          axios.get(`${API_BASE}/api/materials/${examId}`, { headers }),
        ]);
        setExam(examRes.data);
        setQuestions(examRes.data.questions || []);
        setMaterials(matsRes.data || []);
        setTimeLeft(examRes.data.duration * 60);
      } catch (err) {
        console.error("Failed to fetch exam data");
      } finally {
        setLoading(false);
      }
    };
    fetchExamData();
  }, [examId]);

  useEffect(() => {
    if (!examStarted || timeLeft === null) return;
    if (timeLeft <= 0) {
      handleSubmitExam();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev! - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, examStarted]);

  const handleAnswerChange = async (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    // Auto-save
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/api/answers`, {
        examId,
        questionId,
        textAnswer: answer,
        fileUrl: null // Add file upload logic later if needed
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Auto-save failed");
    }
  };

  const handleSubmitExam = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/api/results/submit`, {
        examId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push('/student/results');
    } catch (err) {
      console.error("Failed to submit exam");
      alert("Failed to submit exam");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );
  if (!exam || questions.length === 0) return (
    <div className="text-center py-16 text-slate-500">Exam not available or has no questions.</div>
  );

  // Pre-exam lobby: show study materials and start button
  if (!examStarted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-6 text-white">
            <h1 className="text-2xl font-bold">{exam.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-slate-300 text-sm">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {exam.duration} minutes</span>
              <span>{questions.length} questions</span>
              <span>{exam.totalMarks} total marks</span>
            </div>
          </div>
          {exam.instructions && (
            <div className="px-8 py-4 bg-amber-50 border-b border-amber-100 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Instructions</p>
                <p className="text-sm text-amber-700 mt-0.5">{exam.instructions}</p>
              </div>
            </div>
          )}
          <div className="px-8 py-6">
            <button
              onClick={() => setExamStarted(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all active:scale-[0.99] text-lg"
            >
              <Play className="w-5 h-5" /> Begin Exam
            </button>
          </div>
        </div>

        {materials.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Study Materials</h2>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">{materials.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {materials.map((mat: any) => (
                <div key={mat.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    {FILE_ICONS[mat.fileType] || FILE_ICONS.other}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{mat.title}</p>
                    {mat.description && <p className="text-xs text-slate-500 truncate mt-0.5">{mat.description}</p>}
                  </div>
                  <button
                    onClick={() => setViewingResource(mat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-medium rounded-lg transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Viewer Modal */}
        {viewingResource && (() => {
          const fullUrl = getFullUrl(viewingResource.fileUrl);
          return (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-950 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl border border-slate-800 overflow-hidden">
                {/* Modal Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-900">
                  <div className="min-w-0">
                    <h3 className="font-bold text-white truncate">{viewingResource.title}</h3>
                    {viewingResource.description && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{viewingResource.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setViewingResource(null)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Body / Viewer */}
                <div className="flex-1 bg-slate-900 relative">
                  {viewingResource.fileUrl?.endsWith('.pdf') ? (
                    <iframe
                      src={`${fullUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full h-full border-none"
                      title={viewingResource.title}
                    />
                  ) : viewingResource.fileUrl?.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video
                      src={fullUrl}
                      controls
                      controlsList="nodownload"
                      className="w-full h-full object-contain"
                    />
                  ) : viewingResource.fileUrl?.match(/\.(png|jpe?g|gif|webp|svg)$/i) ? (
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <img
                        src={fullUrl}
                        alt={viewingResource.title}
                        className="max-w-full max-h-full object-contain rounded"
                      />
                    </div>
                  ) : (
                    <iframe
                      src={`${fullUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full h-full border-none"
                      title={viewingResource.title}
                    />
                  )}
                </div>
                {/* Disclaimer Footer */}
                <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 text-center text-xs text-slate-500 font-semibold select-none">
                  🔒 Protected Study Material. Direct downloads are restricted.
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  const currentQuestion = questions[currentQIndex];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <AntiCheatWrapper examId={examId} studentId={user?.id || ''}>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{exam.title}</h1>
            <p className="text-slate-400 text-sm mt-1">Question {currentQIndex + 1} of {questions.length}</p>
          </div>
          <div className={`flex items-center gap-2 text-lg font-mono font-bold ${timeLeft! < 300 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft!)}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-8">
             <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-medium text-slate-800 leading-relaxed">
                  {currentQuestion.text}
                </h2>
                <span className="shrink-0 ml-6 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-bold rounded">
                  {currentQuestion.marks} Marks
                </span>
             </div>

             <div className="mt-8 space-y-4">
               {currentQuestion.type === 'MCQ' && currentQuestion.options && (
                 <div className="space-y-3">
                   {JSON.parse(currentQuestion.options).map((opt: string, i: number) => (
                     <label key={i} className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${answers[currentQuestion.id] === opt ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                        <input 
                          type="radio" 
                          name={currentQuestion.id} 
                          value={opt}
                          checked={answers[currentQuestion.id] === opt}
                          onChange={() => handleAnswerChange(currentQuestion.id, opt)}
                          className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-slate-700">{opt}</span>
                     </label>
                   ))}
                 </div>
               )}

               {currentQuestion.type === 'TRUE_FALSE' && (
                 <div className="flex gap-4">
                   {['True', 'False'].map((opt) => (
                     <label key={opt} className={`flex-1 flex items-center justify-center gap-2 p-4 border rounded-xl cursor-pointer transition-all ${answers[currentQuestion.id] === opt ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-slate-200 hover:border-blue-300 text-slate-700'}`}>
                        <input 
                          type="radio" 
                          name={currentQuestion.id} 
                          value={opt}
                          checked={answers[currentQuestion.id] === opt}
                          onChange={() => handleAnswerChange(currentQuestion.id, opt)}
                          className="hidden"
                        />
                        {opt}
                     </label>
                   ))}
                 </div>
               )}

               {(currentQuestion.type === 'SHORT_ANSWER' || currentQuestion.type === 'ESSAY') && (
                 <textarea
                   rows={currentQuestion.type === 'ESSAY' ? 8 : 3}
                   value={answers[currentQuestion.id] || ''}
                   onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                   placeholder="Type your answer here..."
                   className="w-full p-4 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all resize-y"
                 />
               )}
             </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex justify-between items-center">
           <button 
             onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
             disabled={currentQIndex === 0}
             className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg disabled:opacity-50 hover:bg-white transition"
           >
             Previous
           </button>
           
           <div className="flex gap-2">
             {currentQIndex === questions.length - 1 ? (
               <button 
                 onClick={handleSubmitExam}
                 className="px-8 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition"
               >
                 Submit Exam
               </button>
             ) : (
               <button 
                 onClick={() => setCurrentQIndex(prev => Math.min(questions.length - 1, prev + 1))}
                 className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition"
               >
                 Next
               </button>
             )}
           </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-6 flex justify-center flex-wrap gap-2 px-4">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => setCurrentQIndex(i)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium text-sm transition-all
              ${currentQIndex === i ? 'ring-2 ring-blue-600 ring-offset-2 ' : ''}
              ${answers[q.id] ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}
            `}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </AntiCheatWrapper>
  );
}
