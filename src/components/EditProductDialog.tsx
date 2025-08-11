import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import type { Product, Category, ProductSource } from '@/types';

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateProduct: (product: Product) => void;
  product: Product | null;
  categories: Category[];
}

interface SourceFormData {
  id: string;
  sourceName: string;
  price: number;
  startDate: string;
  endDate: string;
  alertsEnabled: boolean;
  isOffer: boolean;
}

export const EditProductDialog: React.FC<EditProductDialogProps> = ({
  open,
  onOpenChange,
  onUpdateProduct,
  product,
  categories,
}) => {
  const [formData, setFormData] = useState({
    productName: '',
    categoryId: undefined as string | undefined,
    sources: [] as SourceFormData[],
    isArchived: false,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName,
        categoryId: product.categoryId ? String(product.categoryId) : undefined,
        sources: product.sources.map(source => ({
          id: source.id,
          sourceName: source.sourceName || source.name,
          price: source.price,
          startDate: source.startDate ? source.startDate.split('T')[0] : '',
          endDate: source.endDate ? source.endDate.split('T')[0] : '',
          alertsEnabled: source.alertsEnabled || false,
          isOffer: source.isOffer || false,
        })),
        isArchived: product.isArchived || false,
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName || formData.sources.length === 0 || !product) {
      return;
    }
    onUpdateProduct({
      ...product,
      productName: formData.productName,
      categoryId: formData.categoryId,
      sources: formData.sources.map(source => ({
        id: source.id, name: source.sourceName, url: '', sourceName: source.sourceName,
        price: source.price, startDate: source.startDate,
        endDate: source.endDate, alertsEnabled: source.alertsEnabled, isOffer: source.isOffer,
      })),
      isArchived: formData.isArchived,
    });
    onOpenChange(false);
  };
  
  const addSource = () => {
    setFormData(prev => ({
      ...prev,
      sources: [...prev.sources, {
        id: '', sourceName: '', price: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        alertsEnabled: true, isOffer: false,
      }]
    }));
  };

  const removeSource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index)
    }));
  };

  const updateSource = (index: number, field: keyof SourceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources.map((source, i) => 
        i === index ? { ...source, [field]: value } : source
      )
    }));
  };

  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader><CardTitle>Edit Product</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium mb-2">Product Name</label>
                 <Input value={formData.productName} onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))} required />
               </div>
               <div>
                 <label className="block text-sm font-medium mb-2">Category</label>
                 <Select onValueChange={(value) => setFormData(prev => ({...prev, categoryId: value}))} value={formData.categoryId}>
                   <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                   <SelectContent>
                     {categories.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
                   </SelectContent>
                 </Select>
               </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium">Sources & Pricing</label>
                <Button type="button" onClick={addSource} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> Add Source
                </Button>
              </div>
              
              {formData.sources.map((source, index) => (
                <Card key={index} className="mb-4 p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Source {index + 1}</h4>
                    {formData.sources.length > 1 && (
                      <Button type="button" onClick={() => removeSource(index)} size="sm" variant="ghost" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Source Name</label>
                      <Input value={source.sourceName} onChange={(e) => updateSource(index, 'sourceName', e.target.value)} placeholder="e.g., Amazon" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Price (£)</label>
                      <Input type="number" step="0.01" value={source.price || ''} onChange={(e) => updateSource(index, 'price', parseFloat(e.target.value) || 0)} placeholder="0.00" required />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={source.isOffer} onCheckedChange={(checked) => updateSource(index, 'isOffer', checked)} />
                    <label className="text-sm">Is this an offer?</label>
                  </div>
                  {source.isOffer && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Start Date</label>
                        <Input type="date" value={source.startDate} onChange={(e) => updateSource(index, 'startDate', e.target.value)} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">End Date</label>
                        <Input type="date" value={source.endDate} onChange={(e) => updateSource(index, 'endDate', e.target.value)} required />
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">Update Product</Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};