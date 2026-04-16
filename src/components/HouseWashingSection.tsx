import { useState } from "react";
import { Droplets, Check, ChevronDown } from "lucide-react";
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
import { STAIN_LEVELS } from "@/lib/pricing";

interface PackageCardProps {
  name: string;
  description: string;
  price?: number;
  selected: boolean;
  onSelect: () => void;
  color: "muted" | "primary" | "accent";
}

const PackageCard = ({ name, description, price, selected, onSelect, color }: PackageCardProps) => {
  const borderClass = selected
    ? "border-primary ring-2 ring-primary/30"
    : "border-border hover:border-primary/40";

  const bgMap = {
    muted: "bg-white",
    primary: "bg-white",
    accent: "bg-white",
  };

  return (
    <button
      onClick={onSelect}
      className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all cursor-pointer ${borderClass} ${bgMap[color]}`}
    >
      {selected && (
        <div className="absolute top-2 right-2 p-1 rounded-full bg-primary">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
      <span className="text-sm font-semibold text-card-foreground">{name}</span>
      {description && <span className="text-xs text-gray-600 text-center">{description}</span>}
      {price !== undefined && price > 0 && (
        <span className="text-base font-bold text-primary">${price.toFixed(2)}</span>
      )}
    </button>
  );
};

interface HouseWashingSectionProps {
  windowCount: string;
  onWindowCountChange: (val: string) => void;
  sidingType: string;
  onSidingTypeChange: (val: string) => void;
  stainLevel: string;
  onStainLevelChange: (val: string) => void;
  nonOrganicStains: boolean;
  onNonOrganicStainsChange: (val: boolean) => void;
  selectedPackage: string | null;
  onSelectPackage: (pkg: string) => void;
  packagePrices: { spotFree: number; silver: number; gold: number; platinum: number };
  sidingTypes: string[];
}

const HouseWashingSection = ({
  windowCount,
  onWindowCountChange,
  sidingType,
  onSidingTypeChange,
  stainLevel,
  onStainLevelChange,
  nonOrganicStains,
  onNonOrganicStainsChange,
  selectedPackage,
  onSelectPackage,
  packagePrices,
  sidingTypes,
}: HouseWashingSectionProps) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-primary/10">
          <Droplets className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-card-foreground">
          House Washing
        </h2>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="windowCount" className="text-sm font-medium text-card-foreground mb-1.5 block">
              Window Count
            </Label>
            <Input
              id="windowCount"
              type="number"
              placeholder="e.g. 12"
              value={windowCount}
              onChange={(e) => onWindowCountChange(e.target.value)}
              className="bg-white border-border text-card-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-card-foreground mb-1.5 block">
              Siding Type
            </Label>
            <Select value={sidingType} onValueChange={onSidingTypeChange}>
              <SelectTrigger className="bg-white border-border text-card-foreground">
                <SelectValue placeholder="Select siding" />
              </SelectTrigger>
              <SelectContent>
                {sidingTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-card-foreground mb-1.5 block">
              Stain Level
            </Label>
            <Select value={stainLevel} onValueChange={onStainLevelChange}>
              <SelectTrigger className="bg-white border-border text-card-foreground">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {STAIN_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="nonOrganic"
            checked={nonOrganicStains}
            onCheckedChange={(c) => onNonOrganicStainsChange(c === true)}
          />
          <Label htmlFor="nonOrganic" className="text-sm text-card-foreground cursor-pointer">
            Non-Organic Stains?
          </Label>
        </div>

        <div>
          <Label className="text-sm font-medium text-card-foreground mb-3 block">
            Select Package
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <PackageCard
              name="Spot Free Exterior Window Cleaning"
              description="Spot Free Scrub And Rinse Of All Exterior Windows"
              price={packagePrices.spotFree}
              selected={selectedPackage === "spot-free"}
              onSelect={() => onSelectPackage("spot-free")}
              color="muted"
            />
            <PackageCard
              name="Silver Package"
              description="House Wash Only"
              price={packagePrices.silver}
              selected={selectedPackage === "silver"}
              onSelect={() => onSelectPackage("silver")}
              color="muted"
            />
            <PackageCard
              name="Gold Package"
              description="Exterior Window Cleaning + House Wash"
              price={packagePrices.gold}
              selected={selectedPackage === "gold"}
              onSelect={() => onSelectPackage("gold")}
              color="primary"
            />
            <PackageCard
              name="Platinum Package"
              description="Exterior Window Cleaning + House Wash + Polymer Coating + 2 Year Warranty"
              price={packagePrices.platinum}
              selected={selectedPackage === "platinum"}
              onSelect={() => onSelectPackage("platinum")}
              color="accent"
            />
          </div>
        </div>

        {/* Package Details Reference */}
        <PackageDetailsCollapsible />
      </div>
    </div>
  );
};

const PackageDetailsCollapsible = () => {
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
                <th className="text-center py-2 px-4 text-muted-foreground font-medium">Silver</th>
                <th className="text-center py-2 px-4 text-muted-foreground font-medium">Gold</th>
                <th className="text-center py-2 px-4 text-muted-foreground font-medium">Platinum</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Complete exterior of siding, fascia, soffit and gutters — treated with our custom blended detergent.", silver: true, gold: true, platinum: true },
                { feature: "Complete high-volume, low-pressure rinse for amazing results.", silver: true, gold: true, platinum: true },
                { feature: "Spot Free Scrub And Rinse Of All Exterior Windows", silver: false, gold: true, platinum: true },
                { feature: "Plex-Master coating applied: a brighter shine and extra protection against organic stains", silver: false, gold: false, platinum: true },
                { feature: "Two Year Stain-Free Warranty: Algae, mildew and mold stains covered.", silver: false, gold: false, platinum: true },
              ].map(({ feature, silver, gold, platinum }) => (
                <tr key={feature} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-card-foreground">{feature}</td>
                  <td className="py-2 px-4 text-center">{silver ? <span className="text-green-600 font-bold">✓</span> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="py-2 px-4 text-center">{gold ? <span className="text-green-600 font-bold">✓</span> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="py-2 px-4 text-center">{platinum ? <span className="text-green-600 font-bold">✓</span> : <span className="text-muted-foreground">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default HouseWashingSection;
