import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Calendar, Clock, ChevronDown, ChevronUp, Archive, ArchiveRestore, Store } from 'lucide-react';
import type { Product, OfferStatus } from '@/types';
import { calculateOfferStatus, calculateDaysRemaining, calculateProgress, getProductStatus, hasOffers } from '@/utils/productUtils';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  canEdit?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  canEdit = true,
}) => {
  const [expanded, setExpanded] = useState(false);
  const productStatus = getProductStatus(product);
  const primarySource = product.sources[0];
  const isRegular = !hasOffers(product);

  const getStatusColor = (status: OfferStatus | 'regular'): string => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'urgent': return 'bg-orange-500';
      case 'expired': return 'bg-red-500';
      case 'regular': return 'bg-gray-500';
    }
  };

  const getStatusText = (status: OfferStatus | 'regular'): string => {
    switch (status) {
      case 'active': return '✅ Active';
      case 'warning': return '⏳ Ending Soon';
      case 'urgent': return '🚨 Urgent';
      case 'expired': return '❌ Expired';
      case 'regular': return '📦 Regular';
    }
  };

  const getBorderColor = (status: OfferStatus | 'regular'): string => {
    switch (status) {
      case 'active': return 'border-l-green-500';
      case 'warning': return 'border-l-yellow-500';
      case 'urgent': return 'border-l-orange-500';
      case 'expired': return 'border-l-red-500';
      case 'regular': return 'border-l-gray-500';
    }
  };

  const getStatusDotColor = (status: OfferStatus | 'regular'): string => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'urgent': return 'bg-orange-500';
      case 'expired': return 'bg-red-500';
      case 'regular': return 'bg-gray-500';
    }
  };

  const renderSourceInfo = (source: any, isExpanded = false, isSecondary = false) => {
    if (!source.isOffer) {
      return (
        <div className={`${isExpanded ? 'border-t border-gray-100 pt-3 mt-3' : ''}`}>
          {isSecondary && (
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Store className="h-3 w-3 text-gray-500" />
                <span className="font-medium text-gray-900 text-sm">{source.sourceName || source.name}</span>
                <div className={`w-2 h-2 rounded-full ${getStatusDotColor('regular')}`}></div>
              </div>
              <span className="text-sm font-semibold text-blue-600">£{source.price.toFixed(2)}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex justify-center">
              <Badge className="bg-gray-100 text-gray-800 border border-gray-200 text-xs">
                Regular Product
              </Badge>
            </div>
          </div>
        </div>
      );
    }

    const status = calculateOfferStatus(source.endDate);
    const daysRemaining = calculateDaysRemaining(source.endDate);
    const progress = calculateProgress(source.startDate, source.endDate);

    return (
      <div className={`${isExpanded ? 'border-t border-gray-100 pt-3 mt-3' : ''}`}>
        {isSecondary && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Store className="h-3 w-3 text-gray-500" />
              <span className="font-medium text-gray-900 text-sm">{source.sourceName || source.name}</span>
              <div className={`w-2 h-2 rounded-full ${getStatusDotColor(status)}`}></div>
            </div>
            <span className="text-sm font-semibold text-blue-600">£{source.price.toFixed(2)}</span>
          </div>
        )}
        
        <div className="space-y-2 sm:space-y-3">
          <Progress 
            value={progress} 
            className="h-1.5 sm:h-2"
          />
          
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-gray-900">
                {daysRemaining < 0 ? 0 : daysRemaining}
              </div>
              <div className="text-xs text-gray-600">
                {daysRemaining === 1 ? 'day' : 'days'} {daysRemaining < 0 ? 'overdue' : 'left'}
              </div>
            </div>
            
            <Badge className={`${getStatusColor(status)} text-white text-xs px-2 py-1`}>
              {getStatusText(status)}
            </Badge>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">{new Date(source.startDate).toLocaleDateString()}</span>
              <span className="sm:hidden">{new Date(source.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">{new Date(source.endDate).toLocaleDateString()}</span>
              <span className="sm:hidden">{new Date(source.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={`bg-white hover:shadow-lg transition-all duration-300 group border-l-4 ${getBorderColor(productStatus)} animate-fade-in ${product.isArchived ? 'opacity-75' : ''}`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2" title={product.productName}>
                {product.productName}
              </h3>
              {product.isArchived && (
                <Badge variant="secondary" className="text-xs shrink-0">Archived</Badge>
              )}
              {isRegular && (
                <Badge className="bg-gray-100 text-gray-700 text-xs shrink-0">Regular</Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Store className="h-3 w-3 text-gray-500 shrink-0" />
                <span className="text-xs sm:text-sm text-gray-600 truncate">
                  {primarySource?.sourceName || primarySource?.name}
                </span>
                <div className={`w-2 h-2 rounded-full shrink-0 ${getStatusDotColor(isRegular ? 'regular' : calculateOfferStatus(primarySource?.endDate))}`}></div>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-blue-600 shrink-0">
                £{primarySource?.price.toFixed(2)}
              </span>
            </div>
            
            {product.sources.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="text-blue-600 hover:text-blue-700 text-xs mt-1 h-auto p-1 -ml-1"
              >
                {product.sources.length} sources
                {expanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
              </Button>
            )}
          </div>
          
          {canEdit && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col sm:flex-row gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-blue-50 hover:text-blue-600"
                onClick={() => onEdit(product)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
              {product.isArchived ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-green-50 hover:text-green-600"
                  onClick={() => onUnarchive(product.id)}
                >
                  <ArchiveRestore className="h-3 w-3" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-orange-50 hover:text-orange-600"
                  onClick={() => onArchive(product.id)}
                >
                  <Archive className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-red-50 hover:text-red-600"
                onClick={() => onDelete(product.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        
        {!product.isArchived && renderSourceInfo(primarySource)}
        
        {expanded && product.sources.slice(1).map((source, index) => (
          <div key={source.id}>
            {!product.isArchived && renderSourceInfo(source, true, true)}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
