
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import type { Product } from '@/types';

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateProduct: (product: Product) => void;
  product: Product | null;
}

interface SourceFormData {
  id: string;
  sourceName: string;
  price: number;
  startDate: Date;
  endDate: Date;
  alertsEnabled: boolean;
  isOffer: boolean;
}

export const EditProductDialog: React.FC<EditProductDialogProps> = ({
  open,
  onOpenChange,
  onUpdateProduct,
  product,
}) => {
  const [formData, setFormData] = useState({
    productName: '',
    sources: [] as SourceFormData[],
    isArchived: false,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName,
        sources: product.sources.map(source => ({
          id: source.id,
          sourceName: source.sourceName || source.name,
          price: source.price,
          startDate: source.startDate ? new Date(source.startDate) : new Date(),
          endDate: source.endDate ? new Date(source.endDate) : new Date(),
          alertsEnabled: source.alertsEnabled || false,
          isOffer: source.isOffer || false,
        })),
        isArchived: product.isArchived || false,
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productName || formData.sources.length === 0) {
      return;
    }

    if (!product) return;

    onUpdateProduct({
      ...product,
      productName: formData.productName,
      sources: formData.sources.map(source => ({
        id: source.id,
        name: source.sourceName,
        url: '',
        sourceName: source.sourceName,
        price: source.price,
        startDate: source.startDate.toISOString().split('T')[0],
        endDate: source.endDate.toISOString().split('T')[0],
        alertsEnabled: source.alertsEnabled,
        isOffer: source.isOffer,
      })),
      isArchived: formData.isArchived,
    });

    onOpenChange(false);
  };

  const addSource = () => {
    setFormData(prev => ({
      ...prev,
      sources: [...prev.sources, {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        sourceName: '',
        price: 0,
        startDate: new Date(),
        endDate: new Date(),
        alertsEnabled: true,
        isOffer: false,
      }]
    }));
  };

  const removeSource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index)
    }));
  };

  const updateSource = (index: number, field: string, value: any) => {
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
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold">Edit Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Product Name</label>
              <Input
                value={formData.productName}
                onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                placeholder="e.g., Wireless Earbuds"
                required
                className="border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="archived"
                checked={formData.isArchived}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isArchived: checked }))}
              />
              <label htmlFor="archived" className="text-sm font-medium text-gray-700">
                {formData.isArchived ? 'Archived' : 'Active'}
              </label>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">Sources</label>
                <Button type="button" onClick={addSource} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Source
                </Button>
              </div>

              {formData.sources.map((source, index) => (
                <div key={source.id || index} className="border rounded-lg p-4 mb-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Source {index + 1}</h4>
                    {formData.sources.length > 1 && (
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

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Source Name</label>
                      <Input
                        value={source.sourceName}
                        onChange={(e) => updateSource(index, 'sourceName', e.target.value)}
                        placeholder="e.g., Amazon"
                        required
                        className="border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Price (£)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={source.price}
                        onChange={(e) => updateSource(index, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        required
                        className="border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`isOffer-${index}`}
                      checked={source.isOffer}
                      onCheckedChange={(checked) => updateSource(index, 'isOffer', checked)}
                    />
                    <label htmlFor={`isOffer-${index}`} className="text-sm font-medium text-gray-700">
                      Is Offer?
                    </label>
                  </div>

                  {source.isOffer && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Start Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {format(source.startDate, "PPP")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={source.startDate}
                              onSelect={(date) => date && updateSource(index, 'startDate', date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">End Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {format(source.endDate, "PPP")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={source.endDate}
                              onSelect={(date) => date && updateSource(index, 'endDate', date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`alerts-${index}`}
                      checked={source.alertsEnabled}
                      onCheckedChange={(checked) => updateSource(index, 'alertsEnabled', checked)}
                    />
                    <label htmlFor={`alerts-${index}`} className="text-sm text-gray-700">
                      Enable alerts for this source
                    </label>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Update Product
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="border-gray-200 hover:bg-gray-50"
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
