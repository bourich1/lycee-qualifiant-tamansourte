import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Reply, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
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

type Request = {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  subject: string;
  message: string;
  status: 'pending' | 'answered';
  reply: string | null;
  createdAt: string;
};

export default function RequestsManagement() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [replyText, setReplyText] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        users (
          name,
          class_name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setRequests(data.map(r => ({
        id: r.id,
        studentId: r.student_id,
        studentName: r.users?.name || 'Unknown',
        studentClass: r.users?.class_name || 'Unknown',
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

    // Set up real-time subscription for requests
    const channel = supabase
      .channel('requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, fetchRequests)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      const { error } = await supabase
        .from('requests')
        .update({ 
          reply: replyText,
          status: 'answered'
        })
        .eq('id', selectedRequest.id);
      
      if (!error) {
        toast.success('Reply sent successfully');
        setSelectedRequest(null);
        setReplyText('');
        fetchRequests();
      } else {
        toast.error('Failed to send reply');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', id);
      
      if (!error) {
        toast.success('Request deleted');
        fetchRequests();
      } else {
        toast.error('Failed to delete request');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.studentClass.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Student Requests
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage and respond to requests from class representatives.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <Input 
            placeholder="Search requests..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="answered">Answered</SelectItem>
            </SelectContent>
          </Select>
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
              No requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Class</TableHead>
                    <TableHead className="whitespace-nowrap">Student</TableHead>
                    <TableHead className="whitespace-nowrap">Subject</TableHead>
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline" className="font-mono">{req.studentClass}</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-slate-700 whitespace-nowrap">{req.studentName}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{req.subject}</TableCell>
                      <TableCell className="text-slate-500 text-sm whitespace-nowrap">
                        {format(new Date(req.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {req.status === 'pending' ? (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                            <Clock className="w-3 h-3 mr-1" /> Pending
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Answered
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Dialog open={selectedRequest?.id === req.id} onOpenChange={(open) => {
                          if (open) {
                            setSelectedRequest(req);
                            setReplyText(req.reply || '');
                          } else {
                            setSelectedRequest(null);
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className={req.status === 'pending' ? 'border-primary/20 text-primary hover:bg-primary/5' : ''}>
                              {req.status === 'pending' ? (
                                <><Reply className="w-4 h-4 mr-1" /> Reply</>
                              ) : (
                                'View'
                              )}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px] w-[95vw] sm:w-full">
                            <DialogHeader>
                              <DialogTitle>Request Details</DialogTitle>
                              <DialogDescription>
                                From {req.studentName} (Class {req.studentClass})
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="bg-slate-50 p-4 rounded-lg border">
                                <h4 className="font-semibold text-slate-900 mb-2">{req.subject}</h4>
                                <p className="text-slate-700 whitespace-pre-wrap text-sm">{req.message}</p>
                              </div>
  
                              {req.status === 'answered' ? (
                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                                  <h4 className="font-semibold text-emerald-900 mb-2 flex items-center">
                                    <Reply className="w-4 h-4 mr-2" />
                                    Administration Reply
                                  </h4>
                                  <p className="text-emerald-800 whitespace-pre-wrap text-sm">{req.reply}</p>
                                </div>
                              ) : (
                                <form onSubmit={handleReply} className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="reply">Your Reply</Label>
                                    <Textarea 
                                      id="reply" 
                                      value={replyText} 
                                      onChange={e => setReplyText(e.target.value)} 
                                      required 
                                      rows={5}
                                      placeholder="Type your response here..."
                                    />
                                  </div>
                                  <DialogFooter className="flex-col sm:flex-row gap-2">
                                    <Button type="button" variant="outline" onClick={() => setSelectedRequest(null)} className="w-full sm:w-auto">Cancel</Button>
                                    <button type="submit" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary px-2.5 py-1.5 text-sm font-medium text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 w-full sm:w-auto transition-colors">
                                      Send Reply
                                    </button>
                                  </DialogFooter>
                                </form>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-1">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Request?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this request from <span className="font-semibold text-slate-900">{req.studentName}</span>? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(req.id)} className="bg-red-600 hover:bg-red-700">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
