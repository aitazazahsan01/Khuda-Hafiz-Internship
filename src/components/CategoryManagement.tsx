import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/types';
import { Plus, Edit, Trash2, FolderPlus, Loader2 } from 'lucide-react';

// --- API Helper Functions ---
const API_BASE_URL = 'http://localhost:3001/api';

const fetchCategories = async (): Promise<Category[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/categories`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
};

const addCategory = async (categoryData: { name: string, description?: string }) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(categoryData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create category');
  }
  return response.json();
};

const updateCategory = async (categoryData: Category) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/categories/${categoryData.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(categoryData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update category');
  }
  return response.json();
};

const deleteCategory = async (categoryId: number | string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete category');
  }
  return response.json();
};

const CategoryManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, isError, error } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const mutationOptions = {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  };

  const addCategoryMutation = useMutation({
    ...mutationOptions,
    mutationFn: addCategory,
    onSuccess: () => {
      toast({ title: "Success", description: "Category created successfully" });
      closeDialogs();
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  const updateCategoryMutation = useMutation({
    ...mutationOptions,
    mutationFn: updateCategory,
    onSuccess: () => {
      toast({ title: "Success", description: "Category updated successfully" });
      closeDialogs();
    }
  });

  const deleteCategoryMutation = useMutation({
    ...mutationOptions,
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast({ title: "Success", description: "Category deleted successfully" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategoryMutation.mutate({ ...editingCategory, ...formData });
    } else {
      addCategoryMutation.mutate(formData);
    }
  };

  const handleDelete = (categoryId: number | string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setIsDialogOpen(true);
  };

  const closeDialogs = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Category Management</CardTitle>
            <CardDescription>Organize your products with categories</CardDescription>
          </div>
          <Button onClick={openAddDialog}><Plus className="h-4 w-4 mr-2" />Add Category</Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading categories...</p>}
        {isError && <p className="text-red-500">Error: {error.message}</p>}
        {!isLoading && !isError && categories.length === 0 && (
          <div className="text-center py-8">
            <FolderPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No categories yet</h3>
            <Button className="mt-4" onClick={openAddDialog}><Plus className="h-4 w-4 mr-2" />Add Category</Button>
          </div>
        )}
        {!isLoading && !isError && categories.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead>Created</TableHead><TableHead>Actions</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description || 'N/A'}</TableCell>
                  <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(category)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(category.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialogs}>Cancel</Button>
              <Button type="submit" disabled={addCategoryMutation.isPending || updateCategoryMutation.isPending}>
                {(addCategoryMutation.isPending || updateCategoryMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CategoryManagement;