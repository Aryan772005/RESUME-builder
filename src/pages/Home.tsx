import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Sparkles, FileText, Zap, Shield, ChevronRight, Star } from 'lucide-react';
import { cn } from '../lib/utils';

const TypewriterText = ({ texts }: { texts: string[] }) => {
  const [index, setIndex] = React.useState(0);
  const [displayText, setDisplayText] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    const currentText = texts[index];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentText.substring(0, displayText.length + 1));
        if (displayText === currentText) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setDisplayText(currentText.substring(0, displayText.length - 1));
        if (displayText === '') {
          setIsDeleting(false);
          setIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, index, texts]);

  return <span>{displayText}<span className="animate-pulse">|</span></span>;
};

const FeatureCard = ({ icon: Icon, title, description, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay, duration: 0.5 }}
    className="glass-card glass-card-hover p-8 group"
  >
    <div className="w-12 h-12 rounded-xl bg-brand-purple/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-cyan/10 transition-all duration-300">
      <Icon className="text-brand-purple group-hover:text-brand-cyan w-6 h-6 transition-colors duration-300" />
    </div>
    <h3 className="text-xl font-bold mb-3 group-hover:text-brand-cyan transition-colors duration-300">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </motion.div>
);

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-brand-dark">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-purple rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-brand-cyan rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <Sparkles className="w-4 h-4 text-brand-purple" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">Smart Resume Builder</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-8 tracking-tight leading-[1.1]"
          >
            Build Your Professional <br />
            <span className="text-gradient">
              <TypewriterText texts={["Resume", "Career Future", "Dream Job"]} />
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Generate, optimize, and download ATS-friendly resumes instantly. 
            Stand out from the crowd with premium templates and smart content.
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
              Create My Resume <ChevronRight className="w-5 h-5" />
            </Link>
            <button className="px-8 py-4 rounded-full glass text-white font-bold text-lg hover:bg-white/10 hover:text-brand-cyan transition-all">
              View Templates
            </button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-20 flex flex-wrap justify-center items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all"
          >
            <div className="flex items-center gap-2 font-bold text-xl"><Zap className="w-6 h-6" /> FAST-TRACK</div>
            <div className="flex items-center gap-2 font-bold text-xl"><Shield className="w-6 h-6" /> SECURE-DOC</div>
            <div className="flex items-center gap-2 font-bold text-xl"><Star className="w-6 h-6" /> PREMIUM</div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-6 bg-brand-secondary/50 border-y border-brand-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose <span className="text-gradient">aryme Resume?</span></h2>
            <p className="text-gray-400 max-w-xl mx-auto">Our platform combines cutting-edge technology with professional design to give you the ultimate career advantage.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Sparkles}
              title="Smart Content Generation"
              description="Instantly generate professional summaries and impactful bullet points tailored to your industry."
              delay={0.1}
            />
            <FeatureCard 
              icon={Zap}
              title="ATS Optimization"
              description="Our templates are engineered to pass through Applicant Tracking Systems with flying colors."
              delay={0.2}
            />
            <FeatureCard 
              icon={FileText}
              title="Premium Templates"
              description="Choose from a variety of modern, minimal, and creative templates designed by experts."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Premium <span className="text-gradient">Templates</span></h2>
            <p className="text-gray-400 max-w-xl mx-auto">Choose from our selection of professionally designed templates.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['minimal', 'modern', 'creative'].map((t, i) => (
              <motion.div 
                key={t}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-4 group cursor-pointer"
              >
                <div className="w-full aspect-[3/4] bg-brand-dark rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-premium opacity-0 group-hover:opacity-20 transition-opacity" />
                  <div className={cn(
                    "w-1/2 h-1/2 rounded shadow-lg transition-transform group-hover:scale-105",
                    t === 'minimal' ? "bg-white" : t === 'modern' ? "bg-blue-50" : "bg-purple-50"
                  )} />
                </div>
                <h3 className="text-xl font-bold capitalize text-center">{t}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-20 px-6 bg-brand-secondary/50 border-y border-brand-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple <span className="text-gradient">Pricing</span></h2>
            <p className="text-gray-400 max-w-xl mx-auto">Start for free, upgrade when you need more power.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="glass-card p-8">
              <h3 className="text-2xl font-bold mb-2">Basic</h3>
              <div className="text-4xl font-black mb-6">$0<span className="text-lg text-gray-500 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 text-gray-400">
                <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand-cyan" /> 1 Resume</li>
                <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand-cyan" /> Basic Templates</li>
                <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand-cyan" /> PDF Export</li>
              </ul>
              <Link to="/builder" className="block w-full py-3 rounded-full glass text-center font-bold hover:bg-white/10 transition-all">Get Started</Link>
            </div>
            <div className="glass-card p-8 relative overflow-hidden border-brand-cyan/30 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
              <div className="absolute top-0 right-0 bg-gradient-premium text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
              <h3 className="text-2xl font-bold mb-2 text-brand-cyan">Pro</h3>
              <div className="text-4xl font-black mb-6">$9<span className="text-lg text-gray-500 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 text-gray-400">
                <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand-cyan" /> Unlimited Resumes</li>
                <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand-cyan" /> All Premium Templates</li>
                <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand-cyan" /> Smart Content Generation</li>
                <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand-cyan" /> Cover Letter Builder</li>
              </ul>
              <Link to="/builder" className="block w-full py-3 rounded-full bg-gradient-premium neon-glow-hover text-white text-center font-bold transition-all">Upgrade to Pro</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto glass-card p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-premium" />
          <h2 className="text-4xl font-bold mb-6">Ready to land your dream job?</h2>
          <p className="text-gray-400 mb-10 text-lg">Join thousands of professionals who have accelerated their careers with aryme Resume.</p>
          <Link 
            to="/builder" 
            className="px-10 py-5 rounded-full bg-gradient-premium neon-glow-hover text-white font-black text-xl inline-block"
          >
            Get Started Now — It's Free
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
