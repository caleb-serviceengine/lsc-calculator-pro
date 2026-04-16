import { useState } from "react";
import { Check, AlertTriangle, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CardProps {
  name: string;
  description: string;
  price?: number;
  selected: boolean;
  onSelect: () => void;
}

const SelectCard = ({ name, description, price, selected, onSelect }: CardProps) => {
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
      <span className="text-xs text-gray-600 text-center">{description}</span>
      {price !== undefined && price > 0 && (
        <span className="text-base font-bold text-primary">${price.toFixed(2)}</span>
      )}
    </button>
  );
};

interface GutterCleaningSectionProps {
  selectedPackage: string | null;
  onSelectPackage: (pkg: string) => void;
  undergroundDrains: string;
  onUndergroundDrainsChange: (val: string) => void;
  brighteningFt: string;
  onBrighteningFtChange: (val: string) => void;
  packagePrices: { silver: number; gold: number };
  drainPrice: number;
  brighteningPrice: number;
  hasMatrixErrors: boolean;
  drainSelected: boolean;
  onDrainSelectedChange: (val: boolean) => void;
  brighteningSelected: boolean;
  onBrighteningSelectedChange: (val: boolean) => void;
}

const GutterCleaningSection = ({
  selectedPackage,
  onSelectPackage,
  undergroundDrains,
  onUndergroundDrainsChange,
  brighteningFt,
  onBrighteningFtChange,
  packagePrices,
  drainPrice,
  brighteningPrice,
  hasMatrixErrors,
  drainSelected,
  onDrainSelectedChange,
  brighteningSelected,
  onBrighteningSelectedChange,
}: GutterCleaningSectionProps) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-primary/10">
          <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Gutter profile - U shape with flanges */}
            <path d="M2 6h2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6h2" />
            {/* Leaf inside gutter */}
            <path d="M9 11c0-2 2-4 4-4" />
            <path d="M13 7c0 2-1.5 4-4 4" />
            <line x1="9" y1="11" x2="12" y2="8" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-card-foreground">
          Gutter Cleaning &amp; Drainage
        </h2>
      </div>

      <div className="space-y-5">
        {hasMatrixErrors && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="text-sm text-amber-700">⚠️ Gutter pricing unavailable — fix pricing matrix in Settings</span>
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-card-foreground mb-1.5 block">
              Underground Drains QTY
            </Label>
            <Input
              type="number"
              placeholder="e.g. 4"
              value={undergroundDrains}
              onChange={(e) => onUndergroundDrainsChange(e.target.value)}
              className="bg-white border-border text-card-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-card-foreground mb-1.5 block">
              Gutter Brightening Linear Ft
            </Label>
            <Input
              type="number"
              placeholder="e.g. 120"
              value={brighteningFt}
              onChange={(e) => onBrighteningFtChange(e.target.value)}
              className="bg-white border-border text-card-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Package cards */}
        <div>
          <Label className="text-sm font-medium text-card-foreground mb-3 block">
            Select Package
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <SelectCard
              name="Silver Package"
              description="Standard gutter cleaning"
              price={hasMatrixErrors ? undefined : packagePrices.silver}
              selected={!hasMatrixErrors && selectedPackage === "silver"}
              onSelect={() => !hasMatrixErrors && onSelectPackage("silver")}
            />
            <SelectCard
              name="Gold Package"
              description="Full gutter cleaning service"
              price={hasMatrixErrors ? undefined : packagePrices.gold}
              selected={!hasMatrixErrors && selectedPackage === "gold"}
              onSelect={() => !hasMatrixErrors && onSelectPackage("gold")}
            />
          </div>
          {hasMatrixErrors && (
            <p className="text-center text-sm text-amber-600 mt-2">N/A — fix pricing matrix in Settings</p>
          )}
        </div>

        {/* Add-on Price Cards */}
        <div>
          <Label className="text-sm font-medium text-card-foreground mb-3 block">
            Add-On Services
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <SelectCard
              name="Underground Drain Cleaning"
              description="Based on drain quantity"
              price={drainPrice > 0 ? drainPrice : undefined}
              selected={drainSelected}
              onSelect={() => onDrainSelectedChange(!drainSelected)}
            />
            <SelectCard
              name="Gutter Brightening"
              description="Based on linear footage"
              price={brighteningPrice > 0 ? brighteningPrice : undefined}
              selected={brighteningSelected}
              onSelect={() => onBrighteningSelectedChange(!brighteningSelected)}
            />
          </div>
        </div>

        {/* Package Details Reference */}
        <GutterPackageDetailsCollapsible />
      </div>
    </div>
  );
};

const GutterPackageDetailsCollapsible = () => {
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
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Debris removal, roof cleared where accessible.", silver: true, gold: true },
                { feature: "Downspouts checked and cleared for proper drainage", silver: true, gold: true },
                { feature: "Debris bagged and ready for customer's disposal (disposal available for additional charge)", silver: true, gold: true },
                { feature: "Photo confirmation of clean gutters", silver: true, gold: true },
                { feature: "30-day no clog guarantee", silver: false, gold: true },
                { feature: "Entire gutter system power flushed to remove every speck of debris. The most detailed service you can get.", silver: false, gold: true },
              ].map(({ feature, silver, gold }) => (
                <tr key={feature} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-card-foreground">{feature}</td>
                  <td className="py-2 px-4 text-center">{silver ? <span className="text-green-600 font-bold">✓</span> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="py-2 px-4 text-center">{gold ? <span className="text-green-600 font-bold">✓</span> : <span className="text-muted-foreground">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default GutterCleaningSection;
