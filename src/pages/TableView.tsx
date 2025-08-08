
import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid3x3, Table as TableIcon, Settings, Plus, ArrowUpDown, ArrowUp, ArrowDown, Pencil, Trash2, Archive, ArchiveRestore } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddProductDialog } from '@/components/AddProductDialog';
import { EditProductDialog } from '@/components/EditProductDialog';
import { SettingsDialog } from '@/components/SettingsDialog';
import { Logo } from '@/components/Logo';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import type { Product, OfferStatus, Category } from '@/types';
import { calculateOfferStatus, calculateDaysRemaining, exportToCSV, parseCSV, hasOffers } from '@/utils/productUtils';

type SortField = 'productName' | 'source' | 'startDate' | 'endDate' | 'daysRemaining' | 'status';
type SortDirection = 'asc' | 'desc';

interface CalculatorSettings {
  platformCommission: number;
  vatRate: number;
  shippingThreshold: number;
  shippingFee: number;
  fullShippingCost: number;
}

const TableView = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<OfferStatus | 'all' | 'archived' | 'offer' | 'regular'>('all');
  const [filterSource, setFilterSource] = useState('');
  const [sortField, setSortField] = useState<SortField>('daysRemaining');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [calculatorSettings, setCalculatorSettings] = useState<CalculatorSettings>({
    platformCommission: 9,
    vatRate: 20,
    shippingThreshold: 22,
    shippingFee: 2.29,
    fullShippingCost: 3.99
  });
  const { toast } = useToast();

  useEffect(() => {
    const savedProducts = localStorage.getItem('product-tracker-data');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('product-tracker-data', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('calculator-settings');
    if (savedSettings) {
      setCalculatorSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calculator-settings', JSON.stringify(calculatorSettings));
  }, [calculatorSettings]);

  const getStatusBadge = (status: OfferStatus | 'regular') => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      urgent: 'bg-orange-100 text-orange-800 border-orange-200',
      expired: 'bg-red-100 text-red-800 border-red-200',
      regular: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    
    const text = {
      active: 'Active',
      warning: 'Warning',
      urgent: 'Urgent',
      expired: 'Expired',
      regular: 'Regular',
    };

    return (
      <Badge className={`${colors[status]} border`}>
        {text[status]}
      </Badge>
    );
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Create a flattened list of product-source combinations for table display
  const flattenedData = products.flatMap(product => 
    product.sources.map(source => ({
      productId: product.id,
      productName: product.productName,
      sourceName: source.sourceName,
      price: source.price,
      startDate: source.startDate,
      endDate: source.endDate,
      alertsEnabled: source.alertsEnabled,
      isArchived: product.isArchived,
      isOffer: source.isOffer,
      status: source.isOffer ? calculateOfferStatus(source.endDate) : 'regular' as const,
      daysRemaining: source.isOffer ? calculateDaysRemaining(source.endDate) : 0
    }))
  );

  const uniqueSources = [...new Set(flattenedData.map(item => item.sourceName))].sort();

  const filteredAndSortedData = flattenedData
    .filter(item => {
      const matchesSearch = !searchTerm || 
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sourceName.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesStatus = true;
      if (filterStatus === 'offer') {
        matchesStatus = item.isOffer;
      } else if (filterStatus === 'regular') {
        matchesStatus = !item.isOffer;
      } else if (filterStatus === 'all') {
        matchesStatus = true;
      } else {
        matchesStatus = item.status === filterStatus;
      }
      
      const matchesSource = !filterSource || item.sourceName === filterSource;
      
      return matchesSearch && matchesStatus && matchesSource && !item.isArchived;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'productName':
          aValue = a.productName.toLowerCase();
          bValue = b.productName.toLowerCase();
          break;
        case 'source':
          aValue = a.sourceName.toLowerCase();
          bValue = b.sourceName.toLowerCase();
          break;
        case 'startDate':
          aValue = new Date(a.startDate);
          bValue = new Date(b.startDate);
          break;
        case 'endDate':
          aValue = new Date(a.endDate);
          bValue = new Date(b.endDate);
          break;
        case 'daysRemaining':
          aValue = a.daysRemaining;
          bValue = b.daysRemaining;
          break;
        case 'status':
          const statusOrder = { expired: 0, urgent: 1, warning: 2, active: 3, regular: 4 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setProducts(prev => [...prev, newProduct]);
    toast({
      title: "Product Added",
      description: `${product.productName} has been added to your tracker.`,
    });
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    toast({
      title: "Product Updated",
      description: `${updatedProduct.productName} has been updated successfully.`,
    });
  };

  const deleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setProducts(prev => prev.filter(product => product.id !== productId));
    toast({
      title: "Product Deleted",
      description: `${product?.productName} has been removed from your tracker.`,
    });
  };

  const archiveProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, isArchived: true, archivedDate: new Date().toISOString() }
        : p
    ));
    toast({
      title: "Product Archived",
      description: `${product?.productName} has been archived.`,
    });
  };

  const unarchiveProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, isArchived: false, archivedDate: undefined }
        : p
    ));
    toast({
      title: "Product Unarchived",
      description: `${product?.productName} is now active again.`,
    });
  };

  const handleEditProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setEditingProduct(product);
      setIsEditDialogOpen(true);
    }
  };

  const exportData = () => {
    const csvData = exportToCSV(products);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product-tracker-export.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Data Exported",
      description: "Your products have been exported to CSV successfully.",
    });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const importedProducts = parseCSV(csvText);
        setProducts(prev => [...prev, ...importedProducts]);
        toast({
          title: "Data Imported",
          description: `Successfully imported ${importedProducts.length} products.`,
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import data. Please check your CSV format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <Logo />
              <span className="text-sm text-gray-500">Table View</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Link to="/">
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    <Grid3x3 className="h-4 w-4 mr-2" />
                    Cards
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white shadow-sm"
                >
                  <TableIcon className="h-4 w-4 mr-2" />
                  Table
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsSettingsOpen(true)}
                className="hover:bg-gray-100"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Controls */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Button 
                  onClick={() => setIsAddDialogOpen(true)} 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>

                <div className="flex gap-2 flex-wrap">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as OfferStatus | 'all' | 'archived' | 'offer' | 'regular')}
                    className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Active</option>
                    <option value="offer">Offer Products</option>
                    <option value="regular">Regular Products</option>
                    <option value="active">Active</option>
                    <option value="warning">Warning</option>
                    <option value="urgent">Urgent</option>
                    <option value="expired">Expired</option>
                    <option value="archived">Archived</option>
                  </select>

                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Sources</option>
                    {uniqueSources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products or sources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-72"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('productName')}
                      className="hover:bg-transparent p-0 h-auto font-semibold"
                    >
                      Product Name {getSortIcon('productName')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('source')}
                      className="hover:bg-transparent p-0 h-auto font-semibold"
                    >
                      Source {getSortIcon('source')}
                    </Button>
                  </TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('startDate')}
                      className="hover:bg-transparent p-0 h-auto font-semibold"
                    >
                      Start Date {getSortIcon('startDate')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('endDate')}
                      className="hover:bg-transparent p-0 h-auto font-semibold"
                    >
                      End Date {getSortIcon('endDate')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('daysRemaining')}
                      className="hover:bg-transparent p-0 h-auto font-semibold"
                    >
                      Days Left {getSortIcon('daysRemaining')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('status')}
                      className="hover:bg-transparent p-0 h-auto font-semibold"
                    >
                      Status {getSortIcon('status')}
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.map((item, index) => (
                  <TableRow key={`${item.productId}-${item.sourceName}-${index}`} className={`hover:bg-gray-50 ${item.isArchived ? 'opacity-75' : ''}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {item.productName}
                        {item.isArchived && <Badge variant="secondary" className="text-xs">Archived</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>{item.sourceName}</TableCell>
                    <TableCell>£{item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={item.isOffer ? "default" : "secondary"}>
                        {item.isOffer ? "Offer" : "Regular"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.isOffer ? new Date(item.startDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      {item.isOffer ? new Date(item.endDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      {item.isOffer ? (
                        <span className={`font-medium ${
                          item.daysRemaining < 0 ? 'text-red-600' :
                          item.daysRemaining <= 2 ? 'text-orange-600' :
                          item.daysRemaining <= 5 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {item.daysRemaining < 0 ? '0' : item.daysRemaining} days
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduct(item.productId)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        {item.isArchived ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => unarchiveProduct(item.productId)}
                            className="hover:bg-green-50 hover:text-green-600"
                          >
                            <ArchiveRestore className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => archiveProduct(item.productId)}
                            className="hover:bg-orange-50 hover:text-orange-600"
                          >
                            <Archive className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteProduct(item.productId)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredAndSortedData.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">📊</div>
                <div className="text-gray-600 text-lg mb-4">
                  {searchTerm || filterStatus !== 'all' || filterSource
                    ? 'No products match your current filters'
                    : 'No products yet'}
                </div>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            © All rights reserved. Developed by{' '}
            <a 
              href="https://www.ecoflitz.co.uk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Ecoflitz
            </a>
          </div>
        </div>
      </footer>

      {/* Dialogs */}
      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddProduct={addProduct}
        categories={categories}
      />
      
      <EditProductDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdateProduct={updateProduct}
        product={editingProduct}
      />
      
      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onExport={exportData}
        onImport={importData}
        calculatorSettings={calculatorSettings}
        onCalculatorSettingsChange={setCalculatorSettings}
      />
    </div>
  );
};

export default TableView;
