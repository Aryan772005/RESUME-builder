import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  FileText, Zap, Shield, ChevronRight, Lock,
  Layout, ChevronDown, Globe, Cpu, Palette,
  Clock, X, Upload, Download
} from 'lucide-react';
import { cn } from '../lib/utils';

/* ─── Typewriter ────────────────────────────────────────────────────────── */
const TypewriterText = ({ texts }: { texts: string[] }) => {
  const [index, setIndex] = React.useState(0);
  const [displayText, setDisplayText] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    const currentText = texts[index];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentText.substring(0, displayText.length + 1));
        if (displayText === currentText) setTimeout(() => setIsDeleting(true), 2000);
      } else {
        setDisplayText(currentText.substring(0, displayText.length - 1));
        if (displayText === '') { setIsDeleting(false); setIndex(p => (p + 1) % texts.length); }
      }
    }, isDeleting ? 50 : 100);
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, index, texts]);

  return <span>{displayText}<span className="animate-pulse text-brand-cyan">|</span></span>;
};

/* ─── FeatureCard ───────────────────────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, description, delay, gradient }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ delay, duration: 0.5 }}
    className="glass-card glass-card-hover p-8 group relative overflow-hidden"
  >
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${gradient}`} />
    <div className="w-12 h-12 rounded-xl bg-brand-purple/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-cyan/10 transition-all duration-300">
      <Icon className="text-brand-purple group-hover:text-brand-cyan w-6 h-6 transition-colors duration-300" />
    </div>
    <h3 className="text-xl font-bold mb-3 group-hover:text-brand-cyan transition-colors duration-300">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </motion.div>
);


/* ─── FAQ ───────────────────────────────────────────────────────────────── */
const FAQItem = ({ question, answer, delay }: any) => {
  const [open, setOpen] = React.useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card overflow-hidden"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-6 text-left group"
      >
        <span className="font-bold text-base group-hover:text-brand-cyan transition-colors pr-4">{question}</span>
        <ChevronDown className={cn('w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300', open ? 'rotate-180 text-brand-cyan' : '')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="faq-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="px-6 pb-6 text-gray-400 text-sm leading-relaxed border-t border-brand-border/50 pt-4">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function Home() {
  const features = [
    { icon: FileText, title: 'Smart Content Generation', description: 'Instantly generate professional summaries and impact-driven bullet points tailored to your exact industry and level.', gradient: 'bg-gradient-to-br from-brand-purple to-brand-blue' },
    { icon: Zap, title: 'ATS Optimization', description: 'Our templates are engineered to pass Applicant Tracking Systems every time — your resume will always be seen by human eyes.', gradient: 'bg-gradient-to-br from-brand-blue to-brand-cyan' },
    { icon: Layout, title: 'Premium Templates', description: 'Choose from modern, minimal, and creative templates designed by expert recruiters from top companies.', gradient: 'bg-gradient-to-br from-brand-cyan to-brand-green' },
    { icon: Cpu, title: 'Resume Score & Analysis', description: 'Get an instant smart score on your resume with 5 actionable suggestions to land more interviews.', gradient: 'bg-gradient-to-br from-brand-green to-brand-cyan' },
    { icon: Palette, title: 'Cover Letter Builder', description: 'Generate a tailored, professional cover letter in seconds — personalized to the job description you paste in.', gradient: 'bg-gradient-to-br from-brand-purple to-brand-cyan' },
    { icon: Clock, title: 'Auto-Save to Cloud', description: 'Your resume is synced in real-time to secure cloud storage. Never lose your work — pick up where you left off on any device.', gradient: 'bg-gradient-to-br from-brand-blue to-brand-purple' },
  ];

  const faqs = [
    { q: 'Is Tariani\'s Resume Builder free to use?', a: 'Yes! You can build and download a resume completely for free. Just sign in with your Google account and start building right away — no credit card needed.', delay: 0.05 },
    { q: 'Are the resumes ATS-compatible?', a: 'Absolutely. Every template is built from the ground up to be fully parsed by modern Applicant Tracking Systems. We avoid complex tables, images in headers, and other elements that trip up ATS software.', delay: 0.1 },
    { q: 'How does the resume generator work?', a: 'Simply describe your professional background in plain English — your experience, skills, education, and target role. Our smart tool will generate a complete, polished resume in seconds, which you can then edit and refine.', delay: 0.15 },
    { q: 'Can I edit my resume after downloading?', a: 'Yes. Your resume data is saved to your account automatically. Return anytime, make changes, and re-download a fresh PDF.', delay: 0.2 },
    { q: 'What file formats can I export to?', a: 'Currently we support high-quality PDF export — the standard format required by employers worldwide.', delay: 0.25 },
    { q: 'Is my data private and secure?', a: 'Your resume data is stored securely in your personal account. It is only accessible to you when signed in. We never share or sell your data.', delay: 0.3 },
  ];

  return (
    <div className="relative bg-brand-dark">

      {/* ── CINEMATIC VIDEO HERO ──────────────────────────────────────── */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Video layer — behind everything */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />

        {/* Multi-layer gradient overlay for readability */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Top fade — blends navbar */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-brand-dark via-brand-dark/60 to-transparent" />
          {/* Main dark vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
          {/* Bottom fade — blends into next section */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-brand-dark to-transparent" />
          {/* Subtle color tint matching brand */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/10 via-transparent to-brand-cyan/10" />
        </div>

        {/* Hero content — above all overlays */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 text-center pt-32 pb-24">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <FileText className="w-4 h-4 text-brand-purple" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">Professional Resume Builder</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight leading-[1.05]"
            style={{ textShadow: '0 4px 40px rgba(0,0,0,0.6)' }}
          >
            Build Your{' '}
            <span className="text-gradient drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]">
              <TypewriterText texts={['Dream Resume', 'Career Future', 'Perfect Job', 'Success Story']} />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
          >
            Create, optimize, and download ATS-friendly resumes instantly.
            Stand out from thousands of applicants with a professional design.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/builder"
              className="px-9 py-4 rounded-full bg-gradient-premium neon-glow-hover text-white font-bold text-lg flex items-center gap-2 shadow-2xl"
            >
              Build My Resume <ChevronRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="px-9 py-4 rounded-full text-white font-bold text-lg hover:text-brand-cyan transition-all"
              style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.18)' }}
            >
              See All Features
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-20 flex flex-wrap justify-center items-center gap-8"
            style={{ opacity: 0.55 }}
          >
            <div className="flex items-center gap-2 font-bold text-base"><Zap className="w-4 h-4 text-brand-cyan" /> ATS-Ready</div>
            <div className="flex items-center gap-2 font-bold text-base"><Shield className="w-4 h-4 text-brand-purple" /> Privacy First</div>
            <div className="flex items-center gap-2 font-bold text-base"><Globe className="w-4 h-4 text-brand-blue" /> Industry Standard</div>
            <div className="flex items-center gap-2 font-bold text-base"><FileText className="w-4 h-4 text-brand-green" /> Free PDF Export</div>
          </motion.div>
        </div>

        {/* Scroll-down indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="text-xs font-bold uppercase tracking-widest text-white/40">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-6 h-6 text-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── What's Inside ─────────────────────────────────────────────── */}
      <section id="stats" className="relative z-10 py-16 px-6 border-y border-brand-border bg-gradient-to-r from-brand-secondary/80 to-brand-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Resume Templates', value: '3', sub: 'Minimal · Modern · Creative', icon: Layout },
              { label: 'Trusted Platform', value: 'Secure', sub: 'Bank-level encryption', icon: Shield },
              { label: 'PDF Export', value: 'Free', sub: 'Instant download', icon: FileText },
              { label: 'Data Storage', value: 'Safe', sub: '100% private connection', icon: Lock },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-4 group"
              >
                <stat.icon className="w-6 h-6 text-brand-cyan mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-black text-white mb-1 tracking-tight">{stat.value}</div>
                <div className="text-sm text-brand-cyan font-bold uppercase tracking-wider mb-1">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section
        id="features"
        className="relative z-10 py-24 px-6 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-brand-cyan text-xs font-bold uppercase tracking-widest mb-4"
            >
              <Zap className="w-3.5 h-3.5" /> Everything You Need
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Why Choose <span className="text-gradient">Tariani's Resume Builder?</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 max-w-xl mx-auto"
            >
              Our platform combines cutting-edge AI with professional design to give you the ultimate career advantage.
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Templates ────────────────────────────────────────────────── */}
      <section id="templates" className="relative z-10 py-24 px-6 bg-brand-secondary/30 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Premium <span className="text-gradient">Templates</span>
            </motion.h2>
            <p className="text-gray-400 max-w-xl mx-auto">Expertly designed for every industry and career level.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Minimal', desc: 'Clean, elegant, and timeless. Perfect for finance, consulting, and law.', color: 'bg-white', badge: 'Classic' },
              { name: 'Modern', desc: 'Bold and structured with a strong visual hierarchy. Great for tech roles.', color: 'bg-blue-50', badge: 'Popular' },
              { name: 'Creative', desc: 'Unique and artistic with expressive accents — ideal for design and marketing.', color: 'bg-purple-50', badge: 'Trending' },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 bg-gradient-premium text-white text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider">
                  {t.badge}
                </div>
                <div className="w-full aspect-[3/4] bg-brand-dark rounded-xl mb-5 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-premium opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                  <div className={cn('w-1/2 h-1/2 rounded-lg shadow-xl transition-transform duration-500 group-hover:scale-110', t.color)} />
                </div>
                <h3 className="text-xl font-bold capitalize text-center mb-1">{t.name}</h3>
                <p className="text-xs text-gray-500 text-center">{t.desc}</p>
                <Link
                  to="/builder"
                  className="mt-4 block w-full py-2.5 rounded-full text-center text-sm font-bold glass hover:bg-white/10 hover:text-brand-cyan transition-all"
                >
                  Use This Template
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Ready in <span className="text-gradient">3 Simple Steps</span>
            </motion.h2>
            <p className="text-gray-400 max-w-xl mx-auto">From zero to interview-ready in under 5 minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-[28px] left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-green opacity-30" />
            {[
              { title: 'Pick a Template', desc: 'Choose from ATS-optimized designs crafted for your industry.', icon: Layout, step: '01' },
              { title: 'Fill In Your Story', desc: 'Use AI suggestions or type your experience — we make it effortless.', icon: FileText, step: '02' },
              { title: 'Download & Apply', desc: 'Export to PDF and start sending applications immediately.', icon: Zap, step: '03' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.2 }}
                className="relative bg-brand-dark border-4 border-brand-dark p-8 rounded-2xl glass-card text-center group"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-premium flex items-center justify-center font-bold text-lg neon-glow">
                  {step.step}
                </div>
                <div className="w-16 h-16 mx-auto rounded-xl bg-brand-secondary flex items-center justify-center mb-6 mt-4 group-hover:scale-110 transition-transform">
                  <step.icon className="w-8 h-8 text-brand-cyan" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust & Security ─────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 bg-brand-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-brand-cyan text-xs font-bold uppercase tracking-widest mb-4"
            >
              <Shield className="w-3.5 h-3.5" /> Built For Professionals
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Your Data, Your <span className="text-gradient">Control</span>
            </motion.h2>
            <p className="text-gray-400 max-w-xl mx-auto">Everything is designed with your privacy and security in mind from day one.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'End-to-End Secure',
                desc: 'All connections are encrypted via HTTPS/TLS. Your resume data travels securely between you and our servers at all times.',
                badge: 'SSL/TLS',
                color: 'from-brand-purple/20 to-brand-blue/10',
                iconColor: 'text-brand-purple',
              },
              {
                icon: Lock,
                title: 'Private By Default',
                desc: 'Your resume is linked only to your account. No one else can view, access, or download your data — ever.',
                badge: 'Auth Protected',
                color: 'from-brand-cyan/20 to-brand-blue/10',
                iconColor: 'text-brand-cyan',
              },
              {
                icon: Globe,
                title: 'No Data Selling',
                desc: 'We do not run ads, sell your data, or share it with third parties. Your information stays with you.',
                badge: 'Zero Tracking',
                color: 'from-brand-green/20 to-brand-cyan/10',
                iconColor: 'text-brand-green',
              },
              {
                icon: Zap,
                title: 'Instant PDF Generation',
                desc: 'PDFs are generated locally in your browser. Your resume content never passes through any third-party rendering server.',
                badge: '100% Client-Side',
                color: 'from-brand-blue/20 to-brand-purple/10',
                iconColor: 'text-brand-blue',
              },
              {
                icon: Clock,
                title: 'Auto-Save, Always',
                desc: 'Every change you make is automatically saved to your personal account in real time. Never lose your progress.',
                badge: 'Real-Time Sync',
                color: 'from-brand-purple/20 to-brand-cyan/10',
                iconColor: 'text-brand-purple',
              },
              {
                icon: FileText,
                title: 'Your Resume, Forever',
                desc: 'There is no expiry on your account or your data. Build once, come back anytime, even months later.',
                badge: 'Lifetime Access',
                color: 'from-brand-cyan/20 to-brand-green/10',
                iconColor: 'text-brand-cyan',
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.08 }}
                className={`glass-card p-7 relative overflow-hidden group glass-card-hover`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-brand-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-brand-border text-gray-500">{card.badge}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-white transition-colors">{card.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* ── Professional Grade Note ─────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Professional Grade <span className="text-gradient">Platform</span>
            </motion.h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Crafted with care. No gimmicks, no fake numbers — just a clean tool that actually helps you build a great resume and land your next opportunity.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Cpu, title: 'Smart Content', desc: 'Intelligent resume generation that writes polished, impact-focused content — summaries, bullet points, and cover letters crafted for your target role.', color: 'text-brand-purple' },
              { icon: Shield, title: 'Secure & Private', desc: 'Your data never leaves your account. All connections are encrypted. Zero ads, zero tracking, zero data sharing with anyone.', color: 'text-brand-cyan' },
              { icon: FileText, title: 'Free, Always', desc: 'Every feature — smart generation, PDF export, cloud save, all templates — is completely free. No paywalls, no hidden fees.', color: 'text-brand-green' },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 text-center group glass-card-hover"
              >
                <card.icon className={`w-10 h-10 mx-auto mb-5 ${card.color} group-hover:scale-110 transition-transform`} />
                <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PDF Maker Promo ───────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 bg-brand-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: text */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-brand-cyan text-xs font-bold uppercase tracking-widest mb-6">
                  <Zap className="w-3.5 h-3.5" /> Free Tool — No Sign-Up Needed
                </span>
                <h2 className="text-4xl md:text-5xl font-black mb-6">
                  Turn Any Files Into a<br />
                  <span className="text-gradient">Professional PDF</span>
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  Our free PDF Maker lets you drag and drop images and text files, rearrange them however you like, and download a polished PDF in seconds — entirely in your browser, 100% private.
                </p>
                <div className="space-y-4 mb-10">
                  {[
                    { icon: Zap, text: 'Supports PNG, JPG, JPEG, WebP, GIF and .txt files', color: 'text-brand-cyan' },
                    { icon: Zap, text: 'Combine unlimited files into one PDF', color: 'text-brand-cyan' },
                    { icon: Zap, text: 'Reorder, remove and preview files before export', color: 'text-brand-cyan' },
                    { icon: Zap, text: 'Choose page size: A4, Letter, or A3', color: 'text-brand-cyan' },
                    { icon: Shield, text: 'Zero upload — processed entirely in your browser', color: 'text-brand-green' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3"
                    >
                      <item.icon className={`w-5 h-5 ${item.color} shrink-0`} />
                      <span className="text-gray-300 text-sm">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
                <Link
                  to="/pdf-maker"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-premium neon-glow-hover text-white font-black text-lg"
                >
                  <FileText className="w-5 h-5" /> Open PDF Maker — Free
                </Link>
              </motion.div>
            </div>

            {/* Right: visual mockup */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <div className="glass-card p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-premium" />
                {/* Fake drop zone */}
                <div className="border-2 border-dashed border-brand-cyan/40 rounded-xl p-8 text-center mb-4 bg-brand-cyan/5">
                  <div className="w-14 h-14 rounded-2xl bg-brand-secondary flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-7 h-7 text-brand-cyan" />
                  </div>
                  <p className="font-bold text-white mb-1">Drag & Drop files here</p>
                  <p className="text-xs text-gray-500">PNG, JPG, WebP, GIF, TXT</p>
                </div>
                {/* Fake file list */}
                {[
                  { name: 'photo-1.jpg', type: 'image', size: '1.2 MB', color: 'bg-brand-cyan/20 text-brand-cyan' },
                  { name: 'screenshot.png', type: 'image', size: '890 KB', color: 'bg-brand-cyan/20 text-brand-cyan' },
                  { name: 'notes.txt', type: 'text', size: '4 KB', color: 'bg-brand-purple/20 text-brand-purple' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl glass mb-2">
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${f.color} shrink-0`}>{f.type}</div>
                    <span className="text-sm font-medium truncate flex-grow">{f.name}</span>
                    <span className="text-xs text-gray-500 shrink-0">{f.size}</span>
                    <Upload className="w-4 h-4 text-brand-green shrink-0" />
                  </div>
                ))}
                <button className="w-full mt-4 py-3 rounded-xl bg-gradient-premium neon-glow text-white font-bold flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Generate PDF
                </button>
              </div>
              {/* Glow */}
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>


      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Frequently Asked <span className="text-gradient">Questions</span>
            </motion.h2>
            <p className="text-gray-400">Everything you need to know about Tariani's Resume Builder.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} delay={faq.delay} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto glass-card p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-premium" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-cyan/10 rounded-full blur-3xl" />
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl" />
          <FileText className="w-10 h-10 text-brand-cyan mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to land your dream job?</h2>
          <p className="text-gray-400 mb-10 text-lg max-w-xl mx-auto">
            Join professionals who have accelerated their careers with Tariani's Resume Builder. It takes less than 5 minutes.
          </p>
          <Link
            to="/builder"
            className="px-10 py-5 rounded-full bg-gradient-premium neon-glow-hover text-white font-black text-xl inline-flex items-center gap-3"
          >
            Get Started — It's Free <ChevronRight className="w-6 h-6" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
