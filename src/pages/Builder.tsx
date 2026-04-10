import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Wand2, Download, Layout as LayoutIcon, 
  ChevronLeft, ChevronRight, Save, Cpu, 
  User, Briefcase, GraduationCap, Code, Folder, Award,
  Eye, Edit3, Settings, Mail, Phone, MapPin, Linkedin, X, FileText
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ResumeData, Experience, Education, Project, Certification, TemplateType } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { GoogleGenAI } from "@google/genai"; // kept for type compat — replaced at runtime
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/* ── AI proxy helper ───────────────────────────────────────────────── */
/** Calls our own /api/ai serverless proxy (avoids CORS & keeps key server-side) */
async function askNvidia(prompt: string): Promise<string> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI proxy error ${res.status}: ${err}`);
  }
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return (json.text ?? '').trim();
}
import { useAuth } from '../contexts/AuthContext';

// --- Components ---

const SectionHeader = ({ icon: Icon, title, onAdd, addLabel }: any) => (
  <div className="flex items-center justify-between mb-6 border-b border-brand-border pb-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center">
        <Icon className="text-brand-cyan w-5 h-5" />
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
    {onAdd && (
      <button 
        onClick={onAdd}
        className="flex items-center gap-2 text-sm font-bold text-brand-cyan hover:text-brand-cyan/80 transition-colors"
      >
        <Plus className="w-4 h-4" /> {addLabel || 'Add'}
      </button>
    )}
  </div>
);

const Input = ({ label, value, onChange, placeholder, type = "text", multiline = false }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full bg-brand-secondary border border-brand-border rounded-xl px-4 py-3 text-sm outline-none resize-none input-glow"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-brand-secondary border border-brand-border rounded-xl px-4 py-3 text-sm outline-none input-glow"
      />
    )}
  </div>
);

// --- Main Builder Page ---

export default function Builder() {
  const [data, setData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      portfolio: '',
      summary: '',
    },
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
  });

  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  const [showAIModal, setShowAIModal] = useState(false);
  const [showArymeModal, setShowArymeModal] = useState(false);
  const [arymePrompt, setArymePrompt] = useState('');
  const [isArymeGenerating, setIsArymeGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiType, setAiType] = useState<string>('');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [template, setTemplate] = useState<TemplateType>('modern');
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [targetRole, setTargetRole] = useState('');
  
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const openAIModal = (type: string) => {
    setAiType(type);
    setShowAIModal(true);
    setAiResult(null);
  };

  // Load from Firestore or localStorage
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'resumes', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const savedData = docSnap.data();
            setData(JSON.parse(savedData.data));
            return;
          }
        } catch (e) {
          console.error("Failed to load from Firestore", e);
        }
      }
      
      // Fallback to localStorage
      const saved = localStorage.getItem('resume_data');
      if (saved) {
        try {
          setData(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to load saved data");
        }
      }
    };
    
    loadData();
  }, [user]);

  // Auto-save to Firestore and localStorage
  useEffect(() => {
    localStorage.setItem('resume_data', JSON.stringify(data));
    
    if (!user) return;

    const saveData = async () => {
      setIsSaving(true);
      try {
        await setDoc(doc(db, 'resumes', user.uid), {
          uid: user.uid,
          data: JSON.stringify(data),
          updatedAt: serverTimestamp()
        });
        setLastSaved(new Date());
      } catch (e) {
        console.error("Failed to save to Firestore", e);
      } finally {
        setIsSaving(false);
      }
    };

    const timeoutId = setTimeout(saveData, 1000); // debounce 1s
    return () => clearTimeout(timeoutId);
  }, [data, user]);

  const handlePersonalInfoChange = (field: string, value: string) => {
    setData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const addItem = (section: keyof ResumeData) => {
    const id = Math.random().toString(36).substr(2, 9);
    if (section === 'experience') {
      setData(prev => ({
        ...prev,
        experience: [...prev.experience, { id, company: '', position: '', startDate: '', endDate: '', description: '', bullets: [] }]
      }));
    } else if (section === 'education') {
      setData(prev => ({
        ...prev,
        education: [...prev.education, { id, school: '', degree: '', startDate: '', endDate: '', description: '' }]
      }));
    } else if (section === 'projects') {
      setData(prev => ({
        ...prev,
        projects: [...prev.projects, { id, name: '', description: '', link: '', technologies: [] }]
      }));
    } else if (section === 'certifications') {
      setData(prev => ({
        ...prev,
        certifications: [...prev.certifications, { id, name: '', issuer: '', date: '' }]
      }));
    }
  };

  const removeItem = (section: keyof ResumeData, id: string) => {
    setData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).filter(item => item.id !== id)
    }));
  };

  const updateItem = (section: keyof ResumeData, id: string, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const handleAIAction = async (type: string, content: any, context?: string) => {
    setIsGenerating(true);
    try {
      let prompt = '';
      if (type === 'summary') {
        prompt = `Generate a professional, high-impact resume summary for a person with the following details: ${JSON.stringify(content)}. Keep it concise (3-4 sentences) and ATS-friendly. Return only the summary text, no labels.`;
      } else if (type === 'skills') {
        prompt = `Suggest 5-8 relevant technical and soft skills for a professional with this background: ${JSON.stringify(content)}. Return only a comma-separated list, nothing else.`;
      } else if (type === 'cover-letter') {
        prompt = `Write a professional cover letter based on this resume data: ${JSON.stringify(content)}. Target role: ${context}. Keep it modern, persuasive, and professional.`;
      } else if (type === 'score') {
        prompt = `Analyze this resume data and provide a score out of 100 based on ATS friendliness, content quality, and professional impact. Also provide 3 actionable tips for improvement. Data: ${JSON.stringify(content)}. Return ONLY valid JSON like: {"score": number, "tips": string[]}. No markdown, no explanation.`;
      }

      const resultText = await askNvidia(prompt);

      if (type === 'summary') {
        handlePersonalInfoChange('summary', resultText);
      } else if (type === 'skills') {
        const skills = resultText.split(',').map((s: string) => s.trim()).filter(Boolean);
        setData(prev => ({ ...prev, skills: [...new Set([...prev.skills, ...skills])] }));
      }
      return resultText;
    } catch (error) {
      console.error('AI Enhancement failed', error);
      alert('AI request failed. Check your API key or network.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleArymeGenerate = async () => {
    if (!arymePrompt.trim()) return;
    setIsArymeGenerating(true);
    try {
      const prompt = `You are an expert resume writer. Generate a complete, professional resume based on the following description:
