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
import { OfferCard } from '@/components/OfferCard';
import Calculator from '@/components/Calculator';
import StatsPanel from '@/components/StatsPanel';
import { SettingsDialog } from '@/components/SettingsDialog';
import UserManagement from '@/components/UserManagement';
import CategoryManagement from '@/components/CategoryManagement';
import { Product, ProductSource, CalculatorSettings, Category, UserProfile } from '@/types';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [calculatorSettings, setCalculatorSettings] = useState<CalculatorSettings | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
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
      await fetchProducts();
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const allProducts: Product[] = await response.json();

      const regularProducts = allProducts.filter(p => 
        !p.sources.some(s => s.isOffer)
      );
      const offerProducts = allProducts.filter(p => 
        p.sources.some(s => s.isOffer)
      );

      setProducts(regularProducts);
      setOffers(offerProducts);

    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products: " + error.message,
        variant: "destructive",
      });
    }
  };

  
  const fetchCategories = async () => {
    console.log("fetchCategories needs to be migrated.");
    setCategories([]); 
  };
  
  
  const fetchCalculatorSettings = async () => {
    console.log("fetchCalculatorSettings needs to be migrated.");
    setCalculatorSettings(null);
  };

    const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    
    const submissionData = {
      productName: productData.productName,
      sources: productData.sources,
      userId: user.id,
    };

    try {
      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add product');
      }

      await fetchProducts(); // Refresh the product list
      setIsAddProductOpen(false);
      toast({
        title: "Success",
        description: "Product added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add product: " + error.message,
        variant: "destructive",
      });
    }
  };

  
  const handleAddOffer = (offerData: Omit<Product, 'id'>) => handleAddProduct(offerData);

  
  const handleUpdateProduct = async (updatedProduct: Product) => {
    alert('Update feature needs to be migrated to the new API.');
  };

  const handleDeleteProduct = async (productId: string) => {
    alert('Delete feature needs to be migrated to the new API.');
  };

  const handleArchiveProduct = async (productId: string) => {
    alert('Archive feature needs to be migrated to the new API.');
  };
  
  const handleSettingsUpdate = async () => {
    alert('Settings update needs to be migrated to the new API.');
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {}
      </div>
    );
  }

  const renderProductCard = (product: Product) => (
    <ProductCard
      key={product.id}
      product={product}
      onEdit={handleUpdateProduct}
      onDelete={handleDeleteProduct}
      onArchive={handleArchiveProduct}
      onUnarchive={handleArchiveProduct} 
      canEdit={isAdmin() || product.createdBy === user?.id}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ProductTracker</h1>
            <p className="text-gray-600">Welcome back, {profile?.fullName || user?.email}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
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

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Products</h2>
              <Button onClick={() => setIsAddProductOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Product</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(renderProductCard)}
            </div>
            {products.length === 0 && !loading && (
              <Card><CardContent className="text-center py-12">No products found.</CardContent></Card>
            )}
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Offers</h2>
              <Button onClick={() => setIsAddOfferOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Offer</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map(renderProductCard)}
            </div>
            {offers.length === 0 && !loading && (
              <Card><CardContent className="text-center py-12">No offers found.</CardContent></Card>
            )}
          </TabsContent>

          {/* Other Tabs */}
          <TabsContent value="calculator">
            <h2 className="text-2xl font-semibold">Price Calculator</h2>
            <p>This feature will be migrated soon.</p>
          </TabsContent>
          <TabsContent value="stats">
             <h2 className="text-2xl font-semibold">Statistics</h2>
            <p>This feature will be migrated soon.</p>
          </TabsContent>
          <TabsContent value="categories">
            <h2 className="text-2xl font-semibold">Categories</h2>
            <p>This feature will be migrated soon.</p>
          </TabsContent>
          {isAdmin() && (<TabsContent value="admin"><UserManagement /></TabsContent>)}
        </Tabs>

        {/* Dialogs */}
        <AddProductDialog
          open={isAddProductOpen}
          onOpenChange={setIsAddProductOpen}
          onAddProduct={handleAddProduct}
          categories={categories}
        />
        <AddOfferDialog
          open={isAddOfferOpen}
          onOpenChange={setIsAddOfferOpen}
          onAddOffer={handleAddOffer}
          categories={categories}
        />
        {isAdmin() && (
          <SettingsDialog
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            onExport={() => {}} onImport={() => {}}
            calculatorSettings={calculatorSettings!}
            onCalculatorSettingsChange={handleSettingsUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default Index;