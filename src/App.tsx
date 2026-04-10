import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Sparkles, Download, Layout as LayoutIcon, Github, Linkedin, Mail, Phone, MapPin, Plus, Trash2, Wand2, ChevronRight, Menu, X, LogIn, LogOut } from 'lucide-react';
import { cn } from './lib/utils';
import Home from './pages/Home';
import Builder from './pages/Builder';
import PdfMaker from './pages/PdfMaker';
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
    // Small timeout ensures DOM is rendered before we scroll
    const timer = setTimeout(() => {
      if (hash) {
        scrollToSection(hash.replace('#', ''));
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, signIn, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-brand-dark/80 backdrop-blur-md border-b border-brand-border py-3 shadow-[0_4px_30px_rgba(0,0,0,0.1)]" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-premium flex items-center justify-center neon-glow group-hover:scale-110 transition-transform">
            <FileText className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">Tariani's <span className="text-gradient">Resume</span></span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="/#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</a>
          <a href="/#templates" onClick={(e) => { e.preventDefault(); scrollToSection('templates'); }} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Templates</a>
          <Link to="/pdf-maker" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">PDF Maker</Link>
          
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
                className="px-5 py-2.5 rounded-full bg-gradient-premium neon-glow-hover text-white text-sm font-semibold transition-all"
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
                className="px-5 py-2.5 rounded-full bg-gradient-premium neon-glow-hover text-white text-sm font-semibold transition-all"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        <button className="md:hidden text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="border-t border-brand-border py-12 px-6 bg-brand-dark">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-premium flex items-center justify-center">
            <FileText className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold">Tariani's Resume Builder</span>
        </div>
        <p className="text-gray-400 max-w-sm mb-6">
          A personal project by Aryan Singh Tariani. AI-powered resume builder with ATS-friendly templates, smart content generation, and instant PDF export.
        </p>
        <div className="flex gap-4">
          <a href="#" className="p-2 rounded-full glass hover:bg-white/10 hover:text-brand-cyan transition-colors"><Github className="w-5 h-5" /></a>
          <a href="#" className="p-2 rounded-full glass hover:bg-white/10 hover:text-brand-cyan transition-colors"><Linkedin className="w-5 h-5" /></a>
          <a href="#" className="p-2 rounded-full glass hover:bg-white/10 hover:text-brand-cyan transition-colors"><Mail className="w-5 h-5" /></a>
        </div>
      </div>
      <div>
        <h4 className="font-bold mb-6">Product</h4>
        <ul className="space-y-4 text-gray-400 text-sm">
          <li><Link to="/builder" className="hover:text-brand-cyan transition-colors">Resume Builder</Link></li>
          <li><Link to="/pdf-maker" className="hover:text-brand-cyan transition-colors">PDF Maker</Link></li>
          <li><a href="#" className="hover:text-brand-cyan transition-colors">Templates</a></li>
          <li><a href="#" className="hover:text-brand-cyan transition-colors">ATS Check</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-6">Company</h4>
        <ul className="space-y-4 text-gray-400 text-sm">
          <li><a href="#" className="hover:text-brand-cyan transition-colors">About Us</a></li>
          <li><a href="#" className="hover:text-brand-cyan transition-colors">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-brand-cyan transition-colors">Terms of Service</a></li>
          <li><a href="#" className="hover:text-brand-cyan transition-colors">Contact</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-brand-border text-center text-gray-500 text-sm">
      © {new Date().getFullYear()} Aryan Singh Tariani. All rights reserved.
    </div>
  </footer>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, signIn } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-brand-purple/10 flex items-center justify-center mb-8">
          <FileText className="text-brand-purple w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Sign in to continue</h2>
        <p className="text-gray-400 max-w-md mb-8">You need a Google account to build, save, and download your professional resume.</p>
        <button 
          onClick={signIn}
          className="px-8 py-4 rounded-full bg-gradient-premium neon-glow-hover text-white font-bold text-lg flex items-center gap-2"
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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pdf-maker" element={<PdfMaker />} />
            <Route path="/builder" element={
              <ProtectedRoute>
                <Builder />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
