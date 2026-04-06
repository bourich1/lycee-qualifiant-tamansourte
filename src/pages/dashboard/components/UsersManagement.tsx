import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Trash2, Shield, User, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

type UserData = {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'student';
  class: string | null;
};

export default function UsersManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'student' | 'super_admin'>('student');
  const [className, setClassName] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setUsers(data.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        class: u.class_name
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          { 
            name, 
            email, 
            password, 
            role, 
            class_name: role === 'student' ? className : null 
          }
        ])
        .select();
      
      if (!error) {
        toast.success('User created successfully');
        setIsDialogOpen(false);
        setName('');
        setEmail('');
        setPassword('');
        setRole('student');
        setClassName('');
        fetchUsers();
      } else {
        toast.error(error.message || 'Failed to create user');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (!error) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error('Failed to delete user: ' + error.message);
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setUserToDelete(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100"><Shield className="w-3 h-3 mr-1" /> Super Admin</Badge>;
      case 'admin':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100"><User className="w-3 h-3 mr-1" /> Admin</Badge>;
      case 'student':
        return <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"><GraduationCap className="w-3 h-3 mr-1" /> Student</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.class && u.class.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const canSee = user?.role === 'super_admin' || u.role !== 'super_admin';
    
    return matchesSearch && matchesRole && canSee;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Users Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage administrators and class representatives.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(v: any) => setRole(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {user?.role === 'super_admin' ? (
                      <>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Administration</SelectItem>
                        <SelectItem value="student">Student Representative</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="admin">Administration</SelectItem>
                        <SelectItem value="student">Student Representative</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {role === 'student' && (
                <div className="space-y-2">
                  <Label htmlFor="className">Class Name</Label>
                  <Input id="className" value={className} onChange={e => setClassName(e.target.value)} required placeholder="e.g., 10A" />
                  <p className="text-xs text-slate-500">Only one representative is allowed per class.</p>
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <button type="submit" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary px-2.5 py-1.5 text-sm font-medium text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 transition-colors">
                  Create User
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <Input 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64"
          />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {user?.role === 'super_admin' && <SelectItem value="super_admin">Super Admin</SelectItem>}
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="student">Student</SelectItem>
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
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Name</TableHead>
                    <TableHead className="whitespace-nowrap">Email</TableHead>
                    <TableHead className="whitespace-nowrap">Role</TableHead>
                    <TableHead className="whitespace-nowrap">Class</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium whitespace-nowrap">{u.name}</TableCell>
                      <TableCell className="text-slate-500 whitespace-nowrap">{u.email}</TableCell>
                      <TableCell className="whitespace-nowrap">{getRoleBadge(u.role)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {u.class ? (
                          <Badge variant="outline" className="font-mono">{u.class}</Badge>
                        ) : (
                          <span className="text-slate-400 italic text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {u.id !== user?.id && (user?.role === 'super_admin' || u.role !== 'super_admin') && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="sm:max-w-[425px]">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the account
                                  for <span className="font-semibold">{u.name}</span> ({u.email}).
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(u.id)}
                                  variant="destructive"
                                >
                                  Delete Account
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
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
