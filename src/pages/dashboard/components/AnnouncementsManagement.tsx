import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Plus, Trash2, Calendar, Eye, AlertTriangle, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

type Announcement = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  seenBy: string[];
};

export default function AnnouncementsManagement() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);
  const [announcementToEdit, setAnnouncementToEdit] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('announcements')
        .insert([
          { 
            title, 
            content,
            author_id: user.id
          }
        ]);
      
      if (!error) {
        toast.success('Announcement created successfully');
        setIsDialogOpen(false);
        setTitle('');
        setContent('');
        fetchAnnouncements();
      } else {
        console.error('Supabase Error:', error);
        toast.error(`Failed: ${error.message || 'unknown error'}`);
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleDelete = async () => {
    if (!announcementToDelete) return;
    
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcementToDelete);
      
      if (!error) {
        toast.success('Announcement deleted');
        fetchAnnouncements();
      } else {
        toast.error('Failed to delete announcement');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setIsDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
    }
  };

  const openEditDialog = (announcement: Announcement) => {
    setAnnouncementToEdit(announcement.id);
    setEditTitle(announcement.title);
    setEditContent(announcement.content);
    setIsEditDialogOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementToEdit) return;
    
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ 
          title: editTitle, 
          content: editContent 
        })
        .eq('id', announcementToEdit);
      
      if (!error) {
        toast.success('Announcement updated successfully');
        setIsEditDialogOpen(false);
        setAnnouncementToEdit(null);
        fetchAnnouncements();
      } else {
        toast.error('Failed to update announcement');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const confirmDelete = (id: string) => {
    setAnnouncementToDelete(id);
    setIsDeleteDialogOpen(true);
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
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage school-wide announcements and track views.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Announcement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                  placeholder="e.g., Upcoming Parent-Teacher Meeting"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea 
                  id="content" 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  required 
                  rows={6}
                  placeholder="Write your announcement here..."
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <button type="submit" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary px-2.5 py-1.5 text-sm font-medium text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 transition-colors">
                  Publish
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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

      <Card className="border-0 shadow-md overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No announcements found. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[40%] min-w-[200px] whitespace-nowrap">Title</TableHead>
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                    <TableHead className="whitespace-nowrap">Seen By (Classes)</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnnouncements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium">
                        <div className="line-clamp-1 min-w-[150px]">{announcement.title}</div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center text-slate-500 text-sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 min-w-[120px]">
                          {announcement.seenBy.length > 0 ? (
                            announcement.seenBy.map(cls => (
                              <Badge key={cls} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
                                <Eye className="h-3 w-3 mr-1" />
                                {cls}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-slate-400 italic">None yet</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(announcement)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 mr-2">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => confirmDelete(announcement.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the announcement
              and remove it from all student dashboards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAnnouncementToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Announcement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input 
                id="edit-title" 
                value={editTitle} 
                onChange={e => setEditTitle(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea 
                id="edit-content" 
                value={editContent} 
                onChange={e => setEditContent(e.target.value)} 
                required 
                rows={6}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <button type="submit" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-blue-600 px-2.5 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50">
                Save Changes
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
