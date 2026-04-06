import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Sparkles, Plus, Trash2, ExternalLink, Pencil } from 'lucide-react';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type AITool = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  link: string;
};

export default function AIToolsManagement() {
  const { user } = useAuth();
  const [tools, setTools] = useState<AITool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<AITool | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');

  const openEditDialog = (tool: AITool) => {
    setEditingTool(tool);
    setName(tool.name);
    setDescription(tool.description);
    setImageUrl(tool.imageUrl);
    setLink(tool.link);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool) return;
    try {
      const { error } = await supabase
        .from('tools')
        .update({ 
          name, 
          description, 
          url: link,
          icon: imageUrl
        })
        .eq('id', editingTool.id);
      
      if (!error) {
        toast.success('AI Tool updated successfully');
        setIsEditDialogOpen(false);
        setEditingTool(null);
        fetchTools();
      } else {
        toast.error(`Failed to update AI Tool: ${error.message}`);
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const fetchTools = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setTools(data.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        imageUrl: t.icon,
        link: t.url
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('tools')
        .insert([
          { 
            name, 
            description, 
            url: link,
            category: 'General',
            icon: imageUrl
          }
        ]);
      
      if (!error) {
        toast.success('AI Tool added successfully');
        setIsDialogOpen(false);
        setName('');
        setDescription('');
        setImageUrl('');
        setLink('');
        fetchTools();
      } else {
        console.error('Supabase error:', error);
        toast.error(`Failed to add AI Tool: ${error.message}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', id);
      
      if (!error) {
        toast.success('AI Tool deleted');
        fetchTools();
      } else {
        toast.error('Failed to delete AI Tool');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const filteredTools = tools.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            AI Tools Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage the AI study tools displayed on the public page.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Tool
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New AI Tool</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tool Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  placeholder="e.g., Math Solver AI"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  required 
                  rows={3}
                  placeholder="Briefly describe what this tool does..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input 
                  id="imageUrl" 
                  type="url"
                  value={imageUrl} 
                  onChange={e => setImageUrl(e.target.value)} 
                  required 
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link">External Link</Label>
                <Input 
                  id="link" 
                  type="url"
                  value={link} 
                  onChange={e => setLink(e.target.value)} 
                  required 
                  placeholder="https://example.com/tool"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <button type="submit" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-blue-600 px-2.5 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50">
                  Add Tool
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit AI Tool</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tool Name</Label>
                <Input 
                  id="edit-name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  required 
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-link">External Link</Label>
                <Input 
                  id="edit-link" 
                  type="url"
                  value={link} 
                  onChange={e => setLink(e.target.value)} 
                  required 
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <Input 
            placeholder="Search AI tools..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : tools.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed">
          No AI tools found. Add one to get started.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <img src={tool.imageUrl} alt={tool.name} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                    {tool.name}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{tool.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(tool)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the tool.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(tool.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
