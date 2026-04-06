import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, MessageSquare, Megaphone, UserCircle, Plus, Clock, CheckCircle2, Calendar, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import ClassCompetition from './components/ClassCompetition';

export default function StudentDashboard() {
  return (
    <Routes>
      <Route path="/" element={<Overview />} />
      <Route path="requests" element={<StudentRequests />} />
      <Route path="announcements" element={<StudentAnnouncements />} />
      <Route path="competition" element={<ClassCompetition />} />
      <Route path="profile" element={<StudentProfile />} />
      <Route path="*" element={<Navigate to="/dashboard/student" />} />
    </Routes>
  );
}

function Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          Student Dashboard
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Welcome back, {user?.name}. You are the representative for Class {user?.class}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <MessageSquare className="h-5 w-5" />
              Submit a Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-primary/80 mb-4">Need to report an issue or make a request on behalf of your class? Submit it directly to the administration.</p>
            <Button onClick={() => navigate('/dashboard/student/requests')} className="bg-primary hover:bg-primary/90">
              Go to Requests
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Megaphone className="h-5 w-5" />
              Check Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 mb-4">Stay updated with the latest news from the school. Make sure to mark them as seen for your class.</p>
            <Button onClick={() => navigate('/dashboard/student/announcements')} className="bg-blue-600 hover:bg-blue-700">
              View Announcements
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StudentRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setRequests(data.map(r => ({
        id: r.id,
        subject: r.subject,
        message: r.message,
        status: r.status,
        reply: r.reply,
        createdAt: r.created_at
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleCreate called", { subject, message, user });
    if (!user) {
      console.error("No user found");
      return;
    }
    try {
      console.log("Inserting request to Supabase...");
      const { error } = await supabase
        .from('requests')
        .insert([
          { 
            student_id: user.id,
            subject, 
            message 
          }
        ]);
      
      console.log("Supabase response error:", error);
      if (!error) {
        toast.success('Request submitted successfully');
        setIsDialogOpen(false);
        setSubject('');
        setMessage('');
        fetchRequests();
      } else {
        console.error('Supabase error:', error);
        toast.error(`Failed to submit request: ${error.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Catch error:', error);
      toast.error(`Network error: ${error.message || 'Unknown error'}`);
    }
  };

  const filteredRequests = requests.filter(req => 
    req.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            My Requests
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Submit and track requests for your class.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit a Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input 
                  id="subject" 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)} 
                  required 
                  placeholder="e.g., Broken projector in Room 1A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                  required 
                  rows={6}
                  placeholder="Describe the issue or request in detail..."
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <button type="submit" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary px-2.5 py-1.5 text-sm font-medium text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 transition-colors">
                  Submit Request
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <Input 
            placeholder="Search requests..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64"
          />
        </div>
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              You haven't submitted any requests yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Subject</TableHead>
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium min-w-[150px]">{req.subject}</TableCell>
                      <TableCell className="text-slate-500 text-sm whitespace-nowrap">
                        {format(new Date(req.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {req.status === 'pending' ? (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            <Clock className="w-3 h-3 mr-1" /> Pending
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Answered
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">View Details</Button>
                          </DialogTrigger>
                          <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Request Details</DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="bg-slate-50 p-4 rounded-lg border">
                                <h4 className="font-semibold text-slate-900 mb-2">{req.subject}</h4>
                                <p className="text-slate-700 whitespace-pre-wrap text-sm">{req.message}</p>
                              </div>
  
                              {req.status === 'answered' && (
                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                                  <h4 className="font-semibold text-emerald-900 mb-2">Administration Reply</h4>
                                  <p className="text-emerald-800 whitespace-pre-wrap text-sm">{req.reply}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StudentAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setAnnouncements(data.map(a => ({
        id: a.id,
        title: a.title,
        content: a.content,
        createdAt: a.created_at,
        seenBy: a.seen_by || []
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const markAsSeen = async (id: string) => {
    if (!user || !user.class) return;
    
    try {
      // First get current seen_by
      const { data: currentData } = await supabase
        .from('announcements')
        .select('seen_by')
        .eq('id', id)
        .single();
        
      const currentSeenBy = currentData?.seen_by || [];
      if (currentSeenBy.includes(user.class)) return;
      
      const newSeenBy = [...currentSeenBy, user.class];
      
      const { error } = await supabase
        .from('announcements')
        .update({ seen_by: newSeenBy })
        .eq('id', id);
      
      if (!error) {
        toast.success('Marked as seen');
        fetchAnnouncements();
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const filteredAnnouncements = announcements.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Megaphone className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Announcements
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Important notices from the administration.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <Input 
            placeholder="Search announcements..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No announcements available.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAnnouncements.map((announcement) => {
            const isSeen = user?.class && announcement.seenBy.includes(user.class);
            return (
              <Card key={announcement.id} className={`border-0 shadow-md transition-all ${isSeen ? 'bg-white' : 'bg-blue-50/50 border-l-4 border-l-blue-500'}`}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">{announcement.title}</CardTitle>
                    <div className="flex items-center text-xs sm:text-sm text-slate-500 bg-white px-3 py-1 rounded-full border">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed mb-6 text-sm sm:text-base">{announcement.content}</p>
                  
                  <div className="flex justify-end">
                    {isSeen ? (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 px-3 py-1 text-xs sm:text-sm">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" /> Seen by Class {user?.class}
                      </Badge>
                    ) : (
                      <Button onClick={() => markAsSeen(announcement.id)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm">
                        <Eye className="w-4 h-4 mr-2" /> Mark as Seen for Class {user?.class}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StudentProfile() {
  const { user } = useAuth();
  
  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <UserCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          My Profile
        </h1>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl sm:text-3xl font-bold">
              {user?.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{user?.name}</h2>
              <p className="text-slate-500 text-sm sm:text-base">{user?.email}</p>
              <Badge className="mt-2 bg-primary/10 text-primary border-primary/20">
                Class {user?.class} Representative
              </Badge>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-slate-900 mb-4">Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Role</p>
                <p className="font-medium capitalize">{user?.role}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Class Assigned</p>
                <p className="font-medium">{user?.class}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
