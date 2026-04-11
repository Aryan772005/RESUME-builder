import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Wand2, Download, Layout as LayoutIcon, 
  ChevronLeft, ChevronRight, ChevronDown, Save, Cpu, 
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

const SectionAccordion = ({ id, active, onToggle, icon: Icon, title, children, onAdd, addLabel }: any) => {
  const isOpen = active === id;
  return (
    <div className="border border-brand-border bg-brand-secondary/30 rounded-2xl overflow-hidden glass-card transition-all duration-500 mb-6">
      <button 
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", isOpen ? "bg-brand-cyan/20 text-brand-cyan" : "bg-white/5 text-gray-400")}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className={cn("text-lg font-bold transition-colors", isOpen ? "text-white" : "text-gray-400")}>{title}</h3>
        </div>
        <ChevronDown className={cn("w-5 h-5 text-gray-500 transition-transform duration-500", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-5 pt-0 border-t border-brand-border/50">
              {onAdd && (
                 <div className="flex justify-end mb-4 pt-4">
                   <button onClick={onAdd} className="flex items-center gap-2 text-sm font-bold text-brand-cyan hover:text-brand-cyan/80 transition-colors">
                     <Plus className="w-4 h-4" /> {addLabel || 'Add'}
                   </button>
                 </div>
              )}
              <div className={cn(!onAdd && 'pt-4')}>
                 {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
};

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

// --- Templates ---

const DEMO_DATA = {
  personalInfo: {
    fullName: 'Richard Sanchez',
    email: 'richard@example.com',
    phone: '+1 (555) 012-3456',
    location: '123 Anywhere St., Any City',
    linkedin: 'linkedin.com/in/richard',
    portfolio: 'richardportfolio.com',
    summary: 'Results-driven marketing professional with 8+ years of experience developing and implementing marketing strategies. Proven track record of increasing brand awareness by 40% and driving revenue growth through data-driven campaigns.',
  },
  experience: [
    { id: 'x1', company: 'Envato Studio', position: 'Marketing Manager & Specialist', startDate: '2020', endDate: 'Present', description: 'Led cross-functional team of 12 to execute integrated marketing campaigns. Increased organic traffic by 65% and boosted lead generation by 35% year over year.', bullets: [] },
    { id: 'x2', company: 'Vauget Studio', position: 'Marketing Manager & Specialist', startDate: '2018', endDate: '2020', description: 'Managed and directed all marketing strategies. Developed key partnerships across 5 markets and coordinated campaigns that achieved 120% of revenue targets.', bullets: [] },
    { id: 'x3', company: 'Studio Shodwe', position: 'Marketing Manager & Specialist', startDate: '2016', endDate: '2018', description: 'Spearheaded brand repositioning project that resulted in 28% increase in customer retention and 50% growth in social media engagement.', bullets: [] },
  ],
  education: [
    { id: 'e1', school: 'Wardiere University', degree: 'Bachelor of Business Administration', startDate: '2009', endDate: '2013', description: '' },
    { id: 'e2', school: 'Wardiere University', degree: 'Bachelor of Science — Management', startDate: '2013', endDate: '2015', description: '' },
  ],
  skills: ['Project Management', 'Public Relations', 'Teamwork', 'Leadership', 'Communication', 'Critical Thinking'],
  projects: [
    { id: 'p1', name: 'Brand Refresh Campaign', description: 'Redesigned brand identity across 8 product lines, resulting in 30% improved customer perception scores and expanded market share.', link: '', technologies: [] },
    { id: 'p2', name: 'Customer Loyalty Program', description: 'Built end-to-end loyalty platform serving 50,000+ users, boosting repeat purchases by 22% within the first 6 months of launch.', link: '', technologies: [] },
  ],
  certifications: [
    { id: 'c1', name: 'Google Analytics Certified', issuer: 'Google', date: '2022' },
    { id: 'c2', name: 'HubSpot Content Marketing', issuer: 'HubSpot Academy', date: '2023' },
  ],
};

// Merge user data with demo fallback values so preview is never blank
const mergeWithDemo = (data: any) => ({
  personalInfo: {
    fullName: data.personalInfo.fullName || DEMO_DATA.personalInfo.fullName,
    email: data.personalInfo.email || DEMO_DATA.personalInfo.email,
    phone: data.personalInfo.phone || DEMO_DATA.personalInfo.phone,
    location: data.personalInfo.location || DEMO_DATA.personalInfo.location,
    linkedin: data.personalInfo.linkedin || DEMO_DATA.personalInfo.linkedin,
    portfolio: data.personalInfo.portfolio || DEMO_DATA.personalInfo.portfolio,
    summary: data.personalInfo.summary || DEMO_DATA.personalInfo.summary,
  },
  experience: data.experience.length > 0 ? data.experience : DEMO_DATA.experience,
  education: data.education.length > 0 ? data.education : DEMO_DATA.education,
  skills: data.skills.length > 0 ? data.skills : DEMO_DATA.skills,
  projects: data.projects.length > 0 ? data.projects : DEMO_DATA.projects,
  certifications: data.certifications.length > 0 ? data.certifications : DEMO_DATA.certifications,
});

const MinimalTemplate = ({ data }: { data: any }) => (
  <div style={{ padding: '48px', fontFamily: 'Georgia, serif', minHeight: '1122px', backgroundColor: '#ffffff', color: '#111' }}>
    <header style={{ marginBottom: '32px', borderBottom: '2px solid #111', paddingBottom: '24px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.5px', marginBottom: '8px' }}>{data.personalInfo.fullName || 'Your Name'}</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', fontSize: '13px', color: '#555' }}>
        {data.personalInfo.email && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail style={{ width: 14, height: 14 }} /> {data.personalInfo.email}</span>}
        {data.personalInfo.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone style={{ width: 14, height: 14 }} /> {data.personalInfo.phone}</span>}
        {data.personalInfo.location && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin style={{ width: 14, height: 14 }} /> {data.personalInfo.location}</span>}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', fontSize: '13px', color: '#333', fontWeight: 700, marginTop: '8px' }}>
        {data.personalInfo.linkedin && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Linkedin style={{ width: 14, height: 14 }} /> {data.personalInfo.linkedin}</span>}
        {data.personalInfo.portfolio && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Folder style={{ width: 14, height: 14 }} /> {data.personalInfo.portfolio}</span>}
      </div>
    </header>

    {data.personalInfo.summary && (
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>Professional Summary</h2>
        <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#333' }}>{data.personalInfo.summary}</p>
      </section>
    )}

    {data.experience.length > 0 && (
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>Experience</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {data.experience.map((exp: any) => (
            <div key={exp.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '15px' }}>{exp.position}</h3>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#666' }}>{exp.startDate} — {exp.endDate}</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#444', marginBottom: '8px' }}>{exp.company}</div>
              <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{exp.description}</p>
            </div>
          ))}
        </div>
      </section>
    )}

    {data.education.length > 0 && (
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>Education</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {data.education.map((edu: any) => (
            <div key={edu.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '14px' }}>{edu.degree}</h3>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#666' }}>{edu.startDate} — {edu.endDate}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#444' }}>{edu.school}</div>
            </div>
          ))}
        </div>
      </section>
    )}

    {data.skills.length > 0 && (
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>Skills</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {data.skills.map((skill: string, i: number) => (
            <span key={i} style={{ fontSize: '12px', fontWeight: 600, color: '#333', backgroundColor: '#f3f4f6', padding: '4px 12px', borderRadius: '4px' }}>{skill}</span>
          ))}
        </div>
      </section>
    )}

    {data.projects.length > 0 && (
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>Projects</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {data.projects.map((proj: any) => (
            <div key={proj.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '14px' }}>{proj.name}</h3>
                {proj.link && <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>{proj.link}</span>}
              </div>
              <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.6 }}>{proj.description}</p>
            </div>
          ))}
        </div>
      </section>
    )}

    {data.certifications.length > 0 && (
      <section>
        <h2 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>Certifications</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.certifications.map((cert: any) => (
            <div key={cert.id} style={{ fontSize: '13px' }}>
              <div style={{ fontWeight: 700 }}>{cert.name}</div>
              <div style={{ color: '#666' }}>{cert.issuer} <span style={{ color: '#999' }}>— {cert.date}</span></div>
            </div>
          ))}
        </div>
      </section>
    )}
  </div>
);

