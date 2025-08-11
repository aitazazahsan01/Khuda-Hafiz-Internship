
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Users, Package, TrendingUp, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';

interface StatsPanelProps {
  products: Product[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ products }) => {
  // Calculate statistics
  const totalProducts = products.length;
  const totalOffers = products.filter(p => p.sources.some(s => s.isOffer)).length;
  const regularProducts = totalProducts - totalOffers;

  // Channel status statistics
  const channelStats = {
    not_uploaded: products.filter(p => p.channelStatus === 'not_uploaded').length,
    tiktok: products.filter(p => p.channelStatus === 'tiktok').length,
    amazon: products.filter(p => p.channelStatus === 'amazon').length,
    ebay: products.filter(p => p.channelStatus === 'ebay').length,
  };

  // User contributions
  const userContributions = products.reduce((acc, product) => {
    const creator = product.creatorName || 'Unknown';
    acc[creator] = (acc[creator] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topContributors = Object.entries(userContributions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Category distribution
  const categoryStats = products.reduce((acc, product) => {
    const category = product.categoryName || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {regularProducts} regular + {totalOffers} offers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOffers}</div>
            <p className="text-xs text-muted-foreground">
              {totalOffers > 0 ? `${((totalOffers / totalProducts) * 100).toFixed(1)}% of total` : 'No offers yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contributors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(userContributions).length}</div>
            <p className="text-xs text-muted-foreground">
              Active contributors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(categoryStats).length}</div>
            <p className="text-xs text-muted-foreground">
              Product categories
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Channel Status</CardTitle>
            <CardDescription>Distribution of products across channels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(channelStats).map(([channel, count]) => {
              const percentage = totalProducts > 0 ? (count / totalProducts) * 100 : 0;
              const channelNames = {
                not_uploaded: 'Not Uploaded',
                tiktok: 'TikTok',
                amazon: 'Amazon',
                ebay: 'eBay'
              };
              
              return (
                <div key={channel} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {channelNames[channel as keyof typeof channelNames]}
                    </span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}% of total products
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
            <CardDescription>Users with most product additions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topContributors.length > 0 ? (
              topContributors.map(([user, count], index) => {
                const percentage = totalProducts > 0 ? (count / totalProducts) * 100 : 0;
                
                return (
                  <div key={user} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        #{index + 1} {user}
                      </span>
                      <Badge variant="secondary">{count} products</Badge>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {percentage.toFixed(1)}% of total products
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No contributors yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Categories</CardTitle>
            <CardDescription>Most used product categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topCategories.length > 0 ? (
              topCategories.map(([category, count], index) => {
                const percentage = totalProducts > 0 ? (count / totalProducts) * 100 : 0;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        #{index + 1} {category}
                      </span>
                      <Badge variant="secondary">{count} products</Badge>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {percentage.toFixed(1)}% of total products
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No categories yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest product additions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {products
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map((product) => (
                <div key={product.id} className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">{product.productName}</div>
                    <div className="text-xs text-muted-foreground">
                      by {product.creatorName || 'Unknown'}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            {products.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No products added yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsPanel;
