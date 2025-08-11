
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Product, Category } from '@/types';

interface AddOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddOffer: (offer: Omit<Product, 'id'>) => void;
  categories: Category[];
}

export const AddOfferDialog: React.FC<AddOfferDialogProps> = ({
  open,
  onOpenChange,
  onAddOffer,
  categories,
}) => {
  const [formData, setFormData] = useState({
    productName: '',
    sourceName: '',
    price: 0,
    startDate: new Date(),
    endDate: new Date(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productName || !formData.sourceName) {
      return;
    }

    onAddOffer({
      productName: formData.productName,
      sources: [{
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: formData.sourceName,
        url: '',
        sourceName: formData.sourceName,
        price: formData.price,
        startDate: formData.startDate.toISOString().split('T')[0],
        endDate: formData.endDate.toISOString().split('T')[0],
        alertsEnabled: true,
        isOffer: true,
      }],
      channelStatus: 'not_uploaded',
      createdBy: '',
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Reset form
    setFormData({
      productName: '',
      sourceName: '',
      price: 0,
      startDate: new Date(),
      endDate: new Date(),
    });
    
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold">Add New Product</CardTitle>
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
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Source</label>
              <Input
                value={formData.sourceName}
                onChange={(e) => setFormData(prev => ({ ...prev, sourceName: e.target.value }))}
                placeholder="e.g., AliExpress, Amazon, TikTok Shop"
                required
                className="border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Price (£)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                required
                className="border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-gray-200 hover:bg-gray-50",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-gray-200 hover:bg-gray-50",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Save Product
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
