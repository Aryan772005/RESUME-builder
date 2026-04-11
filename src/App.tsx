import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Github, Linkedin, Mail, ChevronRight, Menu, X, LogIn, LogOut } from 'lucide-react';
import { cn } from './lib/utils';
import Home from './pages/Home';
import Builder from './pages/Builder';
import PdfMaker from './pages/PdfMaker';
import { Logo, LogoWordmark } from './components/Logo';
import { useAuth } from './contexts/AuthContext';

const NAVBAR_HEIGHT = 80;

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const top = element.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hash) {
        const el = document.getElementById(hash.replace('#', ''));
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    }, 80);  // wait for DOM paint after navigation
    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
};

const MouseGlow = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div 
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
      animate={{
        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(34, 211, 238, 0.05), transparent 40%)`
      }}
    />
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signIn, signOut } = useAuth();

  const [activeNav, setActiveNav] = useState('');

  useEffect(() => {
    if (location.pathname === '/builder') setActiveNav('builder');
    else if (location.pathname === '/pdf-maker') setActiveNav('pdf-maker');
    else if (location.pathname === '/' && location.hash) setActiveNav(location.hash.replace('#', ''));
    else if (location.pathname === '/') setActiveNav('');
  }, [location.pathname, location.hash]);

  const handleSectionNav = (sectionId: string) => {
    setActiveNav(sectionId);
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      // Already on home — just scroll
      scrollToSection(sectionId);
      // Update the URL without jumping so it can be shared/bookmarked
      window.history.pushState(null, '', `/#${sectionId}`);
    } else {
      // Navigate to home with hash, ScrollToTop will handle the scroll
      navigate(`/#${sectionId}`);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
        isScrolled || mobileMenuOpen ? "bg-transparent py-3 border-b border-white/10" : "bg-transparent border-b border-white/0"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveNav(''); setMobileMenuOpen(false); }} className="group">
            <LogoWordmark iconSize={36} />
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="/#features" onClick={(e) => { e.preventDefault(); handleSectionNav('features'); }} className={cn("text-sm font-medium transition-colors cursor-pointer", activeNav === 'features' ? "text-brand-cyan" : "text-gray-400 hover:text-white")}>Features</a>
            <a href="/#templates" onClick={(e) => { e.preventDefault(); handleSectionNav('templates'); }} className={cn("text-sm font-medium transition-colors cursor-pointer", activeNav === 'templates' ? "text-brand-cyan" : "text-gray-400 hover:text-white")}>Templates</a>
            <Link to="/builder" onClick={() => setActiveNav('builder')} className={cn("text-sm font-medium transition-colors cursor-pointer", activeNav === 'builder' ? "text-brand-cyan" : "text-gray-400 hover:text-white")}>Resume Builder</Link>
            <Link to="/pdf-maker" onClick={() => setActiveNav('pdf-maker')} className={cn("text-sm font-medium transition-colors cursor-pointer", activeNav === 'pdf-maker' ? "text-brand-cyan" : "text-gray-400 hover:text-white")}>JPG to PDF Maker</Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-brand-border" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-secondary border border-brand-border flex items-center justify-center text-xs font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-300 hidden lg:block">{user.displayName || user.email}</span>
                </div>
                <button 
                  onClick={signOut}
                  className="p-2 rounded-full glass hover:bg-white/10 hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
                <Link 
                  to="/builder" 
                  className="px-5 py-2.5 rounded-full bg-gradient-premium neon-glow-hover text-white text-sm font-semibold transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                >
                  Go to Builder
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button 
                  onClick={signIn}
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </button>
                <button 
                  onClick={signIn}
                  className="px-5 py-2.5 rounded-full bg-gradient-premium neon-glow-hover text-white text-sm font-semibold transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[72px] left-0 right-0 z-40 bg-brand-dark/95 backdrop-blur-md border-b border-white/10 md:hidden overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              <a href="/#features" onClick={(e) => { e.preventDefault(); handleSectionNav('features'); }} className={cn("text-lg font-bold transition-colors", activeNav === 'features' ? "text-brand-cyan" : "text-gray-300 hover:text-white")}>Features</a>
              <a href="/#templates" onClick={(e) => { e.preventDefault(); handleSectionNav('templates'); }} className={cn("text-lg font-bold transition-colors", activeNav === 'templates' ? "text-brand-cyan" : "text-gray-300 hover:text-white")}>Templates</a>
              <Link to="/builder" onClick={() => { setActiveNav('builder'); setMobileMenuOpen(false); }} className={cn("text-lg font-bold transition-colors", activeNav === 'builder' ? "text-brand-cyan" : "text-gray-300 hover:text-white")}>Resume Builder</Link>
              <Link to="/pdf-maker" onClick={() => { setActiveNav('pdf-maker'); setMobileMenuOpen(false); }} className={cn("text-lg font-bold transition-colors", activeNav === 'pdf-maker' ? "text-brand-cyan" : "text-gray-300 hover:text-white")}>JPG to PDF Maker</Link>
              
              <div className="h-px bg-white/10 w-full my-2"></div>
              
              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-brand-border" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-secondary border border-brand-border flex items-center justify-center text-sm font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-base font-medium text-white">{user.displayName || user.email}</span>
                  </div>
                  <div className="flex gap-4 w-full">
                    <Link 
                      to="/builder" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-3 rounded-xl bg-gradient-premium neon-glow-hover text-white text-center text-sm font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    >
                      Go to Builder
                    </Link>
                    <button 
                      onClick={() => { signOut(); setMobileMenuOpen(false); }}
                      className="p-3 rounded-xl glass hover:bg-white/10 text-red-400 transition-colors flex items-center justify-center border border-red-500/20"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => { signIn(); setMobileMenuOpen(false); }}
                    className="w-full py-3 rounded-xl glass text-white text-sm font-bold transition-all border border-brand-border"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => { signIn(); setMobileMenuOpen(false); }}
                    className="w-full py-3 rounded-xl bg-gradient-premium neon-glow-hover text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Footer = () => (
  <footer className="relative border-t border-brand-border py-12 px-6 bg-brand-dark overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-brand-cyan/20 to-transparent" />
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-2 mb-6 group cursor-pointer">
          <Logo size={32} />
          <span className="text-lg font-bold group-hover:text-brand-cyan transition-colors">Tariani's Resume Builder</span>
        </div>
        <p className="text-gray-400 max-w-sm mb-6">
          A professional resume &amp; PDF builder by Aryan Singh Tariani. ATS-friendly resume templates, smart content, and a free PDF maker tool — all in one place.
        </p>
        <div className="flex gap-4">
          <a href="https://github.com/Aryan772005" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full glass hover:bg-white/10 hover:text-brand-cyan transition-colors hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]"><Github className="w-5 h-5" /></a>
          <a href="https://www.linkedin.com/in/aryan-singh-tariani" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full glass hover:bg-white/10 hover:text-brand-cyan transition-colors hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]"><Linkedin className="w-5 h-5" /></a>
          <a href="mailto:aryansinghtariani@gmail.com" className="p-2 rounded-full glass hover:bg-white/10 hover:text-brand-cyan transition-colors hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]"><Mail className="w-5 h-5" /></a>
        </div>
      </div>
      <div>
        <h4 className="font-bold mb-6 text-white">Product</h4>
        <ul className="space-y-4 text-gray-400 text-sm">
          <li><Link to="/builder" className="hover:text-brand-cyan hover:translate-x-1 transition-all inline-block">Resume Builder</Link></li>
          <li><Link to="/pdf-maker" className="hover:text-brand-cyan hover:translate-x-1 transition-all inline-block">JPG to PDF Maker</Link></li>
          <li><a href="#" className="hover:text-brand-cyan hover:translate-x-1 transition-all inline-block">Templates</a></li>
          <li><a href="#" className="hover:text-brand-cyan hover:translate-x-1 transition-all inline-block">ATS Check</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-6 text-white">Company</h4>
        <ul className="space-y-4 text-gray-400 text-sm">
          <li><a href="#" className="hover:text-brand-cyan hover:translate-x-1 transition-all inline-block">About Us</a></li>
          <li><a href="#" className="hover:text-brand-cyan hover:translate-x-1 transition-all inline-block">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-brand-cyan hover:translate-x-1 transition-all inline-block">Terms of Service</a></li>
          <li><a href="#" className="hover:text-brand-cyan hover:translate-x-1 transition-all inline-block">Contact</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-brand-border/50 text-center text-gray-500 text-sm">
      © {new Date().getFullYear()} Aryan Singh Tariani. All rights reserved.
    </div>
  </footer>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, signIn } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/10 to-brand-cyan/10" />
        <div className="w-20 h-20 rounded-2xl bg-brand-purple/10 flex items-center justify-center mb-8 relative z-10 neon-glow">
          <Logo size={52} />
        </div>
        <h2 className="text-3xl font-bold mb-4 relative z-10">Sign in to continue</h2>
        <p className="text-gray-400 max-w-md mb-8 relative z-10">You need a Google account to build, save, and download your professional resume.</p>
        <button 
          onClick={signIn}
          className="px-8 py-4 rounded-full bg-gradient-premium neon-glow-hover text-white font-bold text-lg flex items-center gap-2 relative z-10"
        >
          <LogIn className="w-5 h-5" /> Sign In with Google
        </button>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-brand-dark relative selection:bg-brand-cyan/30 selection:text-white">
        <MouseGlow />
        <Navbar />
        <main className="flex-grow relative z-10">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pdf-maker" element={<PdfMaker />} />
              <Route path="/builder" element={
                <ProtectedRoute>
                  <Builder />
                </ProtectedRoute>
              } />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
