import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { usePricingSettings } from "@/contexts/PricingSettingsContext";

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

const AnnualServicePlansSettings = () => {
  const { settings, updateSettings } = usePricingSettings();
  const [sectionOpen, setSectionOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const asp = settings.annualServicePlans;

  const updatePlan = (index: number, field: string, value: number | boolean) => {
    const updated = [...asp.plans];
    updated[index] = { ...updated[index], [field]: value };
    updateSettings({ annualServicePlans: { ...asp, plans: updated } });
  };

  return (
    <Collapsible open={sectionOpen} onOpenChange={setSectionOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full group">
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${sectionOpen ? "rotate-180" : ""}`} />
        <h3 className="text-sm font-semibold text-card-foreground">Annual Service Plans</h3>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-4 space-y-5">
          {/* Enable toggle */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="asp-enabled"
              checked={asp.enabled}
              onCheckedChange={(checked) =>
                updateSettings({ annualServicePlans: { ...asp, enabled: !!checked } })
              }
            />
            <Label htmlFor="asp-enabled" className="text-sm text-card-foreground cursor-pointer">
              Enable Service Plans
            </Label>
          </div>

          {/* Plan Pricing Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Plan</th>
                  <th className="text-left py-2 px-4 text-muted-foreground font-medium">Visits/Year</th>
                  <th className="text-left py-2 px-4 text-muted-foreground font-medium">Discount %</th>
                  <th className="text-center py-2 px-4 text-muted-foreground font-medium">Includes DVC</th>
                </tr>
              </thead>
              <tbody>
                {asp.plans.map((plan, i) => (
                  <tr key={plan.name} className="border-b border-border/50">
                    <td className="py-2 pr-4 text-card-foreground font-medium">{plan.name}</td>
                    <td className="py-2 px-4">
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        value={plan.visitsPerYear}
                        onChange={(e) => updatePlan(i, "visitsPerYear", Math.min(12, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-20 bg-white border-border text-card-foreground"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={plan.discountPercent}
                        onChange={(e) => updatePlan(i, "discountPercent", Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                        className="w-20 bg-white border-border text-card-foreground"
                      />
                    </td>
                    <td className="py-2 px-4 text-center">
                      <Checkbox
                        checked={plan.includesDVC}
                        onCheckedChange={(checked) => updatePlan(i, "includesDVC", !!checked)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* DVC Value */}
          <div className="flex items-center gap-2">
            <Label className="text-sm text-card-foreground w-48">Dryer Vent Cleaning Value</Label>
            <span className="text-sm text-muted-foreground">$</span>
            <Input
              type="number"
              step="0.01"
              value={asp.dryerVentCleaningValue}
              onChange={(e) =>
                updateSettings({
                  annualServicePlans: { ...asp, dryerVentCleaningValue: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-28 bg-white border-border text-card-foreground"
            />
          </div>

          {/* Features Comparison (collapsible) */}
          <Collapsible open={featuresOpen} onOpenChange={setFeaturesOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full group">
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${featuresOpen ? "rotate-180" : ""}`} />
              <h4 className="text-sm font-semibold text-card-foreground">Service Plan Features Comparison</h4>
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
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AnnualServicePlansSettings;
