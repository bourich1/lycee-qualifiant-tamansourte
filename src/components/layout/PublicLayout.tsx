import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { GraduationCap, LogOut, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

export default function PublicLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Ranking 🏆', path: '/ranking' },
    { name: 'Announcements', path: '/announcements' },
    { name: 'AI Tools', path: '/ai-tools' },
    { name: 'Cyber Team 🛡️', path: '/cyber-team/join' },
  ];

  // Handle scroll for sticky navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Initialize & Refresh AOS inside React lifecycle
    // @ts-expect-error - AOS is loaded via CDN
    if (window.AOS) {
      // @ts-expect-error
      window.AOS.init({ duration: 800, once: true });
      // @ts-expect-error
      window.AOS.refresh();
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <header 
        className={`sticky top-0 left-0 w-full z-[9999] transition-all duration-300 border-b animate-in fade-in slide-in-from-top-4
          ${isScrolled 
            ? 'bg-white/80 backdrop-blur-lg border-slate-200/50 shadow-sm py-2' 
            : 'bg-white border-transparent py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-12 w-full">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2.5 group relative z-50">
                <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="h-7 w-7 text-primary" />
                </div>
                <span className="font-extrabold text-2xl tracking-tight text-slate-900 group-hover:text-primary transition-colors">LQT</span>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex lg:ml-10 lg:space-x-1 tracking-tight">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center shrink-0 animate-in fade-in slide-in-from-top-4 duration-500
                      ${location.pathname === link.path 
                        ? 'text-primary bg-primary/5' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* Desktop Auth */}
            <div className="hidden lg:flex lg:items-center">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link to="/dashboard">
                    <Button variant="outline" className="gap-2 rounded-full font-semibold px-6 border-slate-200 hover:bg-slate-50 hover:text-primary transition-all">
                      <User className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" className="rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl p-6">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will log you out of your current session.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-6">
                        <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { logout(); navigate('/'); }} className="rounded-full bg-red-600 hover:bg-red-700">
                          Confirm Logout
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <Link to="/login">
                  <Button className="bg-primary hover:bg-primary/90 rounded-full px-8 font-semibold shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:-translate-y-0.5">
                    Login Platform
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center lg:hidden">
              <button 
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, x: '-100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 bottom-0 w-[80vw] max-w-sm bg-white shadow-2xl border-r border-slate-100 z-50 lg:hidden overflow-hidden flex flex-col pt-16"
            >
              <div className="p-4 overflow-y-auto">
                <div className="space-y-1 mb-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`block px-5 py-4 rounded-2xl text-base font-semibold transition-colors min-h-[44px] flex items-center
                        ${location.pathname === link.path 
                          ? 'bg-primary/5 text-primary' 
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  {user ? (
                    <>
                      <Link to="/dashboard">
                        <Button className="w-full justify-start rounded-2xl h-14 text-base bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200" variant="outline">
                          <User className="h-5 w-5 mr-3 text-slate-500" /> Dashboard
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" className="w-full justify-start rounded-2xl h-14 text-base text-red-600 hover:bg-red-50 hover:text-red-700">
                            <LogOut className="h-5 w-5 mr-3" /> Logout
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="w-[90vw] max-w-sm rounded-3xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Logout?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to end your session?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col gap-3 mt-4">
                            <AlertDialogCancel className="w-full rounded-xl m-0">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => { logout(); navigate('/'); setIsMenuOpen(false); }} 
                              className="bg-red-600 hover:bg-red-700 w-full rounded-xl m-0"
                            >
                              Confirm Logout
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : (
                    <Link to="/login" className="block">
                      <Button className="w-full rounded-2xl h-14 text-base font-bold bg-primary hover:bg-primary/90 shadow-md">
                        Login Platform
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-grow w-full">
        <Outlet />
      </main>

      {/* Footer Restyled for Modern Look */}
      <footer className="bg-white border-t border-slate-200 mt-auto overflow-hidden relative">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 text-center md:text-left">
            <div className="md:col-span-5 flex flex-col items-center md:items-start">
              <Link to="/" className="flex items-center gap-2 mb-6 group">
                <div className="bg-primary p-2 rounded-xl text-white">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <span className="font-extrabold text-2xl text-slate-900 group-hover:text-primary transition-colors tracking-tight">LQT Campus</span>
              </Link>
              <p className="text-slate-500 text-base max-w-sm leading-relaxed">
                Empowering the next generation with modern tools, secure platforms, and rigorous academic excellence.
              </p>
            </div>
            
            <div className="md:col-span-7 flex flex-col sm:flex-row justify-center md:justify-end gap-12 sm:gap-24">
              <div className="flex flex-col gap-4">
                <span className="font-bold text-slate-900 tracking-tight">Explore</span>
                <Link to="/" className="text-slate-500 hover:text-primary transition-colors">Home</Link>
                <Link to="/announcements" className="text-slate-500 hover:text-primary transition-colors">News</Link>
                <Link to="/ai-tools" className="text-slate-500 hover:text-primary transition-colors">Tools</Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="font-bold text-slate-900 tracking-tight">Community</span>
                <Link to="/ranking" className="text-slate-500 hover:text-primary transition-colors">Ranking 🏆</Link>
                <Link to="/cyber-team/join" className="text-slate-500 hover:text-primary transition-colors">Cyber Team 🛡️</Link>
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm font-medium">
            <p>&copy; {new Date().getFullYear()} Lycée Qualifiant Tamansourte. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
