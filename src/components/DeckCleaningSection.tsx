import { Layers } from "lucide-react";
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

interface DeckCleaningSectionProps {
  material: string;
  onMaterialChange: (v: string) => void;
  stainLevel: "Standard" | "Heavy";
  onStainLevelChange: (v: "Standard" | "Heavy") => void;
  surfaceSqft: string;
  onSurfaceSqftChange: (v: string) => void;
  undersideCleaning: boolean;
  onUndersideCleaningChange: (v: boolean) => void;
  railingFt: string;
  onRailingFtChange: (v: string) => void;
  stepCount: string;
  onStepCountChange: (v: string) => void;
  price: number;
  addToBundle: boolean;
  onAddToBundleChange: (v: boolean) => void;
}

const DeckCleaningSection = ({
  material,
  onMaterialChange,
  stainLevel,
  onStainLevelChange,
  surfaceSqft,
  onSurfaceSqftChange,
  undersideCleaning,
  onUndersideCleaningChange,
  railingFt,
  onRailingFtChange,
  stepCount,
  onStepCountChange,
  price,
  addToBundle,
  onAddToBundleChange,
}: DeckCleaningSectionProps) => {
  const { settings } = usePricingSettings();

  const materials = settings.deckSurfaceRates.map((r) => r.name);

  // Component price breakdown
  const sqft = parseFloat(surfaceSqft) || 0;
  const rFt = parseFloat(railingFt) || 0;
  const steps = parseInt(stepCount) || 0;

  const surfaceRate = settings.deckSurfaceRates.find((r) => r.name === material);
  const surfacePrice = sqft > 0 && surfaceRate
    ? sqft * (stainLevel === "Heavy" ? surfaceRate.heavy : surfaceRate.standard)
    : 0;

  const undersideModifier = stainLevel === "Heavy"
    ? settings.deckUndersideModifier.heavy
    : settings.deckUndersideModifier.standard;
  const undersidePrice = undersideCleaning && surfacePrice > 0
    ? surfacePrice * (undersideModifier / 100)
    : 0;

  const railingRate = settings.deckRailingRates.find((r) => r.name === material);
  const railingPrice = rFt > 0 && railingRate
    ? rFt * (stainLevel === "Heavy" ? railingRate.heavy : railingRate.standard)
    : 0;

  const stepRate = settings.deckStepRates.find((r) => r.name === material);
  const stepPrice = steps > 0 && stepRate
    ? steps * (stainLevel === "Heavy" ? stepRate.heavy : stepRate.standard)
    : 0;

  const subtotal = surfacePrice + undersidePrice + railingPrice + stepPrice;
  const minApplied = subtotal > 0 && subtotal < settings.deckMinPrice;

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 rounded-lg bg-primary/10">
          <Layers className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-card-foreground">
          Deck Cleaning — Minimum ${settings.deckMinPrice.toFixed(0)}
        </h2>
      </div>
      <p className="text-xs text-muted-foreground mb-5 ml-12">
        Single deck area. Underside modifier applies only to surface pricing.
      </p>

      {/* Material & Stain Level */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <Label className="text-sm font-medium text-card-foreground mb-1.5 block">
            Deck Material
          </Label>
          <Select value={material} onValueChange={onMaterialChange}>
            <SelectTrigger className="bg-white border-border text-card-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {materials.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
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
      </div>

      {/* Surface Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-card-foreground">Deck Surface</h3>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Square Feet</Label>
            <Input
              type="number"
              placeholder="0"
              value={surfaceSqft}
              onChange={(e) => onSurfaceSqftChange(e.target.value)}
              className="bg-white border-border text-card-foreground"
            />
          </div>
          {surfacePrice > 0 && (
            <p className="text-sm font-medium text-card-foreground">
              Surface: <span className="text-primary font-bold">${surfacePrice.toFixed(2)}</span>
            </p>
          )}
          {/* Underside Cleaning */}
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={undersideCleaning}
              onCheckedChange={(v) => onUndersideCleaningChange(!!v)}
            />
            <span className="text-sm text-card-foreground">
              Underside Cleaning (+{undersideModifier}%)
            </span>
          </label>
          {undersidePrice > 0 && (
            <p className="text-sm font-medium text-card-foreground">
              Underside: <span className="text-primary font-bold">${undersidePrice.toFixed(2)}</span>
            </p>
          )}
        </div>

        {/* Railings */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-card-foreground">Railings</h3>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Linear Feet</Label>
            <Input
              type="number"
              placeholder="0"
              value={railingFt}
              onChange={(e) => onRailingFtChange(e.target.value)}
              className="bg-white border-border text-card-foreground"
            />
          </div>
          {railingPrice > 0 && (
            <p className="text-sm font-medium text-card-foreground">
              Railings: <span className="text-primary font-bold">${railingPrice.toFixed(2)}</span>
            </p>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-card-foreground mb-2">Steps</h3>
        <div className="max-w-[200px]">
          <Label className="text-xs text-muted-foreground mb-1 block">Number of Steps</Label>
          <Input
            type="number"
            placeholder="0"
            value={stepCount}
            onChange={(e) => onStepCountChange(e.target.value)}
            className="bg-white border-border text-card-foreground"
          />
        </div>
        {stepPrice > 0 && (
          <p className="text-sm font-medium text-card-foreground mt-2">
            Steps: <span className="text-primary font-bold">${stepPrice.toFixed(2)}</span>
          </p>
        )}
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

export default DeckCleaningSection;
