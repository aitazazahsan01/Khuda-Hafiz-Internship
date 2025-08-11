import type { Product, ProductSource, OfferStatus } from '@/types';

export const calculateOfferStatus = (endDate: string): OfferStatus => {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 2) return 'urgent';
  if (diffDays <= 5) return 'warning';
  return 'active';
};

export const calculateDaysRemaining = (endDate: string): number => {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateProgress = (startDate: string, endDate: string): number => {
  const now = new Date().getTime();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  
  if (now < start) return 0;
  if (now > end) return 100;
  
  return ((now - start) / (end - start)) * 100;
};

export const getProductStatus = (product: Product): OfferStatus | 'regular' => {
  // CHANGED: Added (product.sources || []) for safety
  const offerSources = (product.sources || []).filter(source => source.isOffer);
  
  if (offerSources.length === 0) {
    return 'regular';
  }
  
  const statuses = offerSources.map(source => calculateOfferStatus(source.endDate));
  
  // Return the most urgent status
  if (statuses.includes('expired')) return 'expired';
  if (statuses.includes('urgent')) return 'urgent';
  if (statuses.includes('warning')) return 'warning';
  return 'active';
};

export const hasOffers = (product: Product): boolean => {
  // CHANGED: Added (product.sources || []) for safety
  return (product.sources || []).some(source => source.isOffer);
};

export const exportToCSV = (products: Product[]): string => {
  const headers = ['Product Name', 'Source Name', 'Price', 'Start Date', 'End Date', 'Alerts Enabled', 'Is Archived', 'Is Offer'];
  const rows = [headers.join(',')];
  
  products.forEach(product => {
    // CHANGED: Added (product.sources || []) for safety
    (product.sources || []).forEach(source => {
      const row = [
        `"${product.productName}"`,
        `"${source.sourceName || source.name}"`,
        source.price.toString(),
        source.isOffer ? source.startDate : '',
        source.isOffer ? source.endDate : '',
        source.alertsEnabled?.toString() || 'false',
        product.isArchived?.toString() || 'false',
        source.isOffer?.toString() || 'false'
      ];
      rows.push(row.join(','));
    });
  });
  
  return rows.join('\n');
};

export const parseCSV = (csvText: string): Product[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
  const products: { [key: string]: Product } = {};
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
    const productName = values[0];
    
    if (!products[productName]) {
      products[productName] = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        productName,
        sources: [],
        channelStatus: 'not_uploaded',
        createdBy: '',
        isArchived: values[6] === 'true',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    
    const isOffer = values[7] === 'true';
    const source: ProductSource = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: values[1],
      url: '',
      sourceName: values[1],
      price: parseFloat(values[2]) || 0,
      startDate: isOffer ? values[3] : new Date().toISOString().split('T')[0],
      endDate: isOffer ? values[4] : new Date().toISOString().split('T')[0],
      alertsEnabled: values[5] === 'true',
      isOffer: isOffer
    };
    
    products[productName].sources.push(source);
  }
  
  return Object.values(products);
};

export const getSourceDistribution = (products: Product[]) => {
  const distribution: { [key: string]: number } = {};
  
  products.forEach(product => {
    // CHANGED: Added (product.sources || []) for safety
    (product.sources || []).forEach(source => {
      const sourceName = source.sourceName || source.name;
      distribution[sourceName] = (distribution[sourceName] || 0) + 1;
    });
  });
  
  return distribution;
};

export const getStatusCounts = (products: Product[]) => {
  const counts = {
    active: 0,
    warning: 0,
    urgent: 0,
    expired: 0,
    regular: 0,
  };
  
  products.forEach(product => {
    if (!product.isArchived) {
      const status = getProductStatus(product);
      counts[status]++;
    }
  });
  
  return counts;
};