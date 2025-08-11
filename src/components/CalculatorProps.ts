
import { CalculatorSettings } from '@/types';

export interface CalculatorProps {
  settings: CalculatorSettings;
  onSettingsChange?: () => Promise<void>;
}
