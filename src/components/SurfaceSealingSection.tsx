import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { usePricingSettings } from "@/contexts/PricingSettingsContext";

interface SurfaceSealingSectionProps {
  surfaceSqfts: string[];
  onSurfaceSqftChange: (index: number, value: string) => void;
  surfaceSelected: boolean[];
  onSurfaceSelectedChange: (index: number, value: boolean) => void;
  prices: number[];
}

const SurfaceSealingSection = ({
  surfaceSqfts,
  onSurfaceSqftChange,
  surfaceSelected,
  onSurfaceSelectedChange,
  prices,
}: SurfaceSealingSectionProps) => {
  const { settings } = usePricingSettings();

  return (
    <section className="bg-card rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-primary/10">
          <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Shield / barrier */}
            <path d="M12 22s-8-4-8-10V5l8-3 8 3v7c0 6-8 10-8 10z" />
            {/* Water droplet inside, crossed out */}
            <path d="M12 8c0 0-3 3-3 5a3 3 0 0 0 6 0c0-2-3-5-3-5z" />
            {/* Strike-through line over droplet */}
            <line x1="9.5" y1="15" x2="14.5" y2="10" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-card-foreground">Surface Sealing</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {settings.surfaceSealingRates.map((rate, i) => {
          const selected = surfaceSelected[i];
          const borderClass = selected
            ? "border-primary ring-2 ring-primary/30"
            : "border-border hover:border-primary/40";

          return (
            <div
              key={rate.name}
              className={`relative flex flex-col rounded-xl border-2 p-4 transition-all bg-white ${borderClass}`}
            >
              <h3 className="text-sm font-semibold text-card-foreground mb-3">{rate.name}</h3>

              <div className="mb-3">
                <label className="text-sm font-medium text-card-foreground mb-1.5 block">
                  Square Feet
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={surfaceSqfts[i]}
                  onChange={(e) => onSurfaceSqftChange(i, e.target.value)}
                  className="bg-white border-border text-card-foreground"
                />
              </div>

              <p className="text-2xl font-bold text-primary mb-3">
                ${prices[i].toFixed(2)}
              </p>

              <div className="flex items-center gap-2 mt-auto">
                <Checkbox
                  checked={selected}
                  onCheckedChange={(c) => onSurfaceSelectedChange(i, c === true)}
                />
                <span className="text-sm font-medium text-card-foreground">Add to Bundle</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SurfaceSealingSection;
