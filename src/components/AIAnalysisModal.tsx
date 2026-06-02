import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Brain, 
  AlertTriangle, 
  CheckCircle2, 
  Lightbulb, 
  FileText, 
  X, 
  Loader2, 
  Award, 
  Zap, 
  Compass,
  Check,
  Plus,
  HelpCircle,
  FileSpreadsheet,
  Target,
  Wrench,
  BookOpen
} from 'lucide-react';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCompany?: string;
  initialRole?: string;
}

interface TailoringSuggestion {
  section: string;
  issue: string;
  fix: string;
}

interface AnalysisResult {
  match_score: number;
  summary: string;
  key_strengths: string[];
  keyword_gaps: {
    hard_skills: string[];
    soft_skills: string[];
  };
  tailoring_suggestions: TailoringSuggestion[];
  interview_prep_questions: string[];
  // Fallbacks
  match_score_percent: number;
  key_skills_missing: string[];
  resume_optimization_suggestions: string[];
}

// Helpers to dynamically load external parsing dependencies
const loadExternalScript = (id: string, src: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any)[id] || (id === 'pdfjsLib' && (window as any).pdfjsLib)) {
      resolve((window as any)[id] || (window as any).pdfjsLib);
      return;
    }
    // Prevent duplicated script elements
    let script = document.getElementById(id) as HTMLScriptElement;
    if (script) {
      script.addEventListener('load', () => resolve((window as any)[id] || (window as any).pdfjsLib));
      script.addEventListener('error', reject);
      return;
    }
    script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => {
      resolve((window as any)[id] || (window as any).pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const extractTextFromPdf = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  const pdfjsLib = await loadExternalScript('pdfjsLib', 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js');
  // Configure worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
  
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ');
    text += pageText + '\n';
  }
  return text;
};

const extractTextFromDocx = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  const mammoth = await loadExternalScript('mammoth', 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

export default function AIAnalysisModal({
  isOpen,
  onClose,
  initialCompany = '',
  initialRole = '',
}: AIAnalysisModalProps) {
  const [resumeText, setResumeText] = useState(() => {
    return localStorage.getItem('jobtracker_resume') || '';
  });
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'tailoring' | 'preparation'>('matrix');

  // File Upload drag/drop & manual select states
  const [isDragging, setIsDragging] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync resume changes with localStorage
  const handleResumeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setResumeText(text);
    localStorage.setItem('jobtracker_resume', text);
  };

  // Process selected file
  const handleFile = async (file: File) => {
    if (!file) return;
    
    setIsReadingFile(true);
    setFileName(file.name);
    setUploadStatus({ message: `Analyzing and parsing content of ${file.name}...`, type: 'info' });
    
    try {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      let extractedText = '';
      
      if (fileType === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        extractedText = await extractTextFromPdf(arrayBuffer);
      } else if (fileType === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        extractedText = await extractTextFromDocx(arrayBuffer);
      } else if (fileType === 'doc') {
        throw new Error('Pre-compiled binary .doc format is not directly supported client-side. Please upgrade your document to .docx or save as PDF.');
      } else {
        // Assume text-based files (txt, md, rtf, json, csv, etc)
        extractedText = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result && typeof e.target.result === 'string') {
              resolve(e.target.result);
            } else {
              reject(new Error('Unable to read raw text content from file.'));
            }
          };
          reader.onerror = () => reject(new Error('File reader error.'));
          reader.readAsText(file);
        });
      }
      
      if (!extractedText.trim()) {
        throw new Error('Extracted text block was empty. Is the file corrupt or image-only?');
      }
      
      setResumeText(extractedText);
      localStorage.setItem('jobtracker_resume', extractedText);
      setUploadStatus({
        message: `Extracted ${extractedText.length} characters successfully from ${file.name}!`,
        type: 'success'
      });
    } catch (err: any) {
      console.error('File extraction failed:', err);
      setUploadStatus({
        message: err.message || 'Failed to extract text from document.',
        type: 'error'
      });
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Pre-seed some default job description template to help the user get started
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setResult(null);
      setActiveTab('matrix');
      if (initialCompany && initialRole) {
        setJobDescriptionText(
          `Company: ${initialCompany}\nRole: ${initialRole}\n\n[Paste full job description requirements here for in-depth keyword analysis]`
        );
      } else {
        setJobDescriptionText('');
      }
    }
  }, [isOpen, initialCompany, initialRole]);

  // Request analysis from Django Backend
  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Please provide your Resume/CV content.');
      return;
    }
    if (!jobDescriptionText.trim()) {
      setError('Please provide the Job Description content to compare against.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/applications/ai-analyze/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description_text: jobDescriptionText,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setResult({
            match_score: data.match_score !== undefined ? data.match_score : data.match_score_percent,
            summary: data.summary || 'A professional profile evaluation was compiled successfully.',
            key_strengths: data.key_strengths || [],
            keyword_gaps: data.keyword_gaps || { hard_skills: [], soft_skills: [] },
            tailoring_suggestions: data.tailoring_suggestions || [],
            interview_prep_questions: data.interview_prep_questions || [],
            match_score_percent: data.match_score_percent || 0,
            key_skills_missing: data.key_skills_missing || [],
            resume_optimization_suggestions: data.resume_optimization_suggestions || [],
          });
        } else {
          setError(data.detail || 'An unknown analytics error occurred.');
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.detail || `Server error (${response.status}). Please check environment settings or try again.`);
      }
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setError('Failed to query the backend AI endpoint. Please make sure the server is online.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="ai-analysis-overlay"
        className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[250] p-4 text-slate-100 font-sans overflow-y-auto"
      >
        <motion.div
          id="ai-analysis-container"
          initial={{ scale: 0.96, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="bg-[#0a0f1d] border border-slate-800/80 w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl flex flex-col my-4 max-h-[92vh]"
        >
          {/* Header Title Bar */}
          <div className="bg-[#050811] p-5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                <Brain className="w-5.5 h-5.5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <span>ATS Smart Analyst</span>
                  <span className="flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase shadow-sm select-none">
                    <Sparkles className="w-2.5 h-2.5 animate-pulse text-amber-300" />
                    <span>Expert AI Engine</span>
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                  Critically evaluate technical fit, identify resume gaps, and output tailored optimizations.
                </p>
              </div>
            </div>
            <button
              id="ai-analysis-close-btn"
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xs font-medium bg-slate-900 border border-slate-800 hover:border-slate-700 py-1.5 px-3 rounded-lg cursor-pointer transition select-none flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span>Close View</span>
            </button>
          </div>

          {/* Master Split Grid */}
          <div className="p-6 flex flex-col lg:flex-row gap-6 overflow-y-auto w-full">
            
            {/* Input fields panel (Left Column) */}
            <div className="w-full lg:w-5/12 flex flex-col gap-4 shrink-0 border-r border-slate-800/40 lg:pr-6">
              
              {/* Resume text area with drag-and-drop & manual upload support */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Candidate Resume Text *</span>
                  </label>
                  <span className="text-[9px] text-slate-500 italic">Drag & drop supported</span>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.txt,.md,.json,.csv"
                  className="hidden"
                />

                {/* Drag and Drop Zone */}
                <motion.div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                  className={`border-2 border-dashed rounded-xl p-4 mb-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 select-none ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-950/25 text-white shadow-lg shadow-indigo-500/10' 
                      : 'border-slate-800 bg-[#070b15]/90 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isReadingFile ? (
                    <div className="flex flex-col items-center gap-1.5 py-1">
                      <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                      <p className="text-xs font-bold text-indigo-200">Processing attachment...</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{fileName}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 py-1">
                      <div className="p-2 bg-slate-900/60 rounded-lg group-hover:bg-slate-900/90 transition-colors">
                        <FileText className="w-5 h-5 text-indigo-400" />
                      </div>
                      <p className="text-xs font-semibold">
                        Drag resume here, or <span className="text-indigo-400 underline decoration-indigo-500/50 hover:text-indigo-350">browse file</span>
                      </p>
                      <p className="text-[9px] text-slate-500">
                        Supports PDF, DOCX, TXT, or MD
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Upload Status Feedbacks */}
                {uploadStatus && (
                  <div className={`text-[10.5px] px-3.5 py-2 rounded-xl mb-3 border font-sans flex items-center justify-between gap-2 ${
                    uploadStatus.type === 'success' 
                      ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
                      : uploadStatus.type === 'error'
                      ? 'bg-rose-955/20 border-rose-900/30 text-rose-400'
                      : 'bg-indigo-955/20 border-indigo-900/30 text-indigo-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      {uploadStatus.type === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : uploadStatus.type === 'error' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-450 shrink-0" />
                      ) : (
                        <Loader2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 animate-spin" />
                      )}
                      <span>{uploadStatus.message}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadStatus(null);
                        setFileName(null);
                      }}
                      className="text-slate-500 hover:text-slate-350 hover:bg-slate-900/55 p-1 rounded-md cursor-pointer transition select-none shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <textarea
                  id="ai-analysis-resume-input"
                  rows={8}
                  placeholder="Paste candidate technical resume content (skills, work history, tech stack, and achievements)..."
                  value={resumeText}
                  onChange={handleResumeChange}
                  className="w-full bg-slate-950/80 border border-slate-800/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-xs outline-none text-slate-100 placeholder:text-slate-650 resize-y font-sans transition-all leading-relaxed"
                />
              </div>

              {/* Job description text area */}
              <div className="flex flex-col">
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5 px-0.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Target Job Description Requirements *</span>
                </label>
                <textarea
                  id="ai-analysis-jd-input"
                  rows={8}
                  placeholder="Paste the target employer's job expectations, candidate qualifications, and desired stack..."
                  value={jobDescriptionText}
                  onChange={(e) => setJobDescriptionText(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-xs outline-none text-slate-100 placeholder:text-slate-650 resize-y font-sans transition-all leading-relaxed"
                />
              </div>

              {/* Action Trigger Button */}
              <div className="mt-1 flex flex-col gap-3">
                {error && (
                  <div className="p-3 bg-rose-950/30 border border-rose-900/40 rounded-xl flex items-start gap-2 text-rose-300 text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-450 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-rose-300">Analysis Conflict</p>
                      <p className="mt-0.5 text-rose-200/90 leading-relaxed text-[11px]">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  id="ai-analysis-action-btn"
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full bg-indigo-600 hover:bg-indigo-550 disabled:bg-[#131b32] disabled:border-slate-800/60 disabled:text-slate-500 disabled:cursor-not-allowed border border-indigo-500/20 py-3 rounded-xl text-xs font-bold text-white shadow-xl shadow-indigo-600/15 transition-all flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 text-indigo-300 animate-spin" />
                      <span className="font-semibold select-none">Synthesizing ATS Matrix Alignment...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-305" />
                      <span className="select-none">Analyze ATS Match & Tailor Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results display panel (Right Column) */}
            <div className="flex-1 flex flex-col bg-slate-950/30 border border-slate-900/80 rounded-xl p-4 min-h-[460px] overflow-hidden">
              
              {analyzing ? (
                /* Animated loading state panel */
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-dashed border-indigo-500/10" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
                      className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent"
                    />
                    <Brain className="w-8 h-8 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="text-center max-w-sm">
                    <p className="text-sm font-bold text-white tracking-wide">Evaluating Technical Alignments</p>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      Deeply index hard skills, soft alignment ratios, experience depth, and formatting gaps. Generating precise interview criteria...
                    </p>
                  </div>
                </div>
              ) : result ? (
                /* Rich dashboard output */
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  
                  {/* Performance Hub Top Info block */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                    
                    {/* Ring gauge representation */}
                    <div className="bg-[#050811] border border-slate-800/60 rounded-xl p-3 flex items-center gap-3">
                      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="41"
                            fill="none"
                            stroke="#131a2e"
                            strokeWidth="8"
                          />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="41"
                            fill="none"
                            stroke={
                              result.match_score >= 80 ? '#10b981' : 
                              result.match_score >= 60 ? '#6366f1' : '#f43f5e'
                            }
                            strokeWidth="8"
                            strokeDasharray={2 * Math.PI * 41}
                            initial={{ strokeDashoffset: 2 * Math.PI * 41 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 41 * (1 - result.match_score / 100) }}
                            transition={{ duration: 1.1, ease: 'easeOut' }}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-sm font-extrabold text-white">
                          {result.match_score}%
                        </span>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ATS MATCH SCORE</h4>
                        <p className={`text-xs font-extrabold mt-0.5 ${
                          result.match_score >= 80 ? 'text-emerald-400' :
                          result.match_score >= 60 ? 'text-indigo-400' : 'text-rose-400'
                        }`}>
                          {result.match_score >= 80 ? 'High Alignment' :
                           result.match_score >= 60 ? 'Moderate Fit' : 'Tailoring Mandatory'}
                        </p>
                      </div>
                    </div>

                    {/* Summary Card */}
                    <div className="md:col-span-2 bg-[#050811] border border-slate-800/60 rounded-xl p-3.5 flex flex-col justify-center">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                        <Target className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Executive Summary Assessment</span>
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed mt-1.5 line-clamp-2">
                        {result.summary}
                      </p>
                    </div>

                  </div>

                  {/* Intersecting Navigation HUD Tabs */}
                  <div className="flex border-b border-slate-800/60 mb-4 select-none">
                    <button
                      type="button"
                      onClick={() => setActiveTab('matrix')}
                      className={`px-4 py-2 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                        activeTab === 'matrix' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Skill Matrix Gaps</span>
                      {result.keyword_gaps.hard_skills.length + result.keyword_gaps.soft_skills.length > 0 && (
                        <span className="bg-rose-500/20 text-rose-400 text-[9px] px-1.5 py-0.2 rounded-full font-sans font-extrabold">
                          {result.keyword_gaps.hard_skills.length + result.keyword_gaps.soft_skills.length}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('tailoring')}
                      className={`px-4 py-2 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                        activeTab === 'tailoring' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>ATS Refinement Checklist</span>
                      {result.tailoring_suggestions.length > 0 && (
                        <span className="bg-indigo-500/20 text-indigo-400 text-[9px] px-1.5 py-0.2 rounded-full font-sans font-extrabold">
                          {result.tailoring_suggestions.length}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('preparation')}
                      className={`px-4 py-2 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                        activeTab === 'preparation' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Interview Prep Hub</span>
                      {result.interview_prep_questions.length > 0 && (
                        <span className="bg-amber-550/20 text-amber-455 text-[9px] px-1.5 py-0.2 rounded-full font-sans font-extrabold">
                          {result.interview_prep_questions.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Inner Content Area */}
                  <div className="flex-1 overflow-y-auto pr-1">
                    {activeTab === 'matrix' && (
                      <div className="flex flex-col gap-4 animate-fadeIn">
                        
                        {/* Strengths Row */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider flex items-center gap-1 px-1">
                            <Award className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-450">Identified Strengths & Matches ({result.key_strengths.length})</span>
                          </label>
                          <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-xl p-3.5 mt-1.5 grid grid-cols-1 md:grid-cols-3 gap-2.5">
                            {result.key_strengths.length > 0 ? (
                              result.key_strengths.map((str, idx) => (
                                <div key={idx} className="flex gap-2 items-start bg-slate-950/40 p-2.5 rounded-lg border border-emerald-900/10 hover:border-emerald-800/35 transition">
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  <span className="text-[11px] text-slate-300 font-medium font-sans leading-relaxed">{str}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-[11px] text-slate-400 italic">No significant matching accomplishments identified yet.</p>
                            )}
                          </div>
                        </div>

                        {/* Keyword Gaps Grid Split */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Hard skills missing keywords */}
                          <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5 px-0.5">
                              <span className="inline-block w-1.5 h-1.5 bg-rose-500 rounded-full" />
                              <span>Hard Skill Keyword Gaps ({result.keyword_gaps.hard_skills.length})</span>
                            </label>
                            <div className="bg-rose-950/5 border border-rose-950/30 rounded-xl p-3 flex-1 min-h-[140px]">
                              {result.keyword_gaps.hard_skills.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {result.keyword_gaps.hard_skills.map((skill, index) => (
                                    <span
                                      key={index}
                                      className="text-[10px] font-bold px-2.5 py-1 bg-rose-950/30 border border-rose-900/20 text-rose-300 rounded-lg flex items-center gap-1 cursor-default hover:bg-rose-900/30 hover:border-rose-700/50 transition font-sans"
                                    >
                                      <Plus className="w-2.5 h-2.5 text-rose-400 rotate-45 shrink-0" />
                                      <span>{skill}</span>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic flex items-center gap-1.5 pt-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  <span>No critical hard skill discrepancies.</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Soft Skills Missing */}
                          <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5 px-0.5">
                              <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full" />
                              <span>Soft Skill & Process Gaps ({result.keyword_gaps.soft_skills.length})</span>
                            </label>
                            <div className="bg-amber-950/5 border border-amber-950/20 rounded-xl p-3 flex-1 min-h-[140px]">
                              {result.keyword_gaps.soft_skills.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {result.keyword_gaps.soft_skills.map((skill, index) => (
                                    <span
                                      key={index}
                                      className="text-[10px] font-bold px-2.5 py-1 bg-amber-950/20 border border-amber-900/10 text-amber-350 rounded-lg flex items-center gap-1 cursor-default hover:bg-amber-900/20 transition font-sans"
                                    >
                                      <Plus className="w-2.5 h-2.5 text-amber-400 rotate-45 shrink-0" />
                                      <span>{skill}</span>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic flex items-center gap-1.5 pt-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  <span>No critical process or alignment gaps.</span>
                                </p>
                              )}
                            </div>
                          </div>

                        </div>

                      </div>
                    )}

                    {activeTab === 'tailoring' && (
                      <div className="animate-fadeIn flex flex-col gap-3.5">
                        <div className="px-1 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-400">TARGET SECTION CHEATSHEETS</span>
                          <span className="text-[9px] text-emerald-450 bg-emerald-500/10 px-2 py-0.5 border border-emerald-900/20 rounded-full font-bold">Recommended action plans</span>
                        </div>
                        
                        <div className="flex flex-col gap-2.5">
                          {result.tailoring_suggestions.length > 0 ? (
                            result.tailoring_suggestions.map((sug, index) => (
                              <div 
                                key={index} 
                                className="bg-[#060a16] border border-slate-800/80 rounded-xl p-3.5 hover:border-indigo-900/40 transition-colors flex flex-col"
                              >
                                <div className="flex items-center justify-between border-b border-slate-800/40 pb-2 mb-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="bg-indigo-500/15 text-indigo-300 text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded">
                                      {sug.section}
                                    </span>
                                    <span className="text-slate-400 text-xs font-bold">Action Item</span>
                                  </div>
                                  <span className="text-slate-600 font-mono text-[9px]">STEP 0{index + 1}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                                  <div>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Alignment Issue</p>
                                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed font-sans">{sug.issue}</p>
                                  </div>
                                  <div className="bg-emerald-950/5 border border-emerald-955/20 rounded-lg p-2.5 flex items-start gap-2">
                                    <Lightbulb className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Recommended Refactoring</p>
                                      <p className="text-[10.5px] text-slate-200 mt-1 leading-relaxed font-sans font-medium">{sug.fix}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-slate-500 text-xs italic">
                              No complex formatting or content recommendations. Your profile text fits beautifully.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'preparation' && (
                      <div className="animate-fadeIn flex flex-col gap-4">
                        <div className="bg-amber-950/10 border border-amber-900/20 rounded-xl p-4 flex items-start gap-3">
                          <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                          <div>
                            <h4 className="font-bold text-xs text-amber-400">Targeted Behavioral & Technical Sparring</h4>
                            <p className="text-[11px] text-slate-350 leading-relaxed mt-1">
                              These context-driven mock questions are custom engineered to pressure-test the gaps between your resume structure and the job role requirements. Practice compiling these answers!
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          {result.interview_prep_questions.length > 0 ? (
                            result.interview_prep_questions.map((question, index) => (
                              <div 
                                key={index} 
                                className="bg-[#050811] border border-slate-800/60 rounded-xl p-4 hover:border-amber-500/20 transition-all flex gap-3"
                              >
                                <span className="w-6 h-6 shrink-0 bg-amber-500/10 text-amber-400 text-xs font-mono font-bold rounded-lg flex items-center justify-center">
                                  Q{index + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="text-[11px] text-slate-200 font-sans leading-relaxed font-semibold">
                                    {question}
                                  </p>
                                  <p className="text-[9px] text-slate-500 mt-1.5 uppercase font-bold tracking-widest">
                                    Recruiter's Intended Evaluation criteria: Focus on resolving highlighted skill gaps
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-slate-500 text-xs italic">
                              No customized prep questions drafted yet. Run analysis to compile.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                /* Initial state placeholder */
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-400/40 mb-3.5">
                    <Award className="w-6 h-6 text-indigo-400/60" />
                  </div>
                  <h4 className="font-bold text-xs text-white">ATS Profiler & Optimization Suite</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1.5 max-w-xs">
                    Paste your background credentials or career records on the left and copy target qualifications specs to compute instant suitability ratings.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Footer status bar / Credits */}
          <div className="bg-[#050811] px-6 py-4 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 select-none shrink-0">
            <span className="font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              <span>COGNITIVE MATCH MATRIX v2.5</span>
            </span>
            <span>Unbiased Deep Recruiter Evaluation Sandbox</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
