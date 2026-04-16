import { useState } from "react";
import { BrickWall, Check, AlertTriangle, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaverMaintenanceSectionProps {
  paverSqft: string;
  onPaverSqftChange: (val: string) => void;
  selectedPackage: string | null;
  onSelectPackage: (pkg: string | null) => void;
  packagePrices: { silver: number; gold: number; platinum: number };
  hasMatrixErrors: boolean;
}

const PACKAGES = [
  { key: "silver", title: "Silver", subtitle: "(wash only)" },
  { key: "gold", title: "Gold", subtitle: "(wash & sand)" },
  { key: "platinum", title: "Platinum", subtitle: "(wash, sand, Silacast seal)" },
] as const;

const PaverMaintenanceSection = ({
  paverSqft,
  onPaverSqftChange,
  selectedPackage,
  onSelectPackage,
  packagePrices,
  hasMatrixErrors,
}: PaverMaintenanceSectionProps) => {
  return (
    <section className="bg-card rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-primary/10">
          <BrickWall className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-card-foreground">
          Paver Cleaning, Sanding &amp; Sealing
        </h2>
      </div>

      {hasMatrixErrors && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="text-sm font-medium text-red-700">
            ⚠️ Paver pricing unavailable — fix pricing matrix in Settings
          </span>
        </div>
      )}

      <div className="space-y-5">
        {/* Sqft Input */}
        <div className="max-w-xs">
          <Label className="text-sm font-medium text-card-foreground mb-1.5 block">
            PAVER SQUARE FOOTAGE
          </Label>
          <Input
            type="number"
            placeholder="0"
            value={paverSqft}
            onChange={(e) => onPaverSqftChange(e.target.value)}
            className="bg-white border-border text-card-foreground text-lg h-12"
          />
        </div>

        {/* Package Cards */}
        <div>
          <Label className="text-sm font-medium text-card-foreground mb-3 block">
            Select Package
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PACKAGES.map(({ key, title, subtitle }) => {
              const selected = selectedPackage === key;
              const price = packagePrices[key];
              const disabled = hasMatrixErrors;
              const borderClass = selected
                ? "border-primary ring-2 ring-primary/30"
                : "border-border hover:border-primary/40";

              return (
                <button
                  key={key}
                  onClick={() => {
                    if (disabled) return;
                    onSelectPackage(selected ? null : key);
                  }}
                  disabled={disabled}
                  className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all bg-white ${borderClass} ${
                    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {selected && (
                    <div className="absolute top-2 right-2 p-1 rounded-full bg-primary">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <span className="text-sm font-semibold text-card-foreground">{title}</span>
                  <span className="text-xs text-muted-foreground text-center">{subtitle}</span>
                  <span className="text-2xl font-bold text-primary mt-1">
                    {hasMatrixErrors ? "N/A" : `$${price.toFixed(2)}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Package Details Reference */}
        <PaverPackageDetailsCollapsible />
      </div>
    </section>
  );
};

const PaverPackageDetailsCollapsible = () => {
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
                { feature: "Clean all surfaces. Growth terminated, weeds removed.", silver: true, gold: true, platinum: true },
                { feature: "All joints sanded with PREMIUM SUREBOND POLYMERIC sand.", silver: false, gold: true, platinum: true },
                { feature: "One coat of Silacast penetrating sealer.", silver: false, gold: false, platinum: true },
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

export default PaverMaintenanceSection;
