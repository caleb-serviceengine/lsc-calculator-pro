import { useState, useMemo } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { AnnualServicePlanSettings } from "@/contexts/PricingSettingsContext";

const SERVICE_PLAN_FEATURES = [
  { feature: "Post Winter: Ensure gutters are debris-free after winter", silver: true, gold: true, platinum: true },
  { feature: "May/June Cleaning: Remove spring debris (maple seeds, oak tassels)", silver: true, gold: true, platinum: true },
  { feature: "Early Fall Cleaning: Two cleanings during mid-Oct to Dec to prevent clogs", silver: false, gold: false, platinum: true },
  { feature: "Late Fall Cleaning: Final cleaning after 90% of leaves have fallen", silver: true, gold: true, platinum: true },
  { feature: "Priority Scheduling: Get firm dates for gutter cleaning visits", silver: false, gold: true, platinum: true },
  { feature: "FREE Same Day Emergency Scheduling ($150 Value)", silver: false, gold: false, platinum: true },
  { feature: "10% Off All Other Services: Power washing, roof cleaning, etc.", silver: true, gold: true, platinum: true },
  { feature: "Gutter Stick Clog Preventers ($20/each at cost)", silver: false, gold: true, platinum: true },
  { feature: "FREE Annual Dryer Vent Cleaning ($149 Value)", silver: false, gold: false, platinum: true },
];

interface AnnualServicePlanCardProps {
  basePrice: number;
  planSettings: AnnualServicePlanSettings;
  selectedPlan: string | null;
  onSelectPlan: (plan: string | null) => void;
  addToBundle: boolean;
  onAddToBundleChange: (val: boolean) => void;
  hasMatrixErrors: boolean;
}

const AnnualServicePlanCard = ({
  basePrice,
  planSettings,
  selectedPlan,
  onSelectPlan,
  addToBundle,
  onAddToBundleChange,
  hasMatrixErrors,
}: AnnualServicePlanCardProps) => {
  const [featuresOpen, setFeaturesOpen] = useState(false);

  const planPrices = useMemo(() => {
    return planSettings.plans.map((plan) => {
      const regularPrice = basePrice * plan.visitsPerYear;
      const discountedPrice = regularPrice * (1 - plan.discountPercent / 100);
      return {
        name: plan.name.toLowerCase(),
        label: plan.name,
        visits: plan.visitsPerYear,
        discount: plan.discountPercent,
        includesDVC: plan.includesDVC,
        regularPrice,
        planPrice: discountedPrice,
        dvcValue: planSettings.dryerVentCleaningValue,
      };
    });
  }, [basePrice, planSettings]);

  if (!planSettings.enabled) return null;

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">Annual Service Plan</h2>
          <p className="text-sm text-muted-foreground">
            Prepay for multiple cleanings and save up to {Math.max(...planSettings.plans.map(p => p.discountPercent))}%
          </p>
        </div>
      </div>

      {/* Base Price Display */}
      <div className="mb-5 p-4 bg-white border border-border rounded-xl">
        <div className="text-sm font-medium text-card-foreground">Per-Visit Base Price</div>
        <div className="text-2xl font-bold text-primary">
          {hasMatrixErrors ? "N/A" : `$${basePrice.toFixed(2)}`}
        </div>
        <div className="text-xs text-muted-foreground">Calculated from building specs (Silver package pricing)</div>
      </div>

      {/* Plan Options */}
      <div className="space-y-3">
        {planPrices.map((plan, i) => {
          const isSelected = selectedPlan === plan.name;
          const isLast = i === planPrices.length - 1;
          const isBestValue = isLast; // Last plan = best value

          return (
            <button
              key={plan.name}
              onClick={() => !hasMatrixErrors && onSelectPlan(isSelected ? null : plan.name)}
              disabled={hasMatrixErrors}
              className={`relative w-full text-left border-2 rounded-xl p-4 transition-all cursor-pointer ${
                isSelected
                  ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                  : "border-border hover:border-primary/40 bg-white"
              } ${hasMatrixErrors ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 p-1 rounded-full bg-primary">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}

              <div className="flex items-center gap-2 mb-1">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? "border-primary" : "border-muted-foreground/40"
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <span className="font-bold text-card-foreground">
                  {plan.label} Plan — {plan.visits} Visits/Year
                </span>
                {isBestValue && (
                  <span className="bg-amber-400 text-amber-950 text-xs font-bold px-2 py-0.5 rounded">
                    BEST VALUE
                  </span>
                )}
              </div>

              <div className="ml-6 mt-1">
                <div className="text-sm text-muted-foreground">
                  Regular Price: ${plan.regularPrice.toFixed(2)}
                </div>
                <div className="text-lg font-bold text-primary mt-0.5">
                  Plan Price: ${plan.planPrice.toFixed(2)}
                  <span className="text-sm font-semibold ml-2">(Save {plan.discount}%)</span>
                </div>
                {plan.includesDVC && (
                  <div className="text-sm text-amber-600 font-medium mt-1.5">
                    ✓ Includes FREE Dryer Vent Cleaning (${plan.dvcValue} value)
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Collapsible Features Table */}
      <div className="mt-5">
        <Collapsible open={featuresOpen} onOpenChange={setFeaturesOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full group">
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${featuresOpen ? "rotate-180" : ""}`} />
            <h3 className="text-sm font-semibold text-card-foreground">Compare Plan Features</h3>
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
                  {SERVICE_PLAN_FEATURES.map(({ feature, silver, gold, platinum }) => (
                    <tr key={feature} className="border-b border-border/50">
                      <td className="py-2 pr-4 text-card-foreground">{feature}</td>
                      <td className="py-2 px-4 text-center">
                        {silver ? <span className="text-green-600 font-bold">✓</span> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="py-2 px-4 text-center">
                        {gold ? <span className="text-green-600 font-bold">✓</span> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="py-2 px-4 text-center">
                        {platinum ? <span className="text-green-600 font-bold">✓</span> : <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Add to Bundle */}
      {selectedPlan && !hasMatrixErrors && (
        <div className="mt-5 pt-4 border-t border-border flex items-center gap-2">
          <Checkbox
            id="asp-bundle"
            checked={addToBundle}
            onCheckedChange={(checked) => onAddToBundleChange(!!checked)}
          />
          <Label htmlFor="asp-bundle" className="text-sm text-card-foreground cursor-pointer">
            Add to Bundle
          </Label>
        </div>
      )}
    </div>
  );
};

export default AnnualServicePlanCard;
