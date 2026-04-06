import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { GraduationCap, LogOut, User, Menu, X } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Ranking 🏆', path: '/ranking' },
    { name: 'Announcements', path: '/announcements' },
    { name: 'AI Tools', path: '/ai-tools' },
    { name: 'Cyber Team 🛡️', path: '/cyber-team/join' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-primary" />
                <span className="font-bold text-xl text-slate-900">LQT</span>
              </Link>
              <nav className="hidden sm:ml-10 sm:flex sm:space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-slate-500 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* Desktop Auth */}
            <div className="hidden sm:flex sm:items-center">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link to="/dashboard">
                    <Button variant="outline" className="gap-2">
                      <User className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will log you out of your current session.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { logout(); navigate('/'); }} className="bg-red-600 hover:bg-red-700">
                          Confirm Logout
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <Link to="/login">
                  <Button className="bg-primary hover:bg-primary/90">Login</Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center sm:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden bg-white border-b animate-in slide-in-from-top duration-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 pb-2 border-t border-slate-100">
                {user ? (
                  <div className="space-y-1">
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-[90vw] rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Logout?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to end your session?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => { logout(); navigate('/'); setIsMenuOpen(false); }} className="bg-red-600 hover:bg-red-700">
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:text-primary/90 hover:bg-primary/5"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-white border-t py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
            <div className="text-center md:text-left">
              <Link to="/" className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg text-slate-900">LQT</span>
              </Link>
              <p className="text-slate-500 text-sm max-w-xs mx-auto md:mx-0">
                Empowering the next generation with modern tools and secure platforms.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-4">
              <div className="flex gap-6 text-slate-400">
                <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
                <Link to="/announcements" className="hover:text-slate-900 transition-colors">News</Link>
                <Link to="/ai-tools" className="hover:text-slate-900 transition-colors">Tools</Link>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 text-center text-slate-400 text-sm">
            <p>&copy; {new Date().getFullYear()} LQT. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
