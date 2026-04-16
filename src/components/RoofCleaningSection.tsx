import { useState } from "react";
import { Home, Check, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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

interface ServiceCardProps {
  name: string;
  description: string;
  price: number;
  selected: boolean;
  onSelect: () => void;
}

const ServiceCard = ({ name, description, price, selected, onSelect }: ServiceCardProps) => {
  const borderClass = selected
    ? "border-primary ring-2 ring-primary/30"
    : "border-border hover:border-primary/40";

  return (
    <button
      onClick={onSelect}
      className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all cursor-pointer bg-white ${borderClass}`}
    >
      {selected && (
        <div className="absolute top-2 right-2 p-1 rounded-full bg-primary">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
      <span className="text-sm font-semibold text-card-foreground">{name}</span>
      <span className="text-xs text-muted-foreground text-center">{description}</span>
      {price > 0 && (
        <span className="text-base font-bold text-primary">${price.toFixed(2)}</span>
      )}
    </button>
  );
};

interface RoofCleaningSectionProps {
  roofSqft: string;
  onRoofSqftChange: (val: string) => void;
  surfaceType: string;
  onSurfaceTypeChange: (val: string) => void;
  difficultyLevel: string;
  onDifficultyLevelChange: (val: string) => void;
  heavyMossLichen: boolean;
  onHeavyMossLichenChange: (val: boolean) => void;
  noGutters: boolean;
  onNoGuttersChange: (val: boolean) => void;
  platinumSelected: boolean;
  onPlatinumSelectedChange: (val: boolean) => void;
  goNanoSelected: boolean;
  onGoNanoSelectedChange: (val: boolean) => void;
  platinumPrice: number;
  goNanoPrice: number;
}

const RoofCleaningSection = ({
  roofSqft,
  onRoofSqftChange,
  surfaceType,
  onSurfaceTypeChange,
  difficultyLevel,
  onDifficultyLevelChange,
  heavyMossLichen,
  onHeavyMossLichenChange,
  noGutters,
  onNoGuttersChange,
  platinumSelected,
  onPlatinumSelectedChange,
  goNanoSelected,
  onGoNanoSelectedChange,
  platinumPrice,
  goNanoPrice,
}: RoofCleaningSectionProps) => {
  const { settings } = usePricingSettings();

  const surfaceTypes = settings.roofSurfaceRates.map((r) => r.name);
  const difficultyLevels = settings.roofDifficultyLevels.map((d) => ({
    name: d.name,
    multiplier: 1 + d.upcharge / 100,
  }));

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-primary/10">
          <Home className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-card-foreground">
          Roof Cleaning &amp; Protection
        </h2>
      </div>

      <div className="space-y-5">
        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium text-card-foreground mb-1.5 block">
              ROOF SQUARE FOOTAGE
            </Label>
            <Input
              type="number"
              placeholder="e.g. 2200"
              value={roofSqft}
              onChange={(e) => onRoofSqftChange(e.target.value)}
              className="bg-white border-border text-card-foreground placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This may differ from building square footage
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium text-card-foreground mb-1.5 block">
              SURFACE TYPE
            </Label>
            <Select value={surfaceType} onValueChange={onSurfaceTypeChange}>
              <SelectTrigger className="bg-white border-border text-card-foreground">
                <SelectValue placeholder="Select surface" />
              </SelectTrigger>
              <SelectContent>
                {surfaceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-card-foreground mb-1.5 block">
              ROOF DIFFICULTY LEVEL
            </Label>
            <Select value={difficultyLevel} onValueChange={onDifficultyLevelChange}>
              <SelectTrigger className="bg-white border-border text-card-foreground">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficultyLevels.map((d) => (
                  <SelectItem key={d.name} value={d.name}>
                    {d.name} ({d.multiplier.toFixed(d.multiplier % 1 === 0 ? 1 : 2)}x)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="heavyMossLichen"
              checked={heavyMossLichen}
              onCheckedChange={(c) => onHeavyMossLichenChange(c === true)}
            />
            <Label htmlFor="heavyMossLichen" className="text-sm text-card-foreground cursor-pointer">
              Heavy Moss/Lichen Visible
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="noGutters"
              checked={noGutters}
              onCheckedChange={(c) => onNoGuttersChange(c === true)}
            />
            <Label htmlFor="noGutters" className="text-sm text-card-foreground cursor-pointer">
              No Gutters on Property
            </Label>
          </div>
        </div>

        {/* Service Cards */}
        <div>
          <Label className="text-sm font-medium text-card-foreground mb-3 block">
            Select Services
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <ServiceCard
              name="Platinum Roof Cleaning"
              description="Full roof cleaning service plus five-year warranty against algae stains"
              price={platinumPrice}
              selected={platinumSelected}
              onSelect={() => onPlatinumSelectedChange(!platinumSelected)}
            />
            <ServiceCard
              name="GoNano Revive Treatment"
              description="Advanced surface protection + 10 Year Warranty"
              price={goNanoPrice}
              selected={goNanoSelected}
              onSelect={() => onGoNanoSelectedChange(!goNanoSelected)}
            />
          </div>
        </div>

        {/* Package Details Reference */}
        <RoofPackageDetailsCollapsible />
      </div>
    </div>
  );
};

const RoofPackageDetailsCollapsible = () => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full group">
        <h3 className="text-sm font-semibold text-card-foreground">Package Details</h3>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Feature</th>
                <th className="text-center py-2 px-4 text-muted-foreground font-medium">Platinum</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "ENTIRE roof treated with our Super Effective Detergent.", included: true },
                { feature: "5 Year Warranty Against Stains Caused By Mold & Algae", included: true },
              ].map(({ feature, included }) => (
                <tr key={feature} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-card-foreground">{feature}</td>
                  <td className="py-2 px-4 text-center">{included ? <span className="text-green-600 font-bold">✓</span> : <span className="text-muted-foreground">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default RoofCleaningSection;
