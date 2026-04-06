import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Megaphone, MessageSquare, User, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';

import UsersManagement from './components/UsersManagement';
import AnnouncementsManagement from './components/AnnouncementsManagement';
import RequestsManagement from './components/RequestsManagement';
import ClassCompetition from './components/ClassCompetition';
import ClassCompetitionManagement from './components/ClassCompetitionManagement';
import CyberTeamManagement from './components/CyberTeamManagement';

export default function AdminDashboard() {
  return (
    <Routes>
      <Route path="/" element={<Overview />} />
      <Route path="users" element={<UsersManagement />} />
      <Route path="announcements" element={<AnnouncementsManagement />} />
      <Route path="requests" element={<RequestsManagement />} />
      <Route path="competition" element={<ClassCompetition />} />
      <Route path="competition/manage" element={<ClassCompetitionManagement />} />
      <Route path="cyber-team" element={<CyberTeamManagement />} />
      <Route path="*" element={<Navigate to="/dashboard/admin" />} />
    </Routes>
  );
}

function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  const fetchStats = async () => {
    try {
      const [users, requests, announcements, team] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('requests').select('*', { count: 'exact', head: true }),
        supabase.from('announcements').select('*', { count: 'exact', head: true }),
        supabase.from('security_team_applicants').select('*').eq('status', 'accepted')
      ]);

      setStats({
        totalUsers: users.count || 0,
        totalRequests: requests.count || 0,
        totalAnnouncements: announcements.count || 0,
        teamMembers: team.data || []
      });
    } catch (error) {
      setStats({ totalUsers: 0, totalRequests: 0, totalAnnouncements: 0 });
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up real-time subscriptions for all relevant tables
    const channel = supabase
      .channel('admin_dashboard_stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'security_team_applicants' }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          Administration Dashboard
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Welcome back, {user?.name}. Here's an overview of the school.</p>
      </div>

      {stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Users" value={stats.totalUsers || 0} icon={<Users className="h-6 w-6 text-blue-600" />} bg="bg-blue-50" />
            <StatCard title="Total Requests" value={stats.totalRequests || 0} icon={<MessageSquare className="h-6 w-6 text-amber-600" />} bg="bg-amber-50" />
            <StatCard title="Announcements" value={stats.totalAnnouncements || 0} icon={<Megaphone className="h-6 w-6 text-primary" />} bg="bg-primary/10" />
            <StatCard title="Cyber Team" value={stats.teamMembers.length} icon={<Shield className="h-6 w-6 text-green-600" />} bg="bg-green-50" />
          </div>

          <Card className="border-0 shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                Cyber Security Team Members
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {stats.teamMembers.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No accepted members yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50/30">
                        <th className="px-6 py-3 text-left font-semibold text-slate-600">Name</th>
                        <th className="px-6 py-3 text-left font-semibold text-slate-600">Technical Skill</th>
                        <th className="px-6 py-3 text-left font-semibold text-slate-600 text-right">Gender</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.teamMembers.map((member: any) => (
                        <tr key={member.id} className="border-b last:border-b-0 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{member.full_name}</td>
                          <td className="px-6 py-4 text-slate-600">
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-50 text-xs font-medium text-green-700">
                              {member.technical_skill}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-right">{member.gender}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, bg }: { title: string, value: number, icon: React.ReactNode, bg: string }) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