const ModernTemplate = ({ data }: { data: any }) => (
  <div style={{ display: 'flex', minHeight: '1122px', width: '100%', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
    {/* LEFT SIDEBAR - NAVY BLUE */}
    <div style={{ width: '35%', backgroundColor: '#0a2540', color: '#ffffff', display: 'flex', flexDirection: 'column', paddingTop: '48px', paddingBottom: '48px' }}>
      {/* Profile Photo */}
      <div style={{ width: '120px', height: '120px', backgroundColor: '#0d3461', borderRadius: '50%', margin: '0 auto 40px', border: '4px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <User style={{ width: 56, height: 56, color: 'rgba(255,255,255,0.2)' }} />
      </div>

      <div style={{ padding: '0 32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Contact */}
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>Contact</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '11px', color: '#a3c4e0' }}>
            {data.personalInfo.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone style={{ width: 14, height: 14, color: '#fff' }} /> <span>{data.personalInfo.phone}</span></div>}
            {data.personalInfo.email && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail style={{ width: 14, height: 14, color: '#fff' }} /> <span style={{ wordBreak: 'break-all' }}>{data.personalInfo.email}</span></div>}
            {data.personalInfo.location && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin style={{ width: 14, height: 14, color: '#fff' }} /> <span>{data.personalInfo.location}</span></div>}
            {data.personalInfo.linkedin && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Linkedin style={{ width: 14, height: 14, color: '#fff' }} /> <span style={{ wordBreak: 'break-all' }}>{data.personalInfo.linkedin}</span></div>}
            {data.personalInfo.portfolio && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Folder style={{ width: 14, height: 14, color: '#fff' }} /> <span style={{ wordBreak: 'break-all' }}>{data.personalInfo.portfolio}</span></div>}
          </div>
        </div>

        {/* Education */}
        {data.education.length > 0 && (
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>Education</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {data.education.map((edu: any) => (
                <div key={edu.id}>
                  <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1px', color: '#7eb8e0', marginBottom: '4px' }}>{edu.startDate} - {edu.endDate}</div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#fff', lineHeight: 1.3, marginBottom: '4px' }}>{edu.degree}</div>
                  <div style={{ fontSize: '11px', color: '#a3c4e0' }}>{edu.school}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>Skills</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.skills.map((s: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', fontWeight: 700, color: '#fff' }}>
                  <span style={{ width: '6px', height: '6px', backgroundColor: '#7eb8e0', borderRadius: '50%', flexShrink: 0 }}></span> {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>Certifications</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.certifications.map((cert: any) => (
                <div key={cert.id} style={{ fontSize: '11px' }}>
                  <div style={{ fontWeight: 700, color: '#fff', marginBottom: '2px' }}>{cert.name}</div>
                  <div style={{ fontSize: '10px', color: '#7eb8e0' }}>{cert.issuer}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* RIGHT COLUMN - WHITE */}
    <div style={{ width: '65%', backgroundColor: '#ffffff', padding: '48px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 900, letterSpacing: '-1px', color: '#111', lineHeight: 0.95, textTransform: 'uppercase', marginBottom: '8px' }}>{data.personalInfo.fullName || 'Your Name'}</h1>
        <div style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '4px', color: '#999', textTransform: 'uppercase' }}>Professional Portfolio</div>
      </div>

      <div style={{ width: '100%', height: '3px', backgroundColor: '#e5e7eb', marginBottom: '32px' }}></div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {data.personalInfo.summary && (
          <section>
            <h2 style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', color: '#111', marginBottom: '12px' }}>Profile</h2>
            <p style={{ fontSize: '13px', lineHeight: 1.8, color: '#666', textAlign: 'justify' }}>{data.personalInfo.summary}</p>
          </section>
        )}

        {data.experience.length > 0 && (
          <section>
            <h2 style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', color: '#111', marginBottom: '20px' }}>Work Experience</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {data.experience.map((exp: any) => (
                <div key={exp.id} style={{ paddingLeft: '24px', borderLeft: '2px solid #e5e7eb', position: 'relative' }}>
                  <div style={{ position: 'absolute', width: '8px', height: '8px', backgroundColor: '#0a2540', borderRadius: '50%', left: '-5px', top: '6px' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '15px', color: '#111' }}>{exp.company}</h3>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#999', whiteSpace: 'nowrap' }}>{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#0a2540', marginBottom: '10px' }}>{exp.position}</div>
                  <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.6, whiteSpace: 'pre-line', textAlign: 'justify' }}>{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects.length > 0 && (
          <section>
            <h2 style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', color: '#111', marginBottom: '20px' }}>Projects</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {data.projects.map((proj: any) => (
                <div key={proj.id} style={{ paddingLeft: '24px', borderLeft: '2px solid #e5e7eb', position: 'relative' }}>
                  <div style={{ position: 'absolute', width: '8px', height: '8px', backgroundColor: '#999', borderRadius: '50%', left: '-5px', top: '6px' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                    <h3 style={{ fontWeight: 700, color: '#111' }}>{proj.name}</h3>
                    {proj.link && <span style={{ fontSize: '10px', fontWeight: 700, color: '#2563eb' }}>{proj.link}</span>}
                  </div>
                  <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.6, textAlign: 'justify' }}>{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  </div>
);

const CreativeTemplate = ({ data }: { data: any }) => (
  <div style={{ display: 'flex', minHeight: '1122px', width: '100%', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
    {/* LEFT - DARK CHARCOAL */}
    <div style={{ width: '38%', backgroundColor: '#1a1a1a', color: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      {/* Profile Photo Area */}
      <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#252525', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '6px solid #111', position: 'relative' }}>
        <User style={{ width: 96, height: 96, color: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px', background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', textAlign: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#888' }}>Profile Photo</span>
        </div>
      </div>

      <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '36px' }}>
        {/* About Me */}
        {data.personalInfo.summary && (
          <section>
            <h2 style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', color: '#fff', marginBottom: '16px', paddingLeft: '14px', borderLeft: '4px solid #facc15' }}>About Me</h2>
            <p style={{ fontSize: '11px', color: '#999', lineHeight: 1.7, textAlign: 'justify' }}>{data.personalInfo.summary}</p>
          </section>
        )}

        {/* Skills with Bars */}
        {data.skills.length > 0 && (
          <section>
            <h2 style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', color: '#fff', marginBottom: '20px', paddingLeft: '14px', borderLeft: '4px solid #facc15' }}>Skills</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {data.skills.map((s: string, i: number) => {
                const w = Math.min(100, Math.max(60, 50 + (s.length * 5)));
                return (
                  <div key={i}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '2px', color: '#ccc', marginBottom: '6px' }}>{s}</div>
                    <div style={{ width: '100%', height: '5px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${w}%`, backgroundColor: '#facc15', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <section>
            <h2 style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', color: '#fff', marginBottom: '16px', paddingLeft: '14px', borderLeft: '4px solid #facc15' }}>Certifications</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.certifications.map((cert: any) => (
                <div key={cert.id}>
                  <div style={{ fontWeight: 700, fontSize: '11px', color: '#fff', marginBottom: '2px' }}>{cert.name}</div>
                  <div style={{ fontSize: '10px', color: '#777' }}>{cert.issuer} — {cert.date}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>

    {/* RIGHT - OFF WHITE */}
    <div style={{ width: '62%', backgroundColor: '#fafafa', padding: '48px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ position: 'relative', display: 'inline-block', width: '100%', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '46px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-1px', color: '#111', lineHeight: 0.95, position: 'relative', zIndex: 1 }}>{data.personalInfo.fullName || 'Your Name'}</h1>
          <span style={{ position: 'absolute', left: 0, bottom: '2px', width: '75%', height: '14px', backgroundColor: '#facc15', opacity: 0.7, zIndex: 0 }}></span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '2px dotted #ccc', paddingLeft: '20px', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '2px' }}>
          {data.personalInfo.location && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin style={{ width: 13, height: 13, color: '#facc15' }} /> {data.personalInfo.location}</div>}
          {data.personalInfo.email && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail style={{ width: 13, height: 13, color: '#facc15' }} /> {data.personalInfo.email}</div>}
          {data.personalInfo.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone style={{ width: 13, height: 13, color: '#facc15' }} /> {data.personalInfo.phone}</div>}
          {data.personalInfo.linkedin && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Linkedin style={{ width: 13, height: 13, color: '#facc15' }} /> {data.personalInfo.linkedin}</div>}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
        {data.experience.length > 0 && (
          <section>
            <h2 style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase', color: '#333', marginBottom: '24px', paddingBottom: '10px', borderBottom: '2px solid #e5e7eb' }}>Experience</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {data.experience.map((exp: any) => (
                <div key={exp.id}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>
                    <span style={{ color: '#d97706' }}>{exp.position}</span>{' • '}{exp.company}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#bbb', letterSpacing: '2px', marginBottom: '10px', fontStyle: 'italic' }}>{exp.startDate} - {exp.endDate}</div>
                  <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.6, whiteSpace: 'pre-line', textAlign: 'justify' }}>{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.education.length > 0 && (
          <section>
            <h2 style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase', color: '#333', marginBottom: '24px', paddingBottom: '10px', borderBottom: '2px solid #e5e7eb' }}>Education</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {data.education.map((edu: any) => (
                <div key={edu.id}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#333', marginBottom: '4px' }}>{edu.degree}</div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#bbb', letterSpacing: '2px', marginBottom: '6px', fontStyle: 'italic' }}>{edu.startDate} - {edu.endDate}</div>
                  <div style={{ fontSize: '12px', color: '#888', fontWeight: 700 }}>{edu.school}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects.length > 0 && (
          <section>
            <h2 style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase', color: '#333', marginBottom: '24px', paddingBottom: '10px', borderBottom: '2px solid #e5e7eb' }}>Projects</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {data.projects.map((proj: any) => (
                <div key={proj.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                    <h3 style={{ fontWeight: 700, color: '#333' }}>{proj.name}</h3>
                    {proj.link && <span style={{ fontSize: '10px', fontWeight: 700, color: '#d97706' }}>{proj.link}</span>}
                  </div>
                  <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.6, textAlign: 'justify' }}>{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
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
  const [useSampleData, setUseSampleData] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [targetRole, setTargetRole] = useState('');
  
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [activeSection, setActiveSection] = useState<string>('personalInfo');
  const toggleSection = (id: string) => setActiveSection(prev => prev === id ? '' : id);
  const [liveScore, setLiveScore] = useState(0);

  useEffect(() => {
    let score = 0;
    if (data.personalInfo.fullName) score += 10;
    if (data.personalInfo.email) score += 5;
    if (data.personalInfo.summary.length > 30) score += 15;
    if (data.experience.length > 0) score += 20 * Math.min(data.experience.length, 2);
    if (data.education.length > 0) score += 15;
    if (data.skills.length > 3) score += 10;
    if (data.projects.length > 0) score += 5;
    setLiveScore(Math.min(100, score));
  }, [data]);

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
        handlePersonalInfoChange('summary', '');
        let current = '';
        const delay = 15; // ms per character
        
        for (let i = 0; i < resultText.length; i++) {
          current += resultText[i];
          // We bypass React state batching by using the updater properly, or just set it:
          setData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, summary: current }
          }));
          await new Promise(res => setTimeout(res, delay));
        }
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
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-premium neon-glow-hover text-white font-bold text-sm transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:scale-105"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <div className="relative w-10 h-10 flex items-center justify-center group ml-2">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
              <path 
                className="text-brand-cyan transition-all duration-1000 ease-out drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" 
                strokeDasharray={`${liveScore}, 100`} 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" stroke="currentColor" strokeWidth="3" 
              />
            </svg>
            <span className="absolute text-[10px] font-black">{liveScore}</span>
            <div className="absolute top-12 right-0 whitespace-nowrap bg-black/80 backdrop-blur text-white text-xs py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Resume Impact Score</div>
          </div>
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
                <SectionAccordion id="personalInfo" active={activeSection} onToggle={toggleSection} icon={User} title="Personal Information">
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
                      {isGenerating ? <><Cpu className="w-3 h-3 animate-pulse" /> Generating...</> : <><Cpu className="w-3 h-3" /> Generate</>}
                    </button>
                  </div>
                </SectionAccordion>

                {/* Experience */}
                <SectionAccordion id="experience" active={activeSection} onToggle={toggleSection} icon={Briefcase} title="Work Experience" onAdd={() => addItem('experience')} addLabel="Add Experience">
                  <div className="space-y-8">
                    <AnimatePresence>
                      {data.experience.map((exp) => (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} key={exp.id} className="glass-card glass-card-hover p-6 relative group">
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
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </SectionAccordion>

                {/* Education */}
                <SectionAccordion id="education" active={activeSection} onToggle={toggleSection} icon={GraduationCap} title="Education" onAdd={() => addItem('education')} addLabel="Add Education">
                  <div className="space-y-8">
                    <AnimatePresence>
                      {data.education.map((edu) => (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} key={edu.id} className="glass-card glass-card-hover p-6 relative group">
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
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </SectionAccordion>

                {/* Skills */}
                <SectionAccordion id="skills" active={activeSection} onToggle={toggleSection} icon={Code} title="Skills">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <AnimatePresence>
                      {data.skills.map((skill, i) => (
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-bold">
                          {skill}
                          <button onClick={() => setData(prev => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== i) }))}>
                            <X className="w-3 h-3 hover:text-red-500 transition-colors" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
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
                      {isGenerating ? <Cpu className="w-4 h-4 animate-pulse" /> : <Cpu className="w-4 h-4" />} Suggest
                    </button>
                  </div>
                </SectionAccordion>

                {/* Projects */}
                <SectionAccordion id="projects" active={activeSection} onToggle={toggleSection} icon={Folder} title="Projects" onAdd={() => addItem('projects')} addLabel="Add Project">
                  <div className="space-y-8">
                    <AnimatePresence>
                      {data.projects.map((proj) => (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} key={proj.id} className="glass-card glass-card-hover p-6 relative group">
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
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </SectionAccordion>

                {/* Certifications */}
                <SectionAccordion id="certifications" active={activeSection} onToggle={toggleSection} icon={Award} title="Certifications" onAdd={() => addItem('certifications')} addLabel="Add Certification">
                  <div className="space-y-8">
                    <AnimatePresence>
                      {data.certifications.map((cert) => (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} key={cert.id} className="glass-card glass-card-hover p-6 relative group">
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
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </SectionAccordion>
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

                  {/* Sample Data Toggle */}
                  <div className="flex items-center justify-between glass-card p-4 rounded-xl mb-6">
                    <div>
                      <h4 className="font-bold text-white text-sm">Use Sample Data</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">Shows demo content in preview so you can see the template design</p>
                    </div>
                    <button
                      onClick={() => setUseSampleData(!useSampleData)}
                      className={cn(
                        "w-12 h-6 rounded-full relative transition-all duration-300",
                        useSampleData ? "bg-brand-cyan" : "bg-gray-600"
                      )}
                    >
                      <span className={cn(
                        "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md",
                        useSampleData ? "left-6" : "left-0.5"
                      )} />
                    </button>
                  </div>

                  {/* Template Cards - Real Live Mini Previews */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                    {/* Minimal Template Card */}
                    <button onClick={() => setTemplate('minimal')} className={cn("glass-card p-3 text-left transition-all border-2 rounded-xl overflow-hidden group", template === 'minimal' ? "border-brand-cyan shadow-[0_0_20px_rgba(34,211,238,0.2)]" : "border-transparent hover:border-brand-border")}>
                      <div className="w-full aspect-[3/4] rounded-lg mb-3 overflow-hidden relative shadow-md">
                        <div className="absolute inset-0 transform scale-[0.22] origin-top-left" style={{ width: '454%', height: '454%' }}>
                          <MinimalTemplate data={DEMO_DATA} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full border-2", template === 'minimal' ? "border-brand-cyan bg-brand-cyan" : "border-gray-500")} />
                        <h4 className="font-bold text-white text-sm">Minimal</h4>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 ml-5">Clean serif, centered header</p>
                    </button>

                    {/* Modern Template Card */}
                    <button onClick={() => setTemplate('modern')} className={cn("glass-card p-3 text-left transition-all border-2 rounded-xl overflow-hidden group", template === 'modern' ? "border-brand-cyan shadow-[0_0_20px_rgba(34,211,238,0.2)]" : "border-transparent hover:border-brand-border")}>
                      <div className="w-full aspect-[3/4] rounded-lg mb-3 overflow-hidden relative shadow-md">
                        <div className="absolute inset-0 transform scale-[0.22] origin-top-left" style={{ width: '454%', height: '454%' }}>
                          <ModernTemplate data={DEMO_DATA} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full border-2", template === 'modern' ? "border-brand-cyan bg-brand-cyan" : "border-gray-500")} />
                        <h4 className="font-bold text-white text-sm">Modern</h4>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 ml-5">Navy sidebar, photo placeholder</p>
                    </button>

                    {/* Creative Template Card */}
                    <button onClick={() => setTemplate('creative')} className={cn("glass-card p-3 text-left transition-all border-2 rounded-xl overflow-hidden group", template === 'creative' ? "border-brand-cyan shadow-[0_0_20px_rgba(34,211,238,0.2)]" : "border-transparent hover:border-brand-border")}>
                      <div className="w-full aspect-[3/4] rounded-lg mb-3 overflow-hidden relative shadow-md">
                        <div className="absolute inset-0 transform scale-[0.22] origin-top-left" style={{ width: '454%', height: '454%' }}>
                          <CreativeTemplate data={DEMO_DATA} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full border-2", template === 'creative' ? "border-brand-cyan bg-brand-cyan" : "border-gray-500")} />
                        <h4 className="font-bold text-white text-sm">Creative</h4>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 ml-5">Dark sidebar, yellow accents</p>
                    </button>

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
              className="origin-top transition-all duration-500 overflow-hidden bg-white"
              style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
              {template === 'minimal' && <MinimalTemplate data={useSampleData ? mergeWithDemo(data) : data} />}
              {template === 'modern' && <ModernTemplate data={useSampleData ? mergeWithDemo(data) : data} />}
              {template === 'creative' && <CreativeTemplate data={useSampleData ? mergeWithDemo(data) : data} />}
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
                      
                      if (aiType === 'score' && res) {
                        try {
                           const cleanJson = res.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                           const parsed = JSON.parse(cleanJson);
                           setAiResult(parsed);
                        } catch (e) {
                           console.error("Failed to parse score", e);
                           setAiResult({ score: 0, tips: ["Failed to analyze resume properly. Try again."] });
                        }
                      } else {
                        setAiResult(res || true);
                      }
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
                          <div className="text-6xl font-black text-gradient mb-2">{aiResult?.score || 0}/100</div>
                          <p className="text-gray-400">
                            {(aiResult?.score || 0) >= 80 ? "Your resume is looking strong!" : 
                             (aiResult?.score || 0) >= 60 ? "Good start, but needs improvement." : 
                             "Needs significant work before applying."}
                          </p>
                        </div>
                        <div className="space-y-3">
                          <p className="font-bold text-sm uppercase tracking-widest text-gray-500">Actionable Tips:</p>
                          <ul className="space-y-2">
                            {(aiResult?.tips || []).map((tip: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                <ChevronRight className="w-4 h-4 text-brand-purple mt-0.5 shrink-0" />
                                <span>{tip}</span>
                              </li>
                            ))}
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