"${arymePrompt}"

Return ONLY a valid JSON object matching this TypeScript interface exactly:
interface ResumeData {
  personalInfo: { fullName: string; email: string; phone: string; location: string; linkedin: string; portfolio: string; summary: string; };
  education: { id: string; school: string; degree: string; startDate: string; endDate: string; description: string; }[];
  experience: { id: string; company: string; position: string; startDate: string; endDate: string; description: string; bullets: string[]; }[];
  skills: string[];
  projects: { id: string; name: string; description: string; link: string; technologies: string[]; }[];
  certifications: { id: string; name: string; issuer: string; date: string; }[];
}

Ensure all IDs are unique strings (e.g., "exp-1", "edu-1"). Do not include markdown formatting or code fences. Return only the raw JSON string.`;

      let jsonString = await askNvidia(prompt);
      // Strip any accidental markdown fences
      jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const generatedData = JSON.parse(jsonString) as ResumeData;
      setData(generatedData);
      setShowArymeModal(false);
      setArymePrompt('');
    } catch (error) {
      console.error('Smart Generate failed', error);
      alert('Failed to generate resume. Please try again or check your connection.');
    } finally {
      setIsArymeGenerating(false);
    }
  };

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    
    const canvas = await html2canvas(previewRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${data.personalInfo.fullName || 'Resume'}_Resume.pdf`);
  };

  return (
    <div className="pt-24 min-h-screen bg-brand-dark flex flex-col">
      {/* Toolbar */}
      <div className="glass border-b border-brand-border px-6 py-3 flex items-center justify-between sticky top-[72px] z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('content')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'content' ? "bg-gradient-premium text-white shadow-[0_0_15px_rgba(34,211,238,0.3)]" : "text-gray-400 hover:text-white"
            )}
          >
            <Edit3 className="w-4 h-4" /> Content
          </button>
          <button 
            onClick={() => setActiveTab('design')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'design' ? "bg-gradient-premium text-white shadow-[0_0_15px_rgba(34,211,238,0.3)]" : "text-gray-400 hover:text-white"
            )}
          >
            <Settings className="w-4 h-4" /> Design
          </button>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 mr-4">
              {isSaving ? (
                <><div className="w-3 h-3 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" /> Saving...</>
              ) : lastSaved ? (
                <><Save className="w-3 h-3 text-brand-cyan" /> Saved</>
              ) : null}
            </div>
          )}
          <button 
            onClick={() => setShowMobilePreview(!showMobilePreview)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-full glass text-white font-bold text-sm hover:bg-white/5 transition-all"
          >
            {showMobilePreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showMobilePreview ? 'Edit' : 'Preview'}
          </button>
          <button 
            onClick={() => setShowArymeModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full glass text-brand-green font-bold text-sm hover:bg-white/10 hover:shadow-[0_0_15px_rgba(57,255,20,0.2)] transition-all"
          >
            <Cpu className="w-4 h-4" /> Smart Generate
          </button>
          <button 
            onClick={() => openAIModal('score')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full glass text-brand-cyan font-bold text-sm hover:bg-white/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all"
          >
            <Cpu className="w-4 h-4" /> Resume Score
          </button>
          <button 
            onClick={() => openAIModal('cover-letter')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full glass text-brand-blue font-bold text-sm hover:bg-white/10 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
          >
            <FileText className="w-4 h-4" /> Cover Letter
          </button>
          <button 
            onClick={downloadPDF}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-premium neon-glow-hover text-white font-bold text-sm transition-all"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row h-[calc(100vh-128px)] overflow-hidden">
        {/* Left Panel: Form */}
        <div className={cn(
          "w-full lg:w-1/2 overflow-y-auto p-8 border-r border-brand-border custom-scrollbar",
          showMobilePreview ? "hidden lg:block" : "block"
        )}>
          <AnimatePresence mode="wait">
            {activeTab === 'content' ? (
              <motion.div 
                key="content"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12 max-w-2xl mx-auto"
              >
                {/* Personal Info */}
                <section>
                  <SectionHeader icon={User} title="Personal Information" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Full Name" value={data.personalInfo.fullName} onChange={(v: string) => handlePersonalInfoChange('fullName', v)} placeholder="John Doe" />
                    <Input label="Email" value={data.personalInfo.email} onChange={(v: string) => handlePersonalInfoChange('email', v)} placeholder="john@example.com" type="email" />
                    <Input label="Phone" value={data.personalInfo.phone} onChange={(v: string) => handlePersonalInfoChange('phone', v)} placeholder="+1 234 567 890" />
                    <Input label="Location" value={data.personalInfo.location} onChange={(v: string) => handlePersonalInfoChange('location', v)} placeholder="New York, NY" />
                    <Input label="LinkedIn" value={data.personalInfo.linkedin} onChange={(v: string) => handlePersonalInfoChange('linkedin', v)} placeholder="linkedin.com/in/johndoe" />
                    <Input label="Portfolio" value={data.personalInfo.portfolio} onChange={(v: string) => handlePersonalInfoChange('portfolio', v)} placeholder="johndoe.com" />
                  </div>
                  <div className="mt-6 relative">
                    <Input label="Professional Summary" value={data.personalInfo.summary} onChange={(v: string) => handlePersonalInfoChange('summary', v)} placeholder="Brief overview of your career..." multiline />
                    <button 
                      onClick={() => handleAIAction('summary', data)}
                      disabled={isGenerating}
                      className="absolute top-0 right-0 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-cyan hover:text-brand-cyan/80 transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? 'Generating...' : <><Cpu className="w-3 h-3" /> Generate</>}
                    </button>
                  </div>
                </section>

                {/* Experience */}
                <section>
                  <SectionHeader icon={Briefcase} title="Work Experience" onAdd={() => addItem('experience')} addLabel="Add Experience" />
                  <div className="space-y-8">
                    {data.experience.map((exp) => (
                      <div key={exp.id} className="glass-card glass-card-hover p-6 relative group">
                        <button 
                          onClick={() => removeItem('experience', exp.id)}
                          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <Input label="Company" value={exp.company} onChange={(v: string) => updateItem('experience', exp.id, 'company', v)} placeholder="Company Name" />
                          <Input label="Position" value={exp.position} onChange={(v: string) => updateItem('experience', exp.id, 'position', v)} placeholder="Software Engineer" />
                          <Input label="Start Date" value={exp.startDate} onChange={(v: string) => updateItem('experience', exp.id, 'startDate', v)} placeholder="Jan 2020" />
                          <Input label="End Date" value={exp.endDate} onChange={(v: string) => updateItem('experience', exp.id, 'endDate', v)} placeholder="Present" />
                        </div>
                        <Input label="Description" value={exp.description} onChange={(v: string) => updateItem('experience', exp.id, 'description', v)} placeholder="Describe your responsibilities..." multiline />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Education */}
                <section>
                  <SectionHeader icon={GraduationCap} title="Education" onAdd={() => addItem('education')} addLabel="Add Education" />
                  <div className="space-y-8">
                    {data.education.map((edu) => (
                      <div key={edu.id} className="glass-card glass-card-hover p-6 relative group">
                        <button 
                          onClick={() => removeItem('education', edu.id)}
                          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input label="School" value={edu.school} onChange={(v: string) => updateItem('education', edu.id, 'school', v)} placeholder="University Name" />
                          <Input label="Degree" value={edu.degree} onChange={(v: string) => updateItem('education', edu.id, 'degree', v)} placeholder="B.S. Computer Science" />
                          <Input label="Start Date" value={edu.startDate} onChange={(v: string) => updateItem('education', edu.id, 'startDate', v)} placeholder="2016" />
                          <Input label="End Date" value={edu.endDate} onChange={(v: string) => updateItem('education', edu.id, 'endDate', v)} placeholder="2020" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Skills */}
                <section>
                  <SectionHeader icon={Code} title="Skills" />
                  <div className="flex flex-wrap gap-2 mb-4">
                    {data.skills.map((skill, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-bold">
                        {skill}
                        <button onClick={() => setData(prev => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== i) }))}>
                          <X className="w-3 h-3 hover:text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add a skill (e.g. React, Python)"
                      className="flex-grow bg-brand-secondary border border-brand-border rounded-xl px-4 py-2 text-sm outline-none input-glow"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val && !data.skills.includes(val)) {
                            setData(prev => ({ ...prev, skills: [...prev.skills, val] }));
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <button 
                      onClick={() => handleAIAction('skills', data)}
                      disabled={isGenerating}
                      className="px-4 py-2 rounded-xl glass text-brand-cyan font-bold text-sm hover:bg-white/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all flex items-center gap-2"
                    >
                      <Cpu className="w-4 h-4" /> Suggest
                    </button>
                  </div>
                </section>

                {/* Projects */}
                <section>
                  <SectionHeader icon={Folder} title="Projects" onAdd={() => addItem('projects')} addLabel="Add Project" />
                  <div className="space-y-8">
                    {data.projects.map((proj) => (
                      <div key={proj.id} className="glass-card glass-card-hover p-6 relative group">
                        <button 
                          onClick={() => removeItem('projects', proj.id)}
                          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <Input label="Project Name" value={proj.name} onChange={(v: string) => updateItem('projects', proj.id, 'name', v)} placeholder="E-commerce Platform" />
                          <Input label="Project Link" value={proj.link} onChange={(v: string) => updateItem('projects', proj.id, 'link', v)} placeholder="github.com/..." />
                        </div>
                        <Input label="Description" value={proj.description} onChange={(v: string) => updateItem('projects', proj.id, 'description', v)} placeholder="Describe your project..." multiline />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Certifications */}
                <section>
                  <SectionHeader icon={Award} title="Certifications" onAdd={() => addItem('certifications')} addLabel="Add Certification" />
                  <div className="space-y-8">
                    {data.certifications.map((cert) => (
                      <div key={cert.id} className="glass-card glass-card-hover p-6 relative group">
                        <button 
                          onClick={() => removeItem('certifications', cert.id)}
                          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input label="Certification Name" value={cert.name} onChange={(v: string) => updateItem('certifications', cert.id, 'name', v)} placeholder="AWS Solutions Architect" />
                          <Input label="Issuer" value={cert.issuer} onChange={(v: string) => updateItem('certifications', cert.id, 'issuer', v)} placeholder="Amazon Web Services" />
                          <Input label="Date" value={cert.date} onChange={(v: string) => updateItem('certifications', cert.id, 'date', v)} placeholder="2023" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            ) : (
              <motion.div 
                key="design"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-12 max-w-2xl mx-auto"
              >
                <section>
                  <SectionHeader icon={LayoutIcon} title="Choose Template" />
                  <div className="grid grid-cols-2 gap-6">
                    {(['minimal', 'modern', 'creative'] as TemplateType[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTemplate(t)}
                        className={cn(
                          "glass-card glass-card-hover p-6 text-left transition-all border-2",
                          template === t ? "border-brand-cyan shadow-[0_0_20px_rgba(34,211,238,0.2)] scale-[1.02]" : "border-transparent hover:border-brand-border"
                        )}
                      >
                        <div className="w-full aspect-[3/4] bg-brand-dark rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                          <div className={cn(
                            "w-1/2 h-1/2 rounded shadow-lg",
                            t === 'minimal' ? "bg-white" : t === 'modern' ? "bg-blue-50" : "bg-purple-50"
                          )} />
                        </div>
                        <h4 className="font-bold capitalize">{t}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {t === 'minimal' ? 'Clean and professional' : t === 'modern' ? 'Bold and contemporary' : 'Unique and artistic'}
                        </p>
                      </button>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel: Preview */}
        <div className={cn(
          "w-full lg:w-1/2 bg-brand-secondary overflow-y-auto p-6 md:p-12 custom-scrollbar",
          showMobilePreview ? "block" : "hidden lg:block"
        )}>
          <div className="max-w-[800px] mx-auto">
            <div 
              ref={previewRef}
              className={cn(
                "bg-white text-black min-h-[1122px] p-12 origin-top transition-all duration-500",
                template === 'minimal' ? "font-serif" : "font-sans"
              )}
              style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
              {/* Header */}
              <header className={cn(
                "mb-8",
                template === 'modern' ? "border-l-8 border-brand-blue pl-6" : 
                template === 'creative' ? "border-b-4 border-brand-purple pb-6 text-center" : ""
              )}>
                <h1 className={cn(
                  "text-4xl font-black tracking-tight uppercase mb-2",
                  template === 'creative' ? "text-brand-purple" : ""
                )}>{data.personalInfo.fullName || 'Your Name'}</h1>
                <div className={cn(
                  "flex flex-wrap gap-4 text-sm text-gray-600 font-medium",
                  template === 'creative' ? "justify-center" : ""
                )}>
                  {data.personalInfo.email && <span className="whitespace-nowrap"><Mail className="w-3.5 h-3.5 inline-block align-text-bottom mr-1.5" /> <span className="inline-block align-middle">{data.personalInfo.email}</span></span>}
                  {data.personalInfo.phone && <span className="whitespace-nowrap"><Phone className="w-3.5 h-3.5 inline-block align-text-bottom mr-1.5" /> <span className="inline-block align-middle">{data.personalInfo.phone}</span></span>}
                  {data.personalInfo.location && <span className="whitespace-nowrap"><MapPin className="w-3.5 h-3.5 inline-block align-text-bottom mr-1.5" /> <span className="inline-block align-middle">{data.personalInfo.location}</span></span>}
                </div>
                <div className={cn(
                  "flex flex-wrap gap-4 text-sm text-brand-blue font-bold mt-2",
                  template === 'creative' ? "justify-center" : ""
                )}>
                  {data.personalInfo.linkedin && <span className="whitespace-nowrap"><Linkedin className="w-3.5 h-3.5 inline-block align-text-bottom mr-1.5" /> <span className="inline-block align-middle">{data.personalInfo.linkedin}</span></span>}
                  {data.personalInfo.portfolio && <span className="whitespace-nowrap"><Folder className="w-3.5 h-3.5 inline-block align-text-bottom mr-1.5" /> <span className="inline-block align-middle">{data.personalInfo.portfolio}</span></span>}
                </div>
              </header>

              {/* Summary */}
              {data.personalInfo.summary && (
                <section className="mb-8">
                  <h2 className={cn(
                    "text-xs font-black uppercase tracking-[0.2em] mb-3 border-b border-gray-200 pb-1",
                    template === 'creative' ? "text-brand-purple border-[#e8e1fd]" : "text-gray-400"
                  )}>Professional Summary</h2>
                  <p className="text-sm leading-relaxed text-gray-800">{data.personalInfo.summary}</p>
                </section>
              )}

              {/* Experience */}
              {data.experience.length > 0 && (
                <section className="mb-8">
                  <h2 className={cn(
                    "text-xs font-black uppercase tracking-[0.2em] mb-4 border-b border-gray-200 pb-1",
                    template === 'creative' ? "text-brand-purple border-[#e8e1fd]" : "text-gray-400"
                  )}>Experience</h2>
                  <div className="space-y-6">
                    {data.experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-base">{exp.position}</h3>
                          <span className="text-xs font-bold text-gray-500">{exp.startDate} — {exp.endDate}</span>
                        </div>
                        <div className={cn(
                          "text-sm font-bold mb-2",
                          template === 'creative' ? "text-brand-purple" : "text-brand-blue"
                        )}>{exp.company}</div>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {data.education.length > 0 && (
                <section className="mb-8">
                  <h2 className={cn(
                    "text-xs font-black uppercase tracking-[0.2em] mb-4 border-b border-gray-200 pb-1",
                    template === 'creative' ? "text-brand-purple border-[#e8e1fd]" : "text-gray-400"
                  )}>Education</h2>
                  <div className="space-y-4">
                    {data.education.map((edu) => (
                      <div key={edu.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-sm">{edu.degree}</h3>
                          <span className="text-xs font-bold text-gray-500">{edu.startDate} — {edu.endDate}</span>
                        </div>
                        <div className="text-sm text-gray-700">{edu.school}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Skills */}
              {data.skills.length > 0 && (
                <section className="mb-8">
                  <h2 className={cn(
                    "text-xs font-black uppercase tracking-[0.2em] mb-3 border-b border-gray-200 pb-1",
                    template === 'creative' ? "text-brand-purple border-[#e8e1fd]" : "text-gray-400"
                  )}>Skills</h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {data.skills.map((skill, i) => (
                      <span key={i} className="text-sm font-medium text-gray-800">• {skill}</span>
                    ))}
                  </div>
                </section>
              )}

              {/* Projects */}
              {data.projects.length > 0 && (
                <section className="mb-8">
                  <h2 className={cn(
                    "text-xs font-black uppercase tracking-[0.2em] mb-4 border-b border-gray-200 pb-1",
                    template === 'creative' ? "text-brand-purple border-[#e8e1fd]" : "text-gray-400"
                  )}>Projects</h2>
                  <div className="space-y-6">
                    {data.projects.map((proj) => (
                      <div key={proj.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-sm">{proj.name}</h3>
                          {proj.link && <span className="text-xs font-bold text-brand-blue">{proj.link}</span>}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Certifications */}
              {data.certifications.length > 0 && (
                <section className="mb-8">
                  <h2 className={cn(
                    "text-xs font-black uppercase tracking-[0.2em] mb-4 border-b border-gray-200 pb-1",
                    template === 'creative' ? "text-brand-purple border-[#e8e1fd]" : "text-gray-400"
                  )}>Certifications</h2>
                  <div className="space-y-3">
                    {data.certifications.map((cert) => (
                      <div key={cert.id} className="flex justify-between items-baseline">
                        <div className="text-sm">
                          <span className="font-bold">{cert.name}</span>
                          <span className="text-gray-500"> — {cert.issuer}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-500">{cert.date}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Aryme Modal */}
      <AnimatePresence>
        {showArymeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-dark border border-brand-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(57,255,20,0.15)]"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <Cpu className="text-brand-green w-6 h-6" />
                    Smart Generator
                  </h3>
                  <button onClick={() => setShowArymeModal(false)} className="text-gray-500 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Describe your background, experience, and target role</label>
                    <textarea 
                      value={arymePrompt}
                      onChange={(e) => setArymePrompt(e.target.value)}
                      placeholder="e.g., I am a Senior Frontend Developer with 5 years of experience in React, TypeScript, and Tailwind. I previously worked at Google and Amazon. I'm looking for a Lead Developer role..."
                      className="w-full h-40 bg-brand-secondary border border-brand-border rounded-xl p-4 text-sm outline-none input-glow resize-none"
                    />
                  </div>
                  
                  <button 
                    onClick={handleArymeGenerate}
                    disabled={isArymeGenerating || !arymePrompt.trim()}
                    className="w-full py-4 rounded-xl bg-gradient-premium neon-glow-hover text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isArymeGenerating ? 'Generating Resume...' : 'Generate Resume'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Modal */}
      <AnimatePresence>
        {showAIModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAIModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass-card p-8 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-premium" />
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <Cpu className="text-brand-cyan w-6 h-6" />
                  {aiType === 'score' ? 'Resume Analysis' : 
                   aiType === 'cover-letter' ? 'Generate Cover Letter' : 
                   'Enhancement'}
                </h3>
                <button onClick={() => setShowAIModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {aiType === 'cover-letter' && !aiResult && (
                  <Input 
                    label="Target Job Role" 
                    value={targetRole} 
                    onChange={setTargetRole} 
                    placeholder="e.g. Senior Frontend Engineer at Google" 
                  />
                )}

                {!aiResult ? (
                  <button
                    onClick={async () => {
                      const res = await handleAIAction(aiType, data, targetRole);
                      setAiResult(res || true); // handleAIAction returns result for some types
                    }}
                    disabled={isGenerating}
                    className="w-full py-4 rounded-xl bg-gradient-premium neon-glow-hover text-white font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {isGenerating ? 'Analyzing...' : 'Generate'}
                  </button>
                ) : (
                  <div className="space-y-6">
                    {aiType === 'score' ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-6xl font-black text-gradient mb-2">85/100</div>
                          <p className="text-gray-400">Your resume is looking strong!</p>
                        </div>
                        <div className="space-y-3">
                          <p className="font-bold text-sm uppercase tracking-widest text-gray-500">Actionable Tips:</p>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2 text-sm text-gray-300">
                              <ChevronRight className="w-4 h-4 text-brand-purple mt-0.5" />
                              Add more quantifiable achievements in your experience section.
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-300">
                              <ChevronRight className="w-4 h-4 text-brand-purple mt-0.5" />
                              Include specific technologies mentioned in the job description.
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-300">
                              <ChevronRight className="w-4 h-4 text-brand-purple mt-0.5" />
                              Strengthen your professional summary with a clear value proposition.
                            </li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="glass p-6 rounded-xl max-h-[400px] overflow-y-auto custom-scrollbar">
                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                          {typeof aiResult === 'string' ? aiResult : 'Generation complete. Check your resume sections.'}
                        </p>
                      </div>
                    )}
                    <button 
                      onClick={() => setShowAIModal(false)}
                      className="w-full py-3 rounded-xl glass text-white font-bold hover:bg-white/10 hover:text-brand-cyan transition-all"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
