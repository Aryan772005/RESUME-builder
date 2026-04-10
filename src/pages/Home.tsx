import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Sparkles, FileText, Zap, Shield, ChevronRight, Star, CheckCircle2,
  Users, Layout, ChevronDown, Globe, Cpu, Palette,
  Clock, Quote, X, Upload, Download, Check
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

/* ─── TestimonialCard ───────────────────────────────────────────────────── */
const TestimonialCard = ({ name, role, company, text, rating, delay, avatar }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ delay, duration: 0.5 }}
    className="glass-card p-8 flex flex-col gap-5 relative"
  >
    <Quote className="absolute top-6 right-6 w-8 h-8 text-brand-cyan/20" />
    <div className="flex gap-1">
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
    <p className="text-gray-300 leading-relaxed text-sm">"{text}"</p>
    <div className="flex items-center gap-3 mt-auto">
      <div className="w-10 h-10 rounded-full bg-gradient-premium flex items-center justify-center font-bold text-sm shrink-0">
        {avatar}
      </div>
      <div>
        <div className="font-bold text-sm">{name}</div>
        <div className="text-xs text-gray-500">{role} · {company}</div>
      </div>
    </div>
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
    { icon: Sparkles, title: 'AI Content Generation', description: 'Instantly generate professional summaries and impact-driven bullet points tailored to your exact industry and level.', gradient: 'bg-gradient-to-br from-brand-purple to-brand-blue' },
    { icon: Zap, title: 'ATS Optimization', description: 'Our templates are engineered to pass Applicant Tracking Systems every time — your resume will always be seen by human eyes.', gradient: 'bg-gradient-to-br from-brand-blue to-brand-cyan' },
    { icon: FileText, title: 'Premium Templates', description: 'Choose from modern, minimal, and creative templates designed by expert recruiters from top companies.', gradient: 'bg-gradient-to-br from-brand-cyan to-brand-green' },
    { icon: Cpu, title: 'Resume Score & Analysis', description: 'Get an instant AI-driven score on your resume with 5 actionable suggestions to land more interviews.', gradient: 'bg-gradient-to-br from-brand-green to-brand-cyan' },
    { icon: Palette, title: 'Cover Letter Builder', description: 'Generate a tailored, professional cover letter in seconds — personalized to the job description you paste in.', gradient: 'bg-gradient-to-br from-brand-purple to-brand-cyan' },
    { icon: Clock, title: 'Auto-Save to Cloud', description: 'Your resume is synced in real-time to secure cloud storage. Never lose your work — pick up where you left off on any device.', gradient: 'bg-gradient-to-br from-brand-blue to-brand-purple' },
  ];

  const testimonials = [
    { name: 'Priya Sharma', role: 'Software Engineer', company: 'Google', text: "I landed my dream job at Google within 3 weeks of using aryme. The AI-generated bullet points made my experience sound 10x better than what I had before.", rating: 5, avatar: 'PS', delay: 0.1 },
    { name: 'Marcus Johnson', role: 'Product Manager', company: 'Meta', text: "The ATS optimization is absolutely real. I went from getting zero callbacks to 4 interviews in the same week. This tool is a game-changer.", rating: 5, avatar: 'MJ', delay: 0.2 },
    { name: 'Aisha Patel', role: 'Data Scientist', company: 'Stripe', text: "Clean, beautiful templates and the AI resume score feature helped me understand exactly what I was missing. Highly recommend to any job seeker.", rating: 5, avatar: 'AP', delay: 0.3 },
    { name: 'Ryan Chen', role: 'UX Designer', company: 'Figma', text: "The creative template is stunning. My resume literally stood out visually and I got compliments on it during interviews. Worth every penny!", rating: 5, avatar: 'RC', delay: 0.1 },
    { name: 'Sofia Martinez', role: 'Backend Engineer', company: 'Shopify', text: "Generated my entire resume in under 3 minutes with the AI generator. Just described my background and it built a perfect resume. Mind-blowing.", rating: 5, avatar: 'SM', delay: 0.2 },
    { name: 'David Kim', role: 'DevOps Engineer', company: 'AWS', text: "I've tried 5 resume builders. This is the only one that feels premium. The interface is slick, fast and the results are professional.", rating: 5, avatar: 'DK', delay: 0.3 },
  ];

  const faqs = [
    { q: 'Is aryme Resume really free to use?', a: 'Yes! Our Basic plan is 100% free forever with no credit card required. You can build 1 resume and export it as a PDF. Upgrade to Pro for unlimited resumes, AI features, and all premium templates.', delay: 0.05 },
    { q: 'Are the resumes ATS-compatible?', a: 'Absolutely. Every template is built from the ground up to be fully parsed by modern Applicant Tracking Systems. We avoid complex tables, images in headers, and other elements that trip up ATS software.', delay: 0.1 },
    { q: 'How does the AI resume generator work?', a: 'Simply describe your professional background in plain English — your experience, skills, education, and target role. Our AI (powered by Google Gemini) will generate a complete, polished resume in seconds, which you can then edit and refine.', delay: 0.15 },
    { q: 'Can I edit my resume after downloading?', a: 'Your resume data is always saved in your account. You can return anytime, make changes, and download a fresh PDF. With a Pro account, changes are synced across devices in real-time.', delay: 0.2 },
    { q: 'What file formats can I export to?', a: 'Currently we support high-quality PDF export, which is the standard format required by employers worldwide. We are actively working on Word (.docx) export for a future release.', delay: 0.25 },
    { q: 'Is my data private and secure?', a: 'Your resume data is stored securely in your personal account via Firebase. We never share or sell your data. Your information is only used to generate resume content within the app.', delay: 0.3 },
  ];

  return (
    /* NOTE: No overflow-hidden here — that was locking the page scroll */
    <div className="relative bg-brand-dark">

      {/* ── Animated Background Orbs ─────────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-brand-purple rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-[60%] left-[40%] w-[30%] h-[30%] bg-brand-cyan rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-36 pb-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <Sparkles className="w-4 h-4 text-brand-purple" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">AI-Powered Resume Builder</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-8 tracking-tight leading-[1.1]"
          >
            Build Your{' '}
            <span className="text-gradient">
              <TypewriterText texts={['Dream Resume', 'Career Future', 'Perfect Job', 'Success Story']} />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Generate, optimize, and download ATS-friendly resumes instantly with AI.
            Stand out from thousands of applicants with recruiter-approved designs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/builder"
              className="px-8 py-4 rounded-full bg-gradient-premium neon-glow-hover text-white font-bold text-lg flex items-center gap-2"
            >
              Build My Resume <ChevronRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="px-8 py-4 rounded-full glass text-white font-bold text-lg hover:bg-white/10 hover:text-brand-cyan transition-all"
            >
              See All Features
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-20 flex flex-wrap justify-center items-center gap-8 opacity-40 hover:opacity-80 transition-opacity duration-500"
          >
            <div className="flex items-center gap-2 font-bold text-lg"><Zap className="w-5 h-5 text-brand-cyan" /> ATS-Ready</div>
            <div className="flex items-center gap-2 font-bold text-lg"><Shield className="w-5 h-5 text-brand-purple" /> Secure Cloud</div>
            <div className="flex items-center gap-2 font-bold text-lg"><Globe className="w-5 h-5 text-brand-blue" /> 50+ Countries</div>
            <div className="flex items-center gap-2 font-bold text-lg"><Star className="w-5 h-5 text-yellow-400" /> 4.9 / 5 Rating</div>
            <div className="flex items-center gap-2 font-bold text-lg"><Users className="w-5 h-5 text-brand-green" /> 100K+ Users</div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-16 px-6 border-y border-brand-border bg-gradient-to-r from-brand-secondary/80 to-brand-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Resumes Created', value: '100,000+', icon: FileText },
              { label: 'Job Offers Landed', value: '45,000+', icon: CheckCircle2 },
              { label: 'Premium Templates', value: '20+', icon: Layout },
              { label: 'User Rating', value: '4.9 / 5', icon: Star },
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
                <div className="text-4xl font-black text-white mb-2 tracking-tight">{stat.value}</div>
                <div className="text-sm text-brand-cyan font-bold uppercase tracking-wider">{stat.label}</div>
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
              Why Choose <span className="text-gradient">aryme Resume?</span>
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

      {/* ── Competitor Comparison ────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 bg-brand-secondary/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              aryme vs <span className="text-gradient">The Competition</span>
            </motion.h2>
            <p className="text-gray-400 max-w-xl mx-auto">See why job seekers choose aryme over other builders.</p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card overflow-hidden"
          >
            <div className="grid grid-cols-4 text-center text-sm font-bold border-b border-brand-border">
              <div className="p-4 text-left text-gray-400">Feature</div>
              <div className="p-4 bg-brand-cyan/5 text-brand-cyan">aryme ✦</div>
              <div className="p-4 text-gray-500">Canva</div>
              <div className="p-4 text-gray-500">Zety</div>
            </div>
            {[
              ['AI Resume Generator', true, false, false],
              ['ATS Optimized', true, false, true],
              ['Free PDF Export', true, true, false],
              ['Resume Score w/ Tips', true, false, false],
              ['AI Cover Letter', true, false, true],
              ['Cloud Sync', true, false, false],
              ['No Watermarks (Free)', true, true, false],
            ].map(([feature, aryme, canva, zety], i) => (
              <div key={i} className={cn('grid grid-cols-4 text-center text-sm border-b border-brand-border/50 last:border-0', i % 2 === 0 ? 'bg-white/[0.01]' : '')}>
                <div className="p-4 text-left text-gray-300 font-medium">{feature as string}</div>
                <div className="p-4 bg-brand-cyan/5">{aryme ? <CheckCircle2 className="w-5 h-5 text-brand-cyan mx-auto" /> : <X className="w-5 h-5 text-gray-600 mx-auto" />}</div>
                <div className="p-4">{canva ? <Check className="w-5 h-5 text-gray-400 mx-auto" /> : <X className="w-5 h-5 text-gray-600 mx-auto" />}</div>
                <div className="p-4">{zety ? <Check className="w-5 h-5 text-gray-400 mx-auto" /> : <X className="w-5 h-5 text-gray-600 mx-auto" />}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Stories of <span className="text-gradient">Success</span>
            </motion.h2>
            <p className="text-gray-400 max-w-xl mx-auto">Real people. Real offers. Real results.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} {...t} />
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
                    { icon: CheckCircle2, text: 'Supports PNG, JPG, JPEG, WebP, GIF and .txt files', color: 'text-brand-cyan' },
                    { icon: CheckCircle2, text: 'Combine unlimited files into one PDF', color: 'text-brand-cyan' },
                    { icon: CheckCircle2, text: 'Reorder, remove and preview files before export', color: 'text-brand-cyan' },
                    { icon: CheckCircle2, text: 'Choose page size: A4, Letter, or A3', color: 'text-brand-cyan' },
                    { icon: CheckCircle2, text: 'Zero upload — processed entirely in your browser', color: 'text-brand-green' },
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
                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
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
            <p className="text-gray-400">Everything you need to know about aryme Resume.</p>
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
          <Sparkles className="w-10 h-10 text-brand-cyan mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to land your dream job?</h2>
          <p className="text-gray-400 mb-10 text-lg max-w-xl mx-auto">
            Join 100,000+ professionals who have accelerated their careers with aryme Resume. It takes less than 5 minutes.
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
