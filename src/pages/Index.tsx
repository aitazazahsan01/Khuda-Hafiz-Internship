import React, { useState, useEffect } from 'react';
import { Plus, Users, Settings, BarChart3, Package, ShoppingCart, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AddProductDialog } from '@/components/AddProductDialog';
import { AddOfferDialog } from '@/components/AddOfferDialog';
import { ProductCard } from '@/components/ProductCard';
import { EditProductDialog } from '@/components/EditProductDialog';
import { SettingsDialog } from '@/components/SettingsDialog';
import UserManagement from '@/components/UserManagement';
import CategoryManagement from '@/components/CategoryManagement';
import Calculator from '@/components/Calculator';
import StatsPanel from '@/components/StatsPanel';
import { Product, CalculatorSettings, Category } from '@/types';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [calculatorSettings, setCalculatorSettings] = useState<CalculatorSettings | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const { user, profile, logout, isAdmin } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchCalculatorSettings(),
        fetchCategories()
      ]);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to load data: " + error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      const allProducts: Product[] = await response.json();
      const cleanedProducts = allProducts.map(product => ({...product, sources: product.sources || [] }));
      const regularProducts = cleanedProducts.filter(p => !p.sources.some(s => s.isOffer));
      const offerProducts = cleanedProducts.filter(p => p.sources.some(s => s.isOffer));
      setProducts(regularProducts);
      setOffers(offerProducts);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch products: " + error.message, variant: "destructive" });
    }
  };
  
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const fetchCalculatorSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/settings/calculator', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch calculator settings');
      const settings = await response.json();
      setCalculatorSettings(settings);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSettingsUpdate = async (newSettings: CalculatorSettings) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/settings/calculator', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update settings');
      }
      toast({ title: "Success", description: "Calculator settings updated" });
      await fetchCalculatorSettings();
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to update settings: ${error.message}`, variant: "destructive" });
    }
  };

  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    if (!user) return;
    const submissionData = { 
      productName: productData.productName, 
      sources: productData.sources, 
      userId: user.id,
      categoryId: productData.categoryId 
    };
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(submissionData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add product');
      }
      await fetchProducts();
      setIsAddProductOpen(false);
      toast({ title: "Success", description: "Product added successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to add product: " + error.message, variant: "destructive" });
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          productName: updatedProduct.productName, 
          sources: updatedProduct.sources,
          categoryId: updatedProduct.categoryId
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update product');
      }
      await fetchProducts();
      setIsEditDialogOpen(false);
      toast({ title: "Success", description: "Product updated successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to update product: " + error.message, variant: "destructive" });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete product');
      }
      toast({ title: "Success", description: "Product deleted successfully" });
      await fetchProducts();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete product: " + error.message, variant: "destructive" });
    }
  };

  const updateArchiveStatus = async (productId: string, isArchived: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/products/${productId}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isArchived }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update status');
      }
      const successMessage = `Product ${isArchived ? 'archived' : 'unarchived'} successfully`;
      toast({ title: "Success", description: successMessage });
      await fetchProducts();
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to update status: ${error.message}`, variant: "destructive" });
    }
  };
  
  const handleArchiveProduct = (productId: string) => updateArchiveStatus(productId, true);
  const handleUnarchiveProduct = (productId: string) => updateArchiveStatus(productId, false);

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleLogout = async () => { await logout(); };
  const handleAddOffer = (offerData: Omit<Product, 'id'>) => handleAddProduct(offerData);

  if (loading) { return <div>Loading...</div>; }

  const renderProductCard = (product: Product) => (
    <ProductCard
      key={product.id}
      product={product}
      onEdit={() => openEditDialog(product)}
      onDelete={handleDeleteProduct}
      onArchive={handleArchiveProduct}
      onUnarchive={handleUnarchiveProduct}
      canEdit={isAdmin() || product.createdBy === user?.id}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">ProductTracker</h1>
            <p className="text-gray-600">Welcome back, {profile?.fullName || user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="products"><Package className="h-4 w-4 mr-2" />Products</TabsTrigger>
            <TabsTrigger value="offers"><ShoppingCart className="h-4 w-4 mr-2" />Offers</TabsTrigger>
            <TabsTrigger value="calculator"><FileText className="h-4 w-4 mr-2" />Calculator</TabsTrigger>
            <TabsTrigger value="stats"><BarChart3 className="h-4 w-4 mr-2" />Stats</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            {isAdmin() && (<TabsTrigger value="admin"><Users className="h-4 w-4 mr-2" />Admin</TabsTrigger>)}
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-semibold">Products</h2><Button onClick={() => setIsAddProductOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Product</Button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{products.map(renderProductCard)}</div>
          </TabsContent>

          <TabsContent value="offers" className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-semibold">Offers</h2><Button onClick={() => setIsAddOfferOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Offer</Button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{offers.map(renderProductCard)}</div>
          </TabsContent>

          <TabsContent value="calculator">
            {calculatorSettings ? (<Calculator settings={calculatorSettings} />) : (<Card><CardContent className="text-center py-12"><p>Could not load calculator settings.</p></CardContent></Card>)}
          </TabsContent>
          
          <TabsContent value="stats"><StatsPanel products={[...products, ...offers]} /></TabsContent>
          <TabsContent value="categories"><CategoryManagement /></TabsContent>
          {isAdmin() && (<TabsContent value="admin"><UserManagement /></TabsContent>)}
        </Tabs>

        <AddProductDialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen} onAddProduct={handleAddProduct} categories={categories} />
        <AddOfferDialog open={isAddOfferOpen} onOpenChange={setIsAddOfferOpen} onAddOffer={handleAddOffer} categories={categories} />
        <EditProductDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} onUpdateProduct={handleUpdateProduct} product={editingProduct} categories={categories} />
        {isAdmin() && calculatorSettings && (
          <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} onExport={() => {}} onImport={() => {}} calculatorSettings={calculatorSettings} onCalculatorSettingsChange={handleSettingsUpdate} />
        )}
      </div>
    </div>
  );
};

export default Index;