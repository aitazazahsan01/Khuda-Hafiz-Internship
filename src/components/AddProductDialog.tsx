import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Product, ProductSource, Category } from '@/types';
import { useAuth } from '@/hooks/useAuth'; 

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  categories: Category[];
}

interface SourceFormData {
  sourceName: string;
  price: number;
  startDate: string;
  endDate: string;
  alertsEnabled: boolean;
  isOffer: boolean;
}

export const AddProductDialog: React.FC<AddProductDialogProps> = ({
  open,
  onOpenChange,
  onAddProduct,
  categories,
}) => {
  const { user } = useAuth(); 
  const [productName, setProductName] = useState('');
  const [sources, setSources] = useState<SourceFormData[]>([
    {
      sourceName: '',
      price: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      alertsEnabled: true,
      isOffer: false,
    }
  ]);

  const addSource = () => {
    setSources([...sources, {
      sourceName: '',
      price: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      alertsEnabled: true,
      isOffer: false,
    }]);
  };

  const removeSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };

  const updateSource = (index: number, field: keyof SourceFormData, value: any) => {
    const newSources = [...sources];
    newSources[index] = { ...newSources[index], [field]: value };
    setSources(newSources);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName || sources.some(s => !s.sourceName) || !user) {
      return;
    }

    onAddProduct({
      productName,
      sources: sources.map(source => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: source.sourceName,
        url: '',
        sourceName: source.sourceName,
        price: source.price,
        startDate: source.startDate,
        endDate: source.endDate,
        alertsEnabled: source.alertsEnabled,
        isOffer: source.isOffer,
      })),
      channelStatus: 'not_uploaded',
      createdBy: user.id, 
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Reset form
    setProductName('');
    setSources([{
      sourceName: '',
      price: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      alertsEnabled: true,
      isOffer: false,
    }]);
    
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name</label>
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name (e.g., Wireless Earbuds)"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium">Sources & Pricing</label>
                <Button type="button" onClick={addSource} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              </div>
              
              {sources.map((source, index) => (
                <Card key={index} className="mb-4 border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Source {index + 1}</h4>
                      {sources.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeSource(index)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Source Name</label>
                        <Input
                          value={source.sourceName}
                          onChange={(e) => updateSource(index, 'sourceName', e.target.value)}
                          placeholder="Enter source name (e.g., Tesco, Amazon)"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Price (£)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={source.price || ''}
                          onChange={(e) => updateSource(index, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="Enter price (e.g., 29.99)"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-4 mb-4">
                      <Switch
                        checked={source.isOffer}
                        onCheckedChange={(checked) => updateSource(index, 'isOffer', checked)}
                      />
                      <label className="text-sm font-medium">Is this an offer?</label>
                    </div>
                    
                    {source.isOffer && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Start Date</label>
                          <Input
                            type="date"
                            value={source.startDate}
                            onChange={(e) => updateSource(index, 'startDate', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">End Date</label>
                          <Input
                            type="date"
                            value={source.endDate}
                            onChange={(e) => updateSource(index, 'endDate', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={source.alertsEnabled}
                        onCheckedChange={(checked) => updateSource(index, 'alertsEnabled', checked)}
                      />
                      <label className="text-sm">Enable alerts for this source</label>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Save Product
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};