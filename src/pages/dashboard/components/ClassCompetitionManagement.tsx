import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Award, Plus, History, Settings, UserCircle, CheckCircle2, LayoutGrid, Trash2, Trophy, Users, BarChart3 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { formatDistanceToNow, parseISO } from 'date-fns';

type Section = { 
  id: number; 
  name: string; 
  total_score: number;
  best_student_name: string | null;
  updated_at: string;
};

const getAbbr = (name: string) => {
  const words = name.split(/[\s-]+/);
  if (words.length === 1) return name.slice(0, 3).toUpperCase();
  return words.map(w => w[0]).join('').toUpperCase().slice(0, 3);
};

const getColor = (name: string) => {
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 
    'bg-amber-500', 'bg-rose-500', 'bg-indigo-500',
    'bg-cyan-500', 'bg-orange-500'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function ClassCompetitionManagement() {
  const { user } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [recentScores, setRecentScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openAddClass, setOpenAddClass] = useState(false);
  const [openAwardPoints, setOpenAwardPoints] = useState(false);

  // Class Setup Form
  const [className, setClassName] = useState('');
  const [initialPoints, setInitialPoints] = useState('0');
  const [bestStudentName, setBestStudentName] = useState('');

  // Point Award Form
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [points, setPoints] = useState<string>('0');
  const [reason, setReason] = useState('');

  const fetchData = async () => {
    const [sectionsRes, scoresRes] = await Promise.all([
      supabase.from('competition_sections').select('*').order('total_score', { ascending: false }),
      supabase.from('competition_scores')
        .select(`
          id, points, reason, created_at,
          competition_sections(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    if (!sectionsRes.error) setSections(sectionsRes.data);
    if (!scoresRes.error) setRecentScores(scoresRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('competition_sections').insert([
        {
          name: className.trim(),
          total_score: parseInt(initialPoints) || 0,
          best_student_name: bestStudentName || null
        }
      ]);

      if (error) throw error;
      toast.success('Class registered!');
      setClassName('');
      setInitialPoints('0');
      setBestStudentName('');
      setOpenAddClass(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAwardPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedSection || !points || !reason.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('competition_scores').insert([
        {
          section_id: parseInt(selectedSection),
          points: parseInt(points),
          reason: reason.trim(),
          recorded_by: user.id
        }
      ]);

      if (error) throw error;

      toast.success('Points awarded!');
      setPoints('0');
      setReason('');
      setOpenAwardPoints(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (id: number) => {
    const { error } = await supabase.from('competition_sections').delete().eq('id', id);
    if (!error) {
      toast.success('Class deleted');
      fetchData();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header with Hero Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl shadow-sm border">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Competition Hub</h1>
          <p className="text-slate-500 font-medium italic">Manage classes, award points, and track rankings live.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Add Class Dialog */}
          <Dialog open={openAddClass} onOpenChange={setOpenAddClass}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 font-bold px-8 shadow-lg shadow-slate-200">
                <Plus className="h-5 w-5 mr-2" /> Add New Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Register New Class</DialogTitle>
                <DialogDescription>Setup a new section to participate in the competition.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateClass} className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Class Name</Label>
                    <Input placeholder="e.g. 2ème Bac Science" value={className} onChange={e => setClassName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Starting Points</Label>
                    <Input type="number" value={initialPoints} onChange={e => setInitialPoints(e.target.value)} />
                  </div>
                  <div className="pt-2 border-t border-dashed">
                    <p className="text-xs font-black text-primary mb-3 uppercase tracking-widest">Nominations</p>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Best Student Name</Label>
                        <Input placeholder="Full Name" value={bestStudentName} onChange={e => setBestStudentName(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full font-bold h-12" disabled={loading}>
                    Create Class Now
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Award Points Dialog */}
          <Dialog open={openAwardPoints} onOpenChange={setOpenAwardPoints}>
            <DialogTrigger asChild>
              <Button size="lg" variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 shadow-lg shadow-primary/20">
                <Trophy className="h-5 w-5 mr-2" /> Award Points
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-primary">Award Points Ceremony</DialogTitle>
                <DialogDescription>Acknowledge achievements by adding points with a reason.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAwardPoints} className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Target Class Section</Label>
                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                      <SelectTrigger><SelectValue placeholder="Choose a class" /></SelectTrigger>
                      <SelectContent className="bg-white">
                        {sections.map(s => (
                          <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Points to Add</Label>
                    <Input type="number" value={points} onChange={e => setPoints(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason / Accomplishment</Label>
                    <Textarea 
                      placeholder="Why are they receiving points?" 
                      value={reason} 
                      onChange={e => setReason(e.target.value)}
                      className="h-28"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full font-bold h-12" disabled={loading || !selectedSection}>
                    Submit Official Award
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl"><Users className="h-6 w-6 text-primary" /></div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Active Classes</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{sections.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-2xl"><BarChart3 className="h-6 w-6 text-emerald-600" /></div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Total Points</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">
                {sections.reduce((acc, curr) => acc + curr.total_score, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-2xl"><Award className="h-6 w-6 text-amber-600" /></div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Last Award</p>
              <p className="text-xl font-bold text-slate-900 truncate max-w-[150px]">
                {recentScores[0] ? recentScores[0].reason : 'No data'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Standings */}
        <Card className="lg:col-span-2 border-0 shadow-sm overflow-hidden bg-white">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg font-bold flex items-center justify-between">
              <span className="flex items-center gap-2 uppercase tracking-tighter">
                <LayoutGrid className="h-5 w-5 text-slate-900" /> Official Ranking Standings
              </span>
              <Badge className="bg-emerald-500 hover:bg-emerald-500">LIVE</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/30 text-xs">
                <TableRow>
                  <TableHead className="w-16 text-center">Pos</TableHead>
                  <TableHead>Class Name</TableHead>
                  <TableHead className="hidden md:table-cell">Best Student</TableHead>
                  <TableHead className="text-right pr-8">Total Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((s, idx) => (
                  <TableRow key={s.id} className="group hover:bg-slate-50/50 transition-colors h-16">
                    <TableCell className="text-center font-black text-slate-400">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-sm ${getColor(s.name)}`}>
                          {getAbbr(s.name)}
                        </div>
                        <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{s.name}</span>
                        {idx === 0 && <Trophy className="h-4 w-4 text-amber-400 fill-amber-400" />}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {s.best_student_name ? (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <UserCircle className="h-4 w-4 text-primary/40" />
                          <span>{s.best_student_name}</span>
                        </div>
                      ) : <span className="text-xs text-slate-300 italic">None</span>}
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-xl font-black text-slate-900">{s.total_score}</span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-1">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Class: {s.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the class and all its points history.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteSection(s.id)} className="bg-red-600 hover:bg-red-700 text-white">
                                Delete Class
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Global Feed */}
        <Card className="border-0 shadow-sm overflow-hidden bg-white">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg font-bold flex items-center gap-2 uppercase tracking-tighter">
              <History className="h-5 w-5 text-slate-900" /> Recent Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {recentScores.length === 0 ? (
                <div className="p-12 text-center text-slate-400 italic text-sm">No activity recorded.</div>
              ) : recentScores.map(score => (
                <div key={score.id} className="p-4 hover:bg-slate-50/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-slate-900 uppercase tracking-tighter">{score.competition_sections?.name}</span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] h-5">
                      +{score.points} PTS
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2 line-clamp-2 italic">"{score.reason}"</p>
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                    <History className="h-3 w-3" /> {formatDistanceToNow(parseISO(score.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
