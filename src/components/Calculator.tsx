import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator as CalculatorIcon, Package, Truck, Receipt } from 'lucide-react';
import { CalculatorSettings } from '@/types';

interface CalculatorProps {
  settings: CalculatorSettings;
}

const Calculator: React.FC<CalculatorProps> = ({ settings }) => {
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [results, setResults] = useState<{
    totalCost: number;
    platformFee: number;
    vatAmount: number;
    shippingCost: number;
    creatorFee: number;
    suggestedPrice: number;
    profitMargin: number;
  } | null>(null);

  const calculatePricing = () => {
    // --- CHANGED: Added Number() to ensure all settings are treated as numbers ---
    const s = {
        platformCommission: Number(settings.platformCommission),
        vatRate: Number(settings.vatRate),
        shippingThreshold: Number(settings.shippingThreshold),
        shippingFee: Number(settings.shippingFee),
        fullShippingCost: Number(settings.fullShippingCost),
        creatorCommission: Number(settings.creatorCommission),
    };

    const totalPurchaseCost = purchasePrice * quantity;
    const platformFee = (totalPurchaseCost * s.platformCommission) / 100;
    const vatAmount = (totalPurchaseCost * s.vatRate) / 100;
    
    let shippingCost = 0;
    if (totalPurchaseCost < s.shippingThreshold) {
      shippingCost = s.shippingFee;
    } else {
      shippingCost = s.fullShippingCost;
    }
    
    const creatorFee = (totalPurchaseCost * s.creatorCommission) / 100;
    const totalCost = totalPurchaseCost + platformFee + vatAmount + shippingCost + creatorFee;
    const suggestedPrice = totalCost * 1.2;
    const profitMargin = suggestedPrice - totalCost;

    setResults({ totalCost, platformFee, vatAmount, shippingCost, creatorFee, suggestedPrice, profitMargin });
  };

  const resetCalculator = () => {
    setPurchasePrice(0);
    setQuantity(1);
    setResults(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalculatorIcon className="h-5 w-5 mr-2" />
            Price Calculator
          </CardTitle>
          <CardDescription>
            Calculate optimal pricing including all fees and margins
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="purchasePrice">Purchase Price (£)</Label>
                <Input id="purchasePrice" type="number" step="0.01" value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))} placeholder="0.00" />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
              </div>
              <div className="flex space-x-2">
                <Button onClick={calculatePricing} className="flex-1">Calculate</Button>
                <Button variant="outline" onClick={resetCalculator}>Reset</Button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Current Settings</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Platform Commission:</span><Badge variant="secondary">{settings.platformCommission}%</Badge></div>
                <div className="flex justify-between"><span>VAT Rate:</span><Badge variant="secondary">{settings.vatRate}%</Badge></div>
                <div className="flex justify-between"><span>Shipping Threshold:</span><Badge variant="secondary">£{settings.shippingThreshold}</Badge></div>
                <div className="flex justify-between"><span>Shipping Fee:</span><Badge variant="secondary">£{settings.shippingFee}</Badge></div>
                <div className="flex justify-between"><span>Creator Commission:</span><Badge variant="secondary">{settings.creatorCommission}%</Badge></div>
              </div>
            </div>
          </div>

          {/* --- CHANGED: Added this check to prevent rendering when results are null --- */}
          {results && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center"><Receipt className="h-5 w-5 mr-2" />Calculation Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-base flex items-center"><Package className="h-4 w-4 mr-2" />Cost Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Purchase Cost:</span><span className="font-medium">£{(purchasePrice * quantity).toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Platform Fee:</span><span className="font-medium">£{results.platformFee.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>VAT:</span><span className="font-medium">£{results.vatAmount.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Shipping:</span><span className="font-medium">£{results.shippingCost.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Creator Fee:</span><span className="font-medium">£{results.creatorFee.toFixed(2)}</span></div>
                      <Separator />
                      <div className="flex justify-between font-semibold"><span>Total Cost:</span><span>£{results.totalCost.toFixed(2)}</span></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-base flex items-center"><Truck className="h-4 w-4 mr-2" />Pricing Recommendation</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Suggested Price:</span><span className="font-semibold text-green-600">£{results.suggestedPrice.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Profit Margin:</span><span className="font-semibold text-green-600">£{results.profitMargin.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Profit %:</span><span className="font-semibold text-green-600">{((results.profitMargin / results.totalCost) * 100).toFixed(1)}%</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Calculator;