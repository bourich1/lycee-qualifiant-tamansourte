import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Users, Megaphone, Wrench, BarChart3,
  MessageSquare, UserCircle, LogOut, GraduationCap,
  Menu, X, Award, Shield
} from 'lucide-react';
import { useState } from 'react';
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

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getNavLinks = () => {
    const normalizedRole = user?.role === 'super-admin' as any ? 'super_admin' : user?.role;

    switch (normalizedRole) {
      case 'super_admin':
        return [
          { name: 'Dashboard', path: '/dashboard/super-admin', icon: LayoutDashboard },
          { name: 'Users', path: '/dashboard/super-admin/users', icon: Users },
          { name: 'Announcements', path: '/dashboard/super-admin/announcements', icon: Megaphone },
          { name: 'AI Tools', path: '/dashboard/super-admin/tools', icon: Wrench },
          { name: 'Requests', path: '/dashboard/super-admin/requests', icon: MessageSquare },
          { name: 'Manage Competition', path: '/dashboard/super-admin/competition/manage', icon: Award },
          { name: 'Cyber Team', path: '/dashboard/super-admin/cyber-team', icon: Shield },
          { name: 'Statistics', path: '/dashboard/super-admin/stats', icon: BarChart3 },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/dashboard/admin', icon: LayoutDashboard },
          { name: 'Users', path: '/dashboard/admin/users', icon: Users },
          { name: 'Requests', path: '/dashboard/admin/requests', icon: MessageSquare },
          { name: 'Announcements', path: '/dashboard/admin/announcements', icon: Megaphone },
          { name: 'Manage Competition', path: '/dashboard/admin/competition/manage', icon: Award },
          { name: 'Cyber Team', path: '/dashboard/admin/cyber-team', icon: Shield },
        ];
      case 'student':
        return [
          { name: 'Dashboard', path: '/dashboard/student', icon: LayoutDashboard },
          { name: 'My Requests', path: '/dashboard/student/requests', icon: MessageSquare },
          { name: 'Announcements', path: '/dashboard/student/announcements', icon: Megaphone },
          { name: 'Class Competition', path: '/dashboard/student/competition', icon: Award },
          { name: 'Profile', path: '/dashboard/student/profile', icon: UserCircle },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">LQT</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col pt-16 lg:pt-0
      `}>
        <div className="h-16 hidden lg:flex items-center px-6 border-b">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-slate-900">LQT</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || (link.path !== `/dashboard/${user?.role.replace('_', '-')}` && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-700 hover:bg-slate-100'
                    }
                  `}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role.replace('_', ' ')}</p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Ready to leave?</AlertDialogTitle>
                <AlertDialogDescription>
                  Select "Logout" below if you are ready to end your current session.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={logout} className="bg-red-600 hover:bg-red-700">
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pt-16 lg:pt-0">
        {/* Top Header */}
        <header className="hidden lg:flex h-16 bg-white border-b items-center justify-end px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
