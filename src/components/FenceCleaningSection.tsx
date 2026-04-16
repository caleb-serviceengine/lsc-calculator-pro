import { Fence } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePricingSettings } from "@/contexts/PricingSettingsContext";

interface FenceCleaningSectionProps {
  panelLinearFt: string;
  onPanelLinearFtChange: (v: string) => void;
  panelMaterial: string;
  onPanelMaterialChange: (v: string) => void;
  railLinearFt: string;
  onRailLinearFtChange: (v: string) => void;
  railMaterial: string;
  onRailMaterialChange: (v: string) => void;
  stainLevel: "Standard" | "Heavy";
  onStainLevelChange: (v: "Standard" | "Heavy") => void;
  price: number;
  addToBundle: boolean;
  onAddToBundleChange: (v: boolean) => void;
}

const FenceCleaningSection = ({
  panelLinearFt,
  onPanelLinearFtChange,
  panelMaterial,
  onPanelMaterialChange,
  railLinearFt,
  onRailLinearFtChange,
  railMaterial,
  onRailMaterialChange,
  stainLevel,
  onStainLevelChange,
  price,
  addToBundle,
  onAddToBundleChange,
}: FenceCleaningSectionProps) => {
  const { settings } = usePricingSettings();

  const panelMaterials = settings.fenceRates
    .filter((r) => r.name.toLowerCase().includes("panel"))
    .map((r) => r.name);
  const railMaterials = settings.fenceRates
    .filter((r) => r.name.toLowerCase().includes("rail"))
    .map((r) => r.name);

  // Calculate component prices for display
  const panelFt = parseFloat(panelLinearFt) || 0;
  const railFt = parseFloat(railLinearFt) || 0;
  const panelRate = settings.fenceRates.find((r) => r.name === panelMaterial);
  const railRate = settings.fenceRates.find((r) => r.name === railMaterial);
  const panelPrice = panelFt > 0 && panelRate
    ? panelFt * (stainLevel === "Heavy" ? panelRate.heavy : panelRate.standard)
    : 0;
  const railPrice = railFt > 0 && railRate
    ? railFt * (stainLevel === "Heavy" ? railRate.heavy : railRate.standard)
    : 0;
  const subtotal = panelPrice + railPrice;
  const minApplied = subtotal > 0 && subtotal < settings.fenceMinPrice;

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 rounded-lg bg-primary/10">
          <Fence className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-card-foreground">
          Fence Cleaning — Minimum ${settings.fenceMinPrice.toFixed(0)}
        </h2>
      </div>
      <p className="text-xs text-muted-foreground mb-5 ml-12">
        Panels and rails can have different materials. Stain level applies to both.
      </p>

      {/* Stain Level */}
      <div className="mb-5">
        <Label className="text-sm font-medium text-card-foreground mb-1.5 block">
          Stain Level
        </Label>
        <Select value={stainLevel} onValueChange={(v) => onStainLevelChange(v as "Standard" | "Heavy")}>
          <SelectTrigger className="w-40 bg-white border-border text-card-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Standard">Standard</SelectItem>
            <SelectItem value="Heavy">Heavy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Panels & Rails Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Panels */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-card-foreground">Panels</h3>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Material</Label>
            <Select value={panelMaterial} onValueChange={onPanelMaterialChange}>
              <SelectTrigger className="bg-white border-border text-card-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {panelMaterials.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Linear Feet</Label>
            <Input
              type="number"
              placeholder="0"
              value={panelLinearFt}
              onChange={(e) => onPanelLinearFtChange(e.target.value)}
              className="bg-white border-border text-card-foreground"
            />
          </div>
          {panelPrice > 0 && (
            <p className="text-sm font-medium text-card-foreground">
              Panel Price: <span className="text-primary font-bold">${panelPrice.toFixed(2)}</span>
            </p>
          )}
        </div>

        {/* Rails */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-card-foreground">Rails</h3>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Material</Label>
            <Select value={railMaterial} onValueChange={onRailMaterialChange}>
              <SelectTrigger className="bg-white border-border text-card-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {railMaterials.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Linear Feet</Label>
            <Input
              type="number"
              placeholder="0"
              value={railLinearFt}
              onChange={(e) => onRailLinearFtChange(e.target.value)}
              className="bg-white border-border text-card-foreground"
            />
          </div>
          {railPrice > 0 && (
            <p className="text-sm font-medium text-card-foreground">
              Rail Price: <span className="text-primary font-bold">${railPrice.toFixed(2)}</span>
            </p>
          )}
        </div>
      </div>

      {/* Total */}
      {price > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-card-foreground">Total</span>
              {minApplied && (
                <span className="block text-xs text-muted-foreground">
                  Minimum applied (was ${subtotal.toFixed(2)})
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-primary">${price.toFixed(2)}</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={addToBundle}
                  onCheckedChange={(v) => onAddToBundleChange(!!v)}
                />
                <span className="text-sm font-medium text-card-foreground">Add to Bundle</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FenceCleaningSection;
