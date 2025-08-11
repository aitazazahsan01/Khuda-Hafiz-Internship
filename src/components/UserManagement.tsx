import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/types';
import { UserPlus, Edit, Trash2, Shield, User, Loader2 } from 'lucide-react';

// --- API Helper Functions ---
const API_BASE_URL = 'http://localhost:3001/api';

const fetchUsers = async (): Promise<UserProfile[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

const addUser = async (userData: any) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create user');
  }
  return response.json();
};

const updateUser = async (userData: Partial<UserProfile>) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/users/${userData.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update user');
  }
  return response.json();
};

const deleteUser = async (userId: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete user');
  }
  return response.json();
};

const UserManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({ email: '', fullName: '', password: '', role: 'user' as 'administrator' | 'user' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, isError, error } = useQuery<UserProfile[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const mutationOptions = {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  };

  const addUserMutation = useMutation({ ...mutationOptions, mutationFn: addUser, 
    onSuccess: () => {
      toast({ title: "Success", description: "User created successfully" });
      closeDialogs();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const updateUserMutation = useMutation({ ...mutationOptions, mutationFn: updateUser,
    onSuccess: () => {
      toast({ title: "Success", description: "User updated successfully" });
      closeDialogs();
    }
  });

  const deleteUserMutation = useMutation({ ...mutationOptions, mutationFn: deleteUser,
    onSuccess: () => {
      toast({ title: "Success", description: "User deleted successfully" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, fullName: formData.fullName, role: formData.role });
    } else {
      addUserMutation.mutate(formData);
    }
  };

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };
  
  const openEditDialog = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({ ...user, password: '' });
  };
  
  const closeDialogs = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData({ email: '', fullName: '', password: '', role: 'user' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}><UserPlus className="h-4 w-4 mr-2" />Add User</Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading users...</p>}
        {isError && <p className="text-red-500">Error fetching users: {error.message}</p>}
        {!isLoading && !isError && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Created</TableHead><TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'administrator' ? 'default' : 'secondary'}>
                      {user.role === 'administrator' ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(user.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen || !!editingUser} onOpenChange={(isOpen) => !isOpen && closeDialogs()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required disabled={!!editingUser} />
                {editingUser && <p className="text-sm text-gray-500 mt-1">Email cannot be changed.</p>}
              </div>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
              </div>
              {!editingUser && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                </div>
              )}
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value: 'administrator' | 'user') => setFormData({ ...formData, role: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialogs}>Cancel</Button>
              <Button type="submit" disabled={addUserMutation.isPending || updateUserMutation.isPending}>
                {(addUserMutation.isPending || updateUserMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserManagement;