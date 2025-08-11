
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Upload, Calculator, Settings } from 'lucide-react';

interface CalculatorSettings {
  platformCommission: number;
  vatRate: number;
  shippingThreshold: number;
  shippingFee: number;
  fullShippingCost: number;
}

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  calculatorSettings: CalculatorSettings;
  onCalculatorSettingsChange: (settings: CalculatorSettings) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
  onExport,
  onImport,
  calculatorSettings,
  onCalculatorSettingsChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localSettings, setLocalSettings] = useState<CalculatorSettings>(calculatorSettings);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleSettingChange = (key: keyof CalculatorSettings, value: number) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onCalculatorSettingsChange(newSettings);
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      platformCommission: 9,
      vatRate: 20,
      shippingThreshold: 22,
      shippingFee: 2.29,
      fullShippingCost: 3.99
    };
    setLocalSettings(defaultSettings);
    onCalculatorSettingsChange(defaultSettings);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings & Data Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="data" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Data
              </TabsTrigger>
              <TabsTrigger value="calculator" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Calculator
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="data" className="space-y-4 mt-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Data Export/Import</h3>
                <div className="space-y-3">
                  <Button 
                    onClick={onExport}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export to CSV
                  </Button>
                  <Button 
                    onClick={handleImportClick}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Import from CSV
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={onImport}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  CSV format supports multiple sources per product with pricing information.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="calculator" className="space-y-4 mt-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">Calculator Settings</h3>
                  <Button 
                    onClick={resetToDefaults}
                    variant="outline" 
                    size="sm"
                  >
                    Reset to Defaults
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platformCommission">Platform Commission (%)</Label>
                    <Input
                      id="platformCommission"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={localSettings.platformCommission}
                      onChange={(e) => handleSettingChange('platformCommission', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vatRate">VAT Rate (%)</Label>
                    <Input
                      id="vatRate"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={localSettings.vatRate}
                      onChange={(e) => handleSettingChange('vatRate', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingThreshold">Shipping Threshold (£)</Label>
                    <Input
                      id="shippingThreshold"
                      type="number"
                      step="0.01"
                      min="0"
                      value={localSettings.shippingThreshold}
                      onChange={(e) => handleSettingChange('shippingThreshold', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingFee">Your Shipping Fee (£)</Label>
                    <Input
                      id="shippingFee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={localSettings.shippingFee}
                      onChange={(e) => handleSettingChange('shippingFee', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="fullShippingCost">Full Shipping Cost (£)</Label>
                    <Input
                      id="fullShippingCost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={localSettings.fullShippingCost}
                      onChange={(e) => handleSettingChange('fullShippingCost', parseFloat(e.target.value) || 0)}
                    />
                    <p className="text-xs text-gray-500">
                      The actual cost you pay for shipping (for reference/profit calculations)
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Changes to these settings will immediately affect all calculator results. 
                    The shipping threshold determines when shipping fees apply to your sale price calculations.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="pt-6 border-t mt-6">
            <Button 
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
