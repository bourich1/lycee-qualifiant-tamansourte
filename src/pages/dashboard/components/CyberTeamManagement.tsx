import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Shield, Search, Filter, CheckCircle, XCircle,
  ExternalLink, Loader2, Users, Clock, UserCheck, UserX, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
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

type Applicant = {
  id: string;
  full_name: string;
  phone: string;
  instagram_link: string;
  technical_skill: string;
  gender: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
};

type StatusFilter = 'all' | 'pending' | 'accepted' | 'rejected';

export default function CyberTeamManagement() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('security_team_applicants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to load applicants');
        console.error(error);
        return;
      }

      setApplicants(data || []);
    } catch {
      toast.error('Network error loading applicants');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const updateStatus = async (id: string, newStatus: 'pending' | 'accepted' | 'rejected') => {
    if (newStatus === 'accepted') {
      const applicant = applicants.find(a => a.id === id);
      if (applicant) {
        const currentCount = applicants.filter(
          a => a.status === 'accepted' && a.gender === applicant.gender
        ).length;
        
        if (currentCount >= 5) {
          toast.error(`Gender limit reached. Maximum 5 ${applicant.gender}s allowed.`);
          return;
        }
      }
    }
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('security_team_applicants')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        toast.error(`Failed to ${newStatus === 'accepted' ? 'accept' : 'reject'} applicant`);
        console.error(error);
        return;
      }

      toast.success(`Applicant ${newStatus === 'accepted' ? 'accepted' : 'rejected'} successfully`);
      setApplicants(prev =>
        prev.map(a => a.id === id ? { ...a, status: newStatus } : a)
      );
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteApplicant = async (id: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('security_team_applicants')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Failed to remove member');
        console.error(error);
        return;
      }

      toast.success('Member removed successfully');
      setApplicants(prev => prev.filter(a => a.id !== id));
    } catch {
      toast.error('Network error removing member');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplicants = applicants.filter(a => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    if (!matchesStatus) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return a.full_name.toLowerCase().includes(q) || a.phone.includes(q);
  });

  const stats = {
    total: applicants.length,
    pending: applicants.filter(a => a.status === 'pending').length,
    accepted: applicants.filter(a => a.status === 'accepted').length,
    rejected: applicants.filter(a => a.status === 'rejected').length,
    acceptedMale: applicants.filter(a => a.status === 'accepted' && a.gender === 'Male').length,
    acceptedFemale: applicants.filter(a => a.status === 'accepted' && a.gender === 'Female').length,
  };

  const statusBadge = (status: string) => {
    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'capitalize',
    };

    switch (status) {
      case 'pending':
        return <span style={{ ...base, backgroundColor: '#fef3c7', color: '#92400e' }}>
          <Clock className="h-3 w-3" /> Pending
        </span>;
      case 'accepted':
        return <span style={{ ...base, backgroundColor: '#d1fae5', color: '#065f46' }}>
          <UserCheck className="h-3 w-3" /> Accepted
        </span>;
      case 'rejected':
        return <span style={{ ...base, backgroundColor: '#fee2e2', color: '#991b1b' }}>
          <UserX className="h-3 w-3" /> Rejected
        </span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          Cyber Team Applicants
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Manage cyber security team applications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Users className="h-5 w-5 text-blue-600 mb-1" />
            <p className="text-xs font-medium text-slate-500">Total</p>
            <p className="text-lg font-bold text-slate-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Clock className="h-5 w-5 text-amber-600 mb-1" />
            <p className="text-xs font-medium text-slate-500">Pending</p>
            <p className="text-lg font-bold text-slate-900">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <UserCheck className="h-5 w-5 text-green-600 mb-1" />
            <p className="text-xs font-medium text-slate-500">Accepted</p>
            <p className="text-lg font-bold text-slate-900">{stats.accepted}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <UserX className="h-5 w-5 text-red-600 mb-1" />
            <p className="text-xs font-medium text-slate-500">Rejected</p>
            <p className="text-lg font-bold text-slate-900">{stats.rejected}</p>
          </CardContent>
        </Card>
        <Card className={`border-0 shadow-sm ${stats.acceptedMale >= 5 ? 'bg-amber-50' : ''}`}>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <UserCheck className={`h-5 w-5 ${stats.acceptedMale >= 5 ? 'text-amber-600' : 'text-primary'} mb-1`} />
            <p className="text-xs font-medium text-slate-500">Males</p>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-900">{stats.acceptedMale}/5</span>
              {stats.acceptedMale >= 5 && <span className="text-[10px] text-amber-600 font-bold uppercase">Locked</span>}
            </div>
          </CardContent>
        </Card>
        <Card className={`border-0 shadow-sm ${stats.acceptedFemale >= 5 ? 'bg-amber-50' : ''}`}>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <UserCheck className={`h-5 w-5 ${stats.acceptedFemale >= 5 ? 'text-amber-600' : 'text-primary'} mb-1`} />
            <p className="text-xs font-medium text-slate-500">Females</p>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-900">{stats.acceptedFemale}/5</span>
              {stats.acceptedFemale >= 5 && <span className="text-[10px] text-amber-600 font-bold uppercase">Locked</span>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="cyber-team-search"
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                id="cyber-team-status-filter"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Shield className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">No applicants found</p>
              <p className="text-sm mt-1">
                {searchQuery ? 'Try adjusting your search query' : 'No applications have been submitted yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Full Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden md:table-cell">Skill</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden lg:table-cell">Instagram</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplicants.map((applicant) => (
                    <tr key={applicant.id} className="border-b last:border-b-0 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900">{applicant.full_name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{applicant.gender}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{applicant.phone}</td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-xs font-medium text-slate-700">
                          {applicant.technical_skill}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <a
                          href={applicant.instagram_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline text-xs"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Profile
                        </a>
                      </td>
                      <td className="px-4 py-3">{statusBadge(applicant.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {applicant.status === 'pending' ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                onClick={() => updateStatus(applicant.id, 'accepted')}
                                disabled={updatingId === applicant.id}
                              >
                                {updatingId === applicant.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                )}
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => updateStatus(applicant.id, 'rejected')}
                                disabled={updatingId === applicant.id}
                              >
                                {updatingId === applicant.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5 mr-1" />
                                )}
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-slate-500 hover:text-slate-700"
                            onClick={() => updateStatus(applicant.id, 'pending')}
                            disabled={updatingId === applicant.id}
                          >
                            {updatingId === applicant.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              'Reset'
                            )}
                          </Button>
                        )}

                        {/* Super Admin Delete Option */}
                        {user?.role === 'super_admin' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                                disabled={updatingId === applicant.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Permanently remove member?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will delete {applicant.full_name}'s application record forever. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteApplicant(applicant.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Confirm Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
