import { ArrowLeft, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { usePricingSettings, validateGutterTiers, validatePaverTiers, type StoryModifier, type Clean365Settings } from "@/contexts/PricingSettingsContext";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import AnnualServicePlansSettings from "@/components/AnnualServicePlansSettings";
import WidgetPricingSettings from "@/components/WidgetPricingSettings";

interface SettingsPanelProps {
  onClose: () => void;
}

// Collapsible wrapper for each settings section
const CollapsibleSettingsSection = ({
  title,
  children,
  defaultOpen = false,
  tooltip,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  tooltip?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={`w-full flex items-center gap-3 px-5 py-3.5 bg-card shadow-sm border border-border hover:border-primary/30 transition-all cursor-pointer ${
            open ? "rounded-t-xl border-b-0" : "rounded-xl"
          }`}
        >
          <ChevronRight
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          />
          <span className="text-sm font-semibold text-card-foreground flex-1 text-left">
            {title}
          </span>
          {tooltip && (
            <span onClick={(e) => e.stopPropagation()}>
              {tooltip}
            </span>
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border border-t-0 border-border rounded-b-xl overflow-hidden bg-card p-6 space-y-6">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

const ModifierRow = ({
  label,
  modifier,
  onChange,
}: {
  label: string;
  modifier: StoryModifier;
  onChange: (m: StoryModifier) => void;
}) => (
  <div className="flex items-center gap-3 flex-wrap">
    <span className="text-sm font-medium text-card-foreground w-36">{label}</span>
    <div className="flex rounded-lg overflow-hidden border border-border">
      <button
        onClick={() => onChange({ ...modifier, type: "dollar" })}
        className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
          modifier.type === "dollar"
            ? "bg-primary text-primary-foreground"
            : "bg-muted/30 text-muted-foreground hover:text-card-foreground"
        }`}
      >
        $ Dollar
      </button>
      <button
        onClick={() => onChange({ ...modifier, type: "percent" })}
        className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
          modifier.type === "percent"
            ? "bg-primary text-primary-foreground"
            : "bg-muted/30 text-muted-foreground hover:text-card-foreground"
        }`}
      >
        % Percent
      </button>
    </div>
    <Input
      type="number"
      value={modifier.value}
      onChange={(e) => onChange({ ...modifier, value: parseFloat(e.target.value) || 0 })}
      className="w-20 bg-white border-border text-card-foreground"
    />
    <div className="flex items-center gap-1.5">
      <Checkbox
        checked={modifier.enabled}
        onCheckedChange={(c) => onChange({ ...modifier, enabled: c === true })}
      />
      <span className="text-xs text-muted-foreground">Enable</span>
    </div>
  </div>
);

const CalcInfoTooltip = ({ children }: { children: React.ReactNode }) => (
  <HoverCard openDelay={100} closeDelay={200}>
    <HoverCardTrigger asChild>
      <button type="button" className="text-muted-foreground hover:text-card-foreground transition-colors cursor-help">
        <Info className="w-4 h-4" />
      </button>
    </HoverCardTrigger>
    <HoverCardContent side="right" align="start" className="w-72 p-3 text-sm">
      {children}
    </HoverCardContent>
  </HoverCard>
);

export const SettingsPanelContent = () => {
  const { settings, updateSettings } = usePricingSettings();

  const gutterTierErrors = useMemo(() => validateGutterTiers(settings.gutterTiers), [settings.gutterTiers]);
  const errorRowIndices = useMemo(() => {
    const set = new Set<number>();
    gutterTierErrors.forEach((e) => {
      set.add(e.row);
      if (e.overlapsWithRow !== undefined) set.add(e.overlapsWithRow);
    });
    return set;
  }, [gutterTierErrors]);

  const updateRoofSurfaceRate = (index: number, field: "standard" | "mossLichen", value: number) => {
    const updated = [...settings.roofSurfaceRates];
    updated[index] = { ...updated[index], [field]: value };
    updateSettings({ roofSurfaceRates: updated });
  };

  const updateDifficultyLevel = (index: number, value: number) => {
    const updated = [...settings.roofDifficultyLevels];
    updated[index] = { ...updated[index], upcharge: value };
    updateSettings({ roofDifficultyLevels: updated });
  };

  const updateSidingRate = (index: number, field: "standard" | "heavy", value: number) => {
    const updated = [...settings.sidingRates];
    updated[index] = { ...updated[index], [field]: value };
    updateSettings({ sidingRates: updated });
  };

  const updateGutterTier = (index: number, field: "minSqft" | "maxSqft" | "gold" | "platinum", value: number) => {
    const updated = [...settings.gutterTiers];
    updated[index] = { ...updated[index], [field]: value };
    updateSettings({ gutterTiers: updated });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Global Settings - always visible */}
        <section className="bg-card rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Global Settings</h2>
          <div className="flex items-center gap-3">
            <Label className="text-sm text-card-foreground">Universal Seasonal Modifier</Label>
            <Input
              type="number"
              value={settings.seasonalModifier}
              onChange={(e) => updateSettings({ seasonalModifier: parseFloat(e.target.value) || 0 })}
              className="w-24 bg-white border-border text-card-foreground"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </section>

        {/* Clean365 Annual Maintenance Plan */}
        <Clean365MaintenanceSettings />

        {/* House Washing */}
        <CollapsibleSettingsSection title="House Washing Settings">
          {/* Siding Rates Table */}
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Pricing Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Siding Type</th>
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">Standard $/sqft</th>
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">Heavy $/sqft</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.sidingRates.map((rate, i) => (
                    <tr key={rate.name} className="border-b border-border/50">
                      <td className="py-2 pr-4 text-card-foreground">{rate.name}</td>
                      <td className="py-2 px-4">
                        <Input
                          type="number"
                          step="0.01"
                          value={rate.standard.toFixed(2)}
                          onChange={(e) => updateSidingRate(i, "standard", parseFloat(e.target.value) || 0)}
                          className="w-24 bg-white border-border text-card-foreground"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <Input
                          type="number"
                          step="0.01"
                          value={rate.heavy.toFixed(2)}
                          onChange={(e) => updateSidingRate(i, "heavy", parseFloat(e.target.value) || 0)}
                          className="w-24 bg-white border-border text-card-foreground"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional House Settings */}
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Additional Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Window Price", key: "windowPrice" as const, prefix: "$" },
                { label: "Minimum Price", key: "houseMinPrice" as const, prefix: "$" },
                { label: "Spot Free Exterior Window Cleaning Min Price", key: "spotFreeMinPrice" as const, prefix: "$" },
                { label: "Detached Garage Fee", key: "detachedGarageFee" as const, prefix: "$" },
                { label: "Specialty Chem Fee", key: "specialtyChemFee" as const, prefix: "$" },
              ].map(({ label, key, prefix }) => (
                <div key={key} className="flex items-center gap-2">
                  <Label className="text-sm text-card-foreground w-40">{label}</Label>
                  <span className="text-sm text-muted-foreground">{prefix}</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings[key]}
                    onChange={(e) => updateSettings({ [key]: parseFloat(e.target.value) || 0 })}
                    className="w-28 bg-white border-border text-card-foreground"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* House Modifiers */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-card-foreground mb-1">Modifiers</h3>
            <ModifierRow label="2-Story Modifier" modifier={settings.houseTwo} onChange={(m) => updateSettings({ houseTwo: m })} />
            <ModifierRow label="3-Story Modifier" modifier={settings.houseThree} onChange={(m) => updateSettings({ houseThree: m })} />
            <ModifierRow label="Stain Level Modifier" modifier={settings.stainLevelModifier} onChange={(m) => updateSettings({ stainLevelModifier: m })} />
          </div>
        </CollapsibleSettingsSection>

        {/* Gutter Cleaning */}
        <CollapsibleSettingsSection title="Gutter Cleaning Settings">
          {/* Gutter Tiers Table */}
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Pricing Tiers</h3>

            {/* Validation status */}
            {gutterTierErrors.length > 0 ? (
              <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-semibold text-red-700">Pricing matrix has errors</span>
                </div>
                {gutterTierErrors.map((err, i) => (
                  <p key={i} className="text-xs text-red-600 ml-6">{err.message}</p>
                ))}
              </div>
            ) : (
              <div className="mb-3 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Pricing matrix is valid ✓</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="w-8"></th>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">SqFt Low</th>
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">SqFt High</th>
                     <th className="text-left py-2 px-4 text-muted-foreground font-medium">Silver Package $</th>
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">Gold Package $</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.gutterTiers.map((tier, i) => {
                    const hasError = errorRowIndices.has(i);
                    return (
                      <tr key={i} className={`border-b ${hasError ? "border-red-300 bg-red-50" : "border-border/50"}`}>
                        <td className="py-2 pr-1 text-center">
                          {hasError && <AlertTriangle className="w-4 h-4 text-red-500 inline" />}
                        </td>
                        <td className="py-2 pr-4">
                          <Input
                            type="number"
                            value={tier.minSqft}
                            onChange={(e) => updateGutterTier(i, "minSqft", parseInt(e.target.value) || 0)}
                            className={`w-24 bg-white text-card-foreground ${hasError ? "border-red-400" : "border-border"}`}
                          />
                        </td>
                        <td className="py-2 px-4">
                          <Input
                            type="number"
                            value={tier.maxSqft}
                            onChange={(e) => updateGutterTier(i, "maxSqft", parseInt(e.target.value) || 0)}
                            className={`w-24 bg-white text-card-foreground ${hasError ? "border-red-400" : "border-border"}`}
                          />
                        </td>
                        <td className="py-2 px-4">
                          <Input
                            type="number"
                            value={tier.gold}
                            onChange={(e) => updateGutterTier(i, "gold", parseFloat(e.target.value) || 0)}
                            className="w-24 bg-white border-border text-card-foreground"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <Input
                            type="number"
                            value={tier.platinum}
                            onChange={(e) => updateGutterTier(i, "platinum", parseFloat(e.target.value) || 0)}
                            className="w-24 bg-white border-border text-card-foreground"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Gutter Settings */}
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Additional Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Minimum Price", key: "gutterMinPrice" as const },
                { label: "Brightening Per Linear Ft", key: "brighteningPerFt" as const },
                { label: "Drain Base Price", key: "drainBasePrice" as const },
                { label: "Additional Drain Price", key: "drainAdditionalPrice" as const },
              ].map(({ label, key }) => (
                <div key={key} className="flex items-center gap-2">
                  <Label className="text-sm text-card-foreground w-48">{label}</Label>
                  <span className="text-sm text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings[key]}
                    onChange={(e) => updateSettings({ [key]: parseFloat(e.target.value) || 0 })}
                    className="w-28 bg-white border-border text-card-foreground"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Gutter Modifiers */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-card-foreground mb-1">Modifiers</h3>
            <ModifierRow label="2-Story Modifier" modifier={settings.gutterTwo} onChange={(m) => updateSettings({ gutterTwo: m })} />
            <ModifierRow label="3-Story Modifier" modifier={settings.gutterThree} onChange={(m) => updateSettings({ gutterThree: m })} />
          </div>

          {/* Annual Service Plans */}
          <AnnualServicePlansSettings />
        </CollapsibleSettingsSection>

        {/* Gutter Protection */}
        <CollapsibleSettingsSection
          title="Gutter Protection Settings"
          tooltip={
            <CalcInfoTooltip>
              <p className="text-xs font-medium mb-1">Raindrop & FlowGuard:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-xs">
                <li>Base = Linear Feet × Price Per Linear Ft</li>
                <li>Apply 2-Story Modifier (if enabled)</li>
                <li>Apply 3+ Story Modifier (if enabled)</li>
                <li>Apply Minimum Price</li>
              </ol>
              <p className="text-xs font-medium mt-1.5 mb-1">Gutter Stick:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-xs">
                <li>Base = Quantity × Price Per Unit</li>
                <li>Apply story modifiers (if enabled)</li>
                <li>Apply Minimum Price</li>
              </ol>
            </CalcInfoTooltip>
          }
        >
          {settings.gutterProtectionProducts.map((product, pi) => (
            <div key={product.name} className="space-y-3 border-b border-border/50 pb-5 last:border-0 last:pb-0">
              <h3 className="text-sm font-semibold text-card-foreground">{product.name}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-card-foreground w-40">{product.unitLabel === "per linear ft" ? "Linear Foot Price" : "Price Per Unit"}</Label>
                  <span className="text-sm text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={product.pricePerUnit}
                    onChange={(e) => {
                      const updated = [...settings.gutterProtectionProducts];
                      updated[pi] = { ...updated[pi], pricePerUnit: parseFloat(e.target.value) || 0 };
                      updateSettings({ gutterProtectionProducts: updated });
                    }}
                    className="w-28 bg-white border-border text-card-foreground"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-card-foreground w-40">Minimum Price</Label>
                  <span className="text-sm text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={product.minPrice}
                    onChange={(e) => {
                      const updated = [...settings.gutterProtectionProducts];
                      updated[pi] = { ...updated[pi], minPrice: parseFloat(e.target.value) || 0 };
                      updateSettings({ gutterProtectionProducts: updated });
                    }}
                    className="w-28 bg-white border-border text-card-foreground"
                  />
                </div>
              </div>
              <ModifierRow
                label="2-Story Modifier"
                modifier={product.twoStory}
                onChange={(m) => {
                  const updated = [...settings.gutterProtectionProducts];
                  updated[pi] = { ...updated[pi], twoStory: m };
                  updateSettings({ gutterProtectionProducts: updated });
                }}
              />
              <ModifierRow
                label="3+ Story Modifier"
                modifier={product.threeStory}
                onChange={(m) => {
                  const updated = [...settings.gutterProtectionProducts];
                  updated[pi] = { ...updated[pi], threeStory: m };
                  updateSettings({ gutterProtectionProducts: updated });
                }}
              />
            </div>
          ))}
        </CollapsibleSettingsSection>

        {/* Roof Cleaning */}
        <CollapsibleSettingsSection
          title="Roof Cleaning Settings"
          tooltip={
            <CalcInfoTooltip>
              <p className="text-xs font-medium mb-1">Calculation Order:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-xs">
                <li>Base = Roof SqFt × Surface Rate</li>
                <li>Apply Difficulty Modifier</li>
                <li>Apply No Gutter Modifier (if checked)</li>
                <li>Apply Moss/Lichen Modifier (if enabled)</li>
                <li>Apply 3+ Story Modifier</li>
                <li>Add Detached Garage Fee</li>
                <li>Apply Minimum Price</li>
              </ol>
              <p className="text-xs mt-1.5 font-medium">GoNano: Roof SqFt × $/sqft (no modifiers)</p>
            </CalcInfoTooltip>
          }
        >
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Surface Type Pricing Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Surface Type</th>
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">Standard $/sqft</th>
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">Moss/Lichen $/sqft</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.roofSurfaceRates.map((rate, i) => (
                    <tr key={rate.name} className="border-b border-border/50">
                      <td className="py-2 pr-4 text-card-foreground">{rate.name}</td>
                      <td className="py-2 px-4">
                        <Input type="number" step="0.01" value={rate.standard.toFixed(2)} onChange={(e) => updateRoofSurfaceRate(i, "standard", parseFloat(e.target.value) || 0)} className="w-24 bg-white border-border text-card-foreground" />
                      </td>
                      <td className="py-2 px-4">
                        <Input type="number" step="0.01" value={rate.mossLichen.toFixed(2)} onChange={(e) => updateRoofSurfaceRate(i, "mossLichen", parseFloat(e.target.value) || 0)} className="w-24 bg-white border-border text-card-foreground" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Difficulty Level Modifiers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {settings.roofDifficultyLevels.map((level, i) => (
                <div key={level.name} className="flex items-center gap-2">
                  <Label className="text-sm text-card-foreground w-28">{level.name} Difficulty</Label>
                  <Input type="number" value={level.upcharge} onChange={(e) => updateDifficultyLevel(i, parseFloat(e.target.value) || 0)} className="w-20 bg-white border-border text-card-foreground" />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Additional Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Minimum Price", key: "roofMinPrice" as const, prefix: "$", suffix: "", isSqft: false },
                { label: "No Gutter Modifier", key: "roofNoGutterModifier" as const, prefix: "", suffix: "%", isSqft: false },
                { label: "Detached Garage Fee", key: "roofDetachedGarageFee" as const, prefix: "$", suffix: "", isSqft: false },
                { label: "GoNano Revive $/sqft", key: "goNanoRevivePrice" as const, prefix: "$", suffix: "", isSqft: true },
              ].map(({ label, key, prefix, suffix, isSqft }) => (
                <div key={key} className="flex items-center gap-2">
                  <Label className="text-sm text-card-foreground w-44">{label}</Label>
                  {prefix && <span className="text-sm text-muted-foreground">{prefix}</span>}
                  <Input type="number" step="0.01" value={isSqft ? (settings[key] as number).toFixed(2) : settings[key]} onChange={(e) => updateSettings({ [key]: parseFloat(e.target.value) || 0 })} className="w-28 bg-white border-border text-card-foreground" />
                  {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-card-foreground mb-1">Modifiers</h3>
            <ModifierRow label="Moss/Lichen Modifier" modifier={settings.roofMossLichenModifier} onChange={(m) => updateSettings({ roofMossLichenModifier: m })} />
            <ModifierRow label="3+ Story / 40' Ladder" modifier={settings.roofThreeStory} onChange={(m) => updateSettings({ roofThreeStory: m })} />
          </div>
        </CollapsibleSettingsSection>

        {/* Dryer Vent Cleaning */}
        <CollapsibleSettingsSection
          title="Dryer Vent Cleaning Settings"
          tooltip={
            <CalcInfoTooltip>
              <p className="text-xs font-medium mb-1">Dryer Vent Cleaning Price Calculation:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-xs">
                <li>First vent = Base Price</li>
                <li>Each additional vent = Additional Price</li>
                <li>Total = Base + (qty - 1) × Additional</li>
              </ol>
              <p className="text-xs mt-2 font-medium">Example: 3 vents</p>
              <ul className="text-xs space-y-0.5 ml-2">
                <li>• First: $149.00</li>
                <li>• Additional 2: 2 × $79.00 = $158.00</li>
                <li>• Total: $307.00</li>
              </ul>
            </CalcInfoTooltip>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-card-foreground w-44">First Vent Price</Label>
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                step="0.01"
                value={settings.dryerVentBasePrice}
                onChange={(e) => updateSettings({ dryerVentBasePrice: parseFloat(e.target.value) || 0 })}
                className="w-28 bg-white border-border text-card-foreground"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-card-foreground w-44">Each Additional Price</Label>
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                step="0.01"
                value={settings.dryerVentAdditionalPrice}
                onChange={(e) => updateSettings({ dryerVentAdditionalPrice: parseFloat(e.target.value) || 0 })}
                className="w-28 bg-white border-border text-card-foreground"
              />
            </div>
          </div>
        </CollapsibleSettingsSection>

        {/* Flatwork Power Washing */}
        <CollapsibleSettingsSection
          title="Flatwork Power Washing Settings"
          tooltip={
            <CalcInfoTooltip>
              <p className="text-xs font-medium mb-1">Flatwork Power Washing Price Calculation:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-xs">
                <li>For each area: SqFt × Rate (based on surface type + stain level)</li>
                <li>Sum all area prices</li>
                <li>Apply minimum: max(Total, Minimum Price)</li>
              </ol>
              <p className="text-xs mt-2 font-medium">Example: 2 areas</p>
              <ul className="text-xs space-y-0.5 ml-2">
                <li>• Area 1: Residential Concrete, Standard, 1000 sqft → 1000 × $0.30 = $300</li>
                <li>• Area 2: Pavers/Flagstone, Heavy, 500 sqft → 500 × $0.70 = $350</li>
                <li>• Raw Total: $650</li>
                <li>• Minimum: max($650, $349) = $650</li>
                <li>• Final: $650.00</li>
              </ul>
            </CalcInfoTooltip>
          }
        >
          {/* Flatwork Rates Table */}
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Surface Type Pricing</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Surface Type</th>
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">Standard $/sqft</th>
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">Heavy $/sqft</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.flatworkRates.map((rate, i) => (
                    <tr key={rate.name} className="border-b border-border/50">
                      <td className="py-2 pr-4 text-card-foreground font-medium">{rate.name}</td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={rate.standard.toFixed(2)}
                            onChange={(e) => {
                              const updated = [...settings.flatworkRates];
                              updated[i] = { ...updated[i], standard: parseFloat(e.target.value) || 0 };
                              updateSettings({ flatworkRates: updated });
                            }}
                            className="w-24 bg-white border-border text-card-foreground"
                          />
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={rate.heavy.toFixed(2)}
                            onChange={(e) => {
                              const updated = [...settings.flatworkRates];
                              updated[i] = { ...updated[i], heavy: parseFloat(e.target.value) || 0 };
                              updateSettings({ flatworkRates: updated });
                            }}
                            className="w-24 bg-white border-border text-card-foreground"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Flatwork Minimum */}
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Minimum Price</h3>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-card-foreground w-44">Total Minimum Price</Label>
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                step="0.01"
                value={settings.flatworkMinPrice}
                onChange={(e) => updateSettings({ flatworkMinPrice: parseFloat(e.target.value) || 0 })}
                className="w-28 bg-white border-border text-card-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">This minimum applies to the TOTAL of all areas combined, not per area.</p>
          </div>
        </CollapsibleSettingsSection>

        {/* Architectural Power Washing */}
        <CollapsibleSettingsSection
          title="Architectural Power Washing Settings"
          tooltip={
            <CalcInfoTooltip>
              <p className="text-xs font-medium mb-1">Architectural Power Washing Price Calculation:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-xs">
                <li>For each area, calculate three components:</li>
              </ol>
              <ul className="text-xs space-y-0.5 ml-4 mt-1">
                <li>• Vertical Walls: SqFt × Rate (material + stain level)</li>
                <li>• Ballustrades: Qty × Rate (material + stain level)</li>
                <li>• Curbs: Linear Ft × Rate (material + stain level)</li>
              </ul>
              <ol className="list-decimal list-inside space-y-0.5 text-xs mt-1" start={2}>
                <li>Area Total = Walls + Ballustrades + Curbs</li>
                <li>Grand Total = Sum of all area totals</li>
                <li>Apply minimum: max(Grand Total, Minimum Price)</li>
              </ol>
            </CalcInfoTooltip>
          }
        >
          {/* Vertical Wall Rates */}
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Vertical Wall Pricing ($/sqft)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Material</th>
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">Standard $/sqft</th>
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">Heavy $/sqft</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.archVerticalWallRates.map((rate, i) => (
                    <tr key={rate.name} className="border-b border-border/50">
                      <td className="py-2 pr-4 text-card-foreground font-medium">{rate.name}</td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={rate.standard.toFixed(2)}
                            onChange={(e) => {
                              const updated = [...settings.archVerticalWallRates];
                              updated[i] = { ...updated[i], standard: parseFloat(e.target.value) || 0 };
                              updateSettings({ archVerticalWallRates: updated });
                            }}
                            className="w-24 bg-white border-border text-card-foreground"
                          />
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={rate.heavy.toFixed(2)}
                            onChange={(e) => {
                              const updated = [...settings.archVerticalWallRates];
                              updated[i] = { ...updated[i], heavy: parseFloat(e.target.value) || 0 };
                              updateSettings({ archVerticalWallRates: updated });
                            }}
                            className="w-24 bg-white border-border text-card-foreground"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ballustrade Rates */}
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Ballustrade Pricing ($/unit)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Material</th>
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">Standard $/unit</th>
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">Heavy $/unit</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.archBallustradeRates.map((rate, i) => (
                    <tr key={rate.name} className="border-b border-border/50">
                      <td className="py-2 pr-4 text-card-foreground font-medium">{rate.name}</td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={rate.standard.toFixed(2)}
                            onChange={(e) => {
                              const updated = [...settings.archBallustradeRates];
                              updated[i] = { ...updated[i], standard: parseFloat(e.target.value) || 0 };
                              updateSettings({ archBallustradeRates: updated });
                            }}
                            className="w-24 bg-white border-border text-card-foreground"
                          />
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={rate.heavy.toFixed(2)}
                            onChange={(e) => {
                              const updated = [...settings.archBallustradeRates];
                              updated[i] = { ...updated[i], heavy: parseFloat(e.target.value) || 0 };
                              updateSettings({ archBallustradeRates: updated });
                            }}
                            className="w-24 bg-white border-border text-card-foreground"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Curb Rates */}
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Curb Pricing ($/linear ft)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Material</th>
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">Standard $/ft</th>
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">Heavy $/ft</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.archCurbRates.map((rate, i) => (
                    <tr key={rate.name} className="border-b border-border/50">
                      <td className="py-2 pr-4 text-card-foreground font-medium">{rate.name}</td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={rate.standard.toFixed(2)}
                            onChange={(e) => {
                              const updated = [...settings.archCurbRates];
                              updated[i] = { ...updated[i], standard: parseFloat(e.target.value) || 0 };
                              updateSettings({ archCurbRates: updated });
                            }}
                            className="w-24 bg-white border-border text-card-foreground"
                          />
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={rate.heavy.toFixed(2)}
                            onChange={(e) => {
                              const updated = [...settings.archCurbRates];
                              updated[i] = { ...updated[i], heavy: parseFloat(e.target.value) || 0 };
                              updateSettings({ archCurbRates: updated });
                            }}
                            className="w-24 bg-white border-border text-card-foreground"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Architectural Minimum */}
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Minimum Price</h3>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-card-foreground w-44">Total Minimum Price</Label>
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                step="0.01"
                value={settings.archMinPrice}
                onChange={(e) => updateSettings({ archMinPrice: parseFloat(e.target.value) || 0 })}
                className="w-28 bg-white border-border text-card-foreground"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground space-y-0.5">
              <span className="font-medium">Notes:</span> No story modifiers apply. No other fees or modifiers. Surface types can be left empty (0 or blank). Users can add multiple architectural areas.
            </p>
          </div>
        </CollapsibleSettingsSection>

        {/* Paver Maintenance */}
        <PaverMaintenanceSettings />

        {/* Surface Sealing */}
        <CollapsibleSettingsSection
          title="Surface Sealing Settings"
          tooltip={
            <CalcInfoTooltip>
              <p className="text-xs font-medium mb-1">Surface Sealing Price Calculation:</p>
              <p className="text-xs mb-1">For each selected surface:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-xs">
                <li>Base = SqFt × Price Per SqFt</li>
                <li>Apply Minimum: max(Base, Minimum Price)</li>
              </ol>
              <p className="text-xs mt-1.5">Each surface is calculated independently.</p>
              <p className="text-xs">Multiple surfaces can be selected and each adds to bundle separately.</p>
            </CalcInfoTooltip>
          }
        >
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Surface Type Pricing</h3>
            {settings.surfaceSealingRates.map((rate, i) => (
              <div key={rate.name} className="space-y-3 border-b border-border/50 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                <h4 className="text-sm font-semibold text-card-foreground">{rate.name}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-card-foreground w-40">Price Per SqFt</Label>
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={rate.pricePerSqft.toFixed(2)}
                      onChange={(e) => {
                        const updated = [...settings.surfaceSealingRates];
                        updated[i] = { ...updated[i], pricePerSqft: parseFloat(e.target.value) || 0 };
                        updateSettings({ surfaceSealingRates: updated });
                      }}
                      className="w-28 bg-white border-border text-card-foreground"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-card-foreground w-40">Minimum Price</Label>
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={rate.minPrice}
                      onChange={(e) => {
                        const updated = [...settings.surfaceSealingRates];
                        updated[i] = { ...updated[i], minPrice: parseFloat(e.target.value) || 0 };
                        updateSettings({ surfaceSealingRates: updated });
                      }}
                      className="w-28 bg-white border-border text-card-foreground"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSettingsSection>

        {/* Fence Cleaning */}
        <CollapsibleSettingsSection
          title="Fence Cleaning Settings"
          tooltip={
            <CalcInfoTooltip>
              <p className="text-xs font-medium mb-1">Fence Cleaning Price Calculation:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-xs">
                <li>Panels: Linear Ft × Rate (based on panel material + stain level)</li>
                <li>Rails: Linear Ft × Rate (based on rail material + stain level)</li>
                <li>Subtotal: Panels + Rails</li>
                <li>Apply minimum: max(Subtotal, Minimum Price)</li>
              </ol>
              <p className="text-xs mt-2 font-medium">Example:</p>
              <ul className="text-xs space-y-0.5 ml-2">
                <li>• Panel: Wood Panel, Heavy, 100 ft → 100 × $5.00 = $500</li>
                <li>• Rail: Wood Rail, Standard, 50 ft → 50 × $4.00 = $200</li>
                <li>• Subtotal: $700</li>
                <li>• Minimum: max($700, $349) = $700</li>
                <li>• Final: $700.00</li>
              </ul>
            </CalcInfoTooltip>
          }
        >
          {/* Fence Rates Table */}
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Fence Type Pricing</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Type</th>
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">Standard $/ft</th>
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">Heavy $/ft</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.fenceRates.map((rate, i) => (
                    <tr key={rate.name} className="border-b border-border/50">
                      <td className="py-2 pr-4 text-card-foreground font-medium">{rate.name}</td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={rate.standard.toFixed(2)}
                            onChange={(e) => {
                              const updated = [...settings.fenceRates];
                              updated[i] = { ...updated[i], standard: parseFloat(e.target.value) || 0 };
                              updateSettings({ fenceRates: updated });
                            }}
                            className="w-24 bg-white border-border text-card-foreground"
                          />
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={rate.heavy.toFixed(2)}
                            onChange={(e) => {
                              const updated = [...settings.fenceRates];
                              updated[i] = { ...updated[i], heavy: parseFloat(e.target.value) || 0 };
                              updateSettings({ fenceRates: updated });
                            }}
                            className="w-24 bg-white border-border text-card-foreground"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fence Minimum */}
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Minimum Price</h3>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-card-foreground w-44">Total Minimum Price</Label>
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                step="0.01"
                value={settings.fenceMinPrice}
                onChange={(e) => updateSettings({ fenceMinPrice: parseFloat(e.target.value) || 0 })}
                className="w-28 bg-white border-border text-card-foreground"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Notes:</span> No story modifiers apply. Panel and rail can use different materials. Stain level applies to both panel and rail.
            </p>
          </div>
        </CollapsibleSettingsSection>

        {/* Deck Cleaning */}
        <DeckCleaningSettings />

        {/* Outdoor Furniture Shrink Wrapping */}
        <ShrinkWrappingSettings />

        {/* Widget Pricing Tiers */}
        <CollapsibleSettingsSection title="Widget Pricing Tiers" defaultOpen={false}>
          <WidgetPricingSettings />
        </CollapsibleSettingsSection>
      </div>
  );
};

const SettingsPanel = ({ onClose }: SettingsPanelProps) => {
  const { isSaving, saveError } = usePricingSettings();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-border px-6 py-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Calculator
        </Button>
        <h1 className="text-lg font-bold text-foreground">Pricing Settings</h1>
        <div className="ml-auto flex items-center gap-2">
          {saveError && (
            <span className="text-xs text-destructive flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {saveError}
            </span>
          )}
          {isSaving && !saveError && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving…
            </span>
          )}
          {!isSaving && !saveError && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-success" /> Saved
            </span>
          )}
        </div>
      </header>
      <SettingsPanelContent />
    </div>
  );
};

const DeckMaterialNotesCollapsible = () => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full group">
        <h3 className="text-sm font-semibold text-card-foreground">Material Notes Reference</h3>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Material</th>
                <th className="text-left py-2 px-4 text-muted-foreground font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {[
                { material: "Exotic Wood", note: "Bid in person. Ask Service Manager for help." },
                { material: "Composite", note: "Soft wash only" },
                { material: "Common Wood", note: "If staining level is heavy, power washing is likely required." },
              ].map(({ material, note }) => (
                <tr key={material} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-card-foreground font-medium">{material}</td>
                  <td className="py-2 px-4 text-card-foreground">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

const DeckCleaningSettings = () => {
  const { settings, updateSettings } = usePricingSettings();

  const updateDeckSurfaceRate = (index: number, field: "standard" | "heavy", value: number) => {
    const updated = [...settings.deckSurfaceRates];
    updated[index] = { ...updated[index], [field]: value };
    updateSettings({ deckSurfaceRates: updated });
  };

  const updateDeckStepRate = (index: number, field: "standard" | "heavy", value: number) => {
    const updated = [...settings.deckStepRates];
    updated[index] = { ...updated[index], [field]: value };
    updateSettings({ deckStepRates: updated });
  };

  const updateDeckRailingRate = (index: number, field: "standard" | "heavy", value: number) => {
    const updated = [...settings.deckRailingRates];
    updated[index] = { ...updated[index], [field]: value };
    updateSettings({ deckRailingRates: updated });
  };

  return (
    <CollapsibleSettingsSection
      title="Deck Cleaning Settings"
      tooltip={
        <CalcInfoTooltip>
          <p className="text-xs font-medium mb-1">Deck Cleaning Price Calculation:</p>
          <ol className="list-decimal list-inside space-y-0.5 text-xs">
            <li>Deck Surface: SqFt × Rate (based on material + stain level)</li>
            <li>If Underside Cleaning requested:
              <ul className="ml-4 mt-0.5 space-y-0.5">
                <li>• Add modifier: Surface × (1 + Underside %)</li>
                <li>• Standard: Surface × 1.50 (50% upcharge)</li>
                <li>• Heavy: Surface × 2.00 (100% upcharge)</li>
              </ul>
            </li>
            <li>Railings: Linear Ft × Rate (based on material + stain level)</li>
            <li>Steps: Quantity × Rate (based on material + stain level)</li>
            <li>Subtotal: Surface (with underside if applicable) + Railings + Steps</li>
            <li>Apply minimum: max(Subtotal, Minimum Price)</li>
          </ol>
          <p className="text-xs mt-2 font-medium">Example:</p>
          <ul className="text-xs space-y-0.5 ml-2">
            <li>• Material: Common Wood, Stain: Heavy</li>
            <li>• Surface: 500 sqft × $0.85 = $425</li>
            <li>• Underside requested: $425 × 2.00 = $850</li>
            <li>• Railings: 100 ft × $6.00 = $600</li>
            <li>• Steps: 10 × $10.00 = $100</li>
            <li>• Subtotal: $850 + $600 + $100 = $1,550</li>
            <li>• Minimum: max($1,550, $349) = $1,550</li>
            <li>• Final: $1,550.00</li>
          </ul>
        </CalcInfoTooltip>
      }
    >
      {/* Deck Surface Pricing */}
      <div>
        <h3 className="text-sm font-semibold text-card-foreground mb-3">Deck Surface Pricing ($/sqft)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Material</th>
                <th className="text-left py-2 px-4 text-muted-foreground font-medium">Standard $/sqft</th>
                <th className="text-left py-2 px-4 text-muted-foreground font-medium">Heavy $/sqft</th>
              </tr>
            </thead>
            <tbody>
              {settings.deckSurfaceRates.map((rate, i) => (
                <tr key={rate.name} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-card-foreground">{rate.name}</td>
                  <td className="py-2 px-4">
                    <Input type="number" step="0.01" value={rate.standard.toFixed(2)} onChange={(e) => updateDeckSurfaceRate(i, "standard", parseFloat(e.target.value) || 0)} className="w-24 bg-white border-border text-card-foreground" />
                  </td>
                  <td className="py-2 px-4">
                    <Input type="number" step="0.01" value={rate.heavy.toFixed(2)} onChange={(e) => updateDeckSurfaceRate(i, "heavy", parseFloat(e.target.value) || 0)} className="w-24 bg-white border-border text-card-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Steps Pricing */}
      <div>
        <h3 className="text-sm font-semibold text-card-foreground mb-3">Steps Pricing ($/step)</h3>
        <p className="text-xs text-muted-foreground mb-2">Note: Exotic Wood uses Common Wood pricing for steps.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Material</th>
                <th className="text-left py-2 px-4 text-muted-foreground font-medium">Standard $/step</th>
                <th className="text-left py-2 px-4 text-muted-foreground font-medium">Heavy $/step</th>
              </tr>
            </thead>
            <tbody>
              {settings.deckStepRates.map((rate, i) => (
                <tr key={rate.name} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-card-foreground">{rate.name}</td>
                  <td className="py-2 px-4">
                    <Input type="number" step="0.01" value={rate.standard.toFixed(2)} onChange={(e) => updateDeckStepRate(i, "standard", parseFloat(e.target.value) || 0)} className="w-24 bg-white border-border text-card-foreground" />
                  </td>
                  <td className="py-2 px-4">
                    <Input type="number" step="0.01" value={rate.heavy.toFixed(2)} onChange={(e) => updateDeckStepRate(i, "heavy", parseFloat(e.target.value) || 0)} className="w-24 bg-white border-border text-card-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Railings Pricing */}
      <div>
        <h3 className="text-sm font-semibold text-card-foreground mb-3">Railings Pricing ($/linear ft)</h3>
        <p className="text-xs text-muted-foreground mb-2">Note: Exotic Wood uses Common Wood pricing for railings.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Material</th>
                <th className="text-left py-2 px-4 text-muted-foreground font-medium">Standard $/ft</th>
                <th className="text-left py-2 px-4 text-muted-foreground font-medium">Heavy $/ft</th>
              </tr>
            </thead>
            <tbody>
              {settings.deckRailingRates.map((rate, i) => (
                <tr key={rate.name} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-card-foreground">{rate.name}</td>
                  <td className="py-2 px-4">
                    <Input type="number" step="0.01" value={rate.standard.toFixed(2)} onChange={(e) => updateDeckRailingRate(i, "standard", parseFloat(e.target.value) || 0)} className="w-24 bg-white border-border text-card-foreground" />
                  </td>
                  <td className="py-2 px-4">
                    <Input type="number" step="0.01" value={rate.heavy.toFixed(2)} onChange={(e) => updateDeckRailingRate(i, "heavy", parseFloat(e.target.value) || 0)} className="w-24 bg-white border-border text-card-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Underside Cleaning Modifier */}
      <div>
        <h3 className="text-sm font-semibold text-card-foreground mb-3">Underside Cleaning Modifier (%)</h3>
        <p className="text-xs text-muted-foreground mb-2">Applies ONLY to deck surface pricing, not railings or steps.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Stain Level</th>
                <th className="text-left py-2 px-4 text-muted-foreground font-medium">Percentage Upcharge</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 text-card-foreground">Standard Stains</td>
                <td className="py-2 px-4">
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={settings.deckUndersideModifier.standard}
                      onChange={(e) => updateSettings({ deckUndersideModifier: { ...settings.deckUndersideModifier, standard: parseFloat(e.target.value) || 0 } })}
                      className="w-24 bg-white border-border text-card-foreground"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 text-card-foreground">Heavy Stains</td>
                <td className="py-2 px-4">
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={settings.deckUndersideModifier.heavy}
                      onChange={(e) => updateSettings({ deckUndersideModifier: { ...settings.deckUndersideModifier, heavy: parseFloat(e.target.value) || 0 } })}
                      className="w-24 bg-white border-border text-card-foreground"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Minimum Price */}
      <div>
        <h3 className="text-sm font-semibold text-card-foreground mb-3">Minimum Price</h3>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-card-foreground w-44">Total Minimum Price</Label>
          <span className="text-sm text-muted-foreground">$</span>
          <Input
            type="number"
            step="0.01"
            value={settings.deckMinPrice}
            onChange={(e) => updateSettings({ deckMinPrice: parseFloat(e.target.value) || 0 })}
            className="w-28 bg-white border-border text-card-foreground"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Minimum applies to the total (surface + railings + steps + underside modifier).</p>
      </div>

      {/* Material Notes */}
      <DeckMaterialNotesCollapsible />

      {/* Notes */}
      <div className="bg-muted/30 rounded-lg p-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Notes:</span> No story modifiers apply. No other fees or modifiers. All components (surface, railings, steps) are optional — can be 0. Single deck area (not multi-area). Underside modifier only applies to deck surface, not railings or steps.
        </p>
      </div>
    </CollapsibleSettingsSection>
  );
};

const ShrinkWrappingSettings = () => {
  const { settings, updateSettings } = usePricingSettings();

  return (
    <CollapsibleSettingsSection title="Outdoor Furniture Shrink Wrapping Settings">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm text-card-foreground w-40">Large Piece Price</Label>
          <span className="text-sm text-muted-foreground">$</span>
          <Input
            type="number"
            step="0.01"
            value={settings.shrinkWrapLargePiecePrice}
            onChange={(e) => updateSettings({ shrinkWrapLargePiecePrice: parseFloat(e.target.value) || 0 })}
            className="w-28 bg-white border-border text-card-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-card-foreground w-40">Small Piece Price</Label>
          <span className="text-sm text-muted-foreground">$</span>
          <Input
            type="number"
            step="0.01"
            value={settings.shrinkWrapSmallPiecePrice}
            onChange={(e) => updateSettings({ shrinkWrapSmallPiecePrice: parseFloat(e.target.value) || 0 })}
            className="w-28 bg-white border-border text-card-foreground"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-sm text-card-foreground w-40">Minimum Price</Label>
        <span className="text-sm text-muted-foreground">$</span>
        <Input
          type="number"
          step="0.01"
          value={settings.shrinkWrapMinPrice}
          onChange={(e) => updateSettings({ shrinkWrapMinPrice: parseFloat(e.target.value) || 0 })}
          className="w-28 bg-white border-border text-card-foreground"
        />
      </div>
      <div className="bg-muted/30 rounded-lg p-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Notes:</span> Price is per piece. Large pieces include couches, tables, and lounge chairs. Small pieces include chairs, end tables, and ottomans. If a minimum price is set, the total will not go below that amount.
        </p>
      </div>
    </CollapsibleSettingsSection>
  );
};

const PaverFeaturesCollapsible = () => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full group">
        <h3 className="text-sm font-semibold text-card-foreground">Package Features Reference</h3>
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
                { feature: "One coat of premium Silacast penetrating sealer.", silver: false, gold: false, platinum: true },
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
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            <p><span className="font-semibold text-card-foreground">Silver:</span> Wash only</p>
            <p><span className="font-semibold text-card-foreground">Gold:</span> Wash &amp; sand</p>
            <p><span className="font-semibold text-card-foreground">Platinum:</span> Wash, sand, Silacast seal</p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

const PaverMaintenanceSettings = () => {
  const { settings, updateSettings } = usePricingSettings();

  const paverTierErrors = useMemo(() => validatePaverTiers(settings.paverTiers), [settings.paverTiers]);
  const paverErrorRowIndices = useMemo(() => {
    const set = new Set<number>();
    paverTierErrors.forEach((e) => {
      set.add(e.row);
      if (e.overlapsWithRow !== undefined) set.add(e.overlapsWithRow);
    });
    return set;
  }, [paverTierErrors]);

  const updatePaverTier = (index: number, field: "minSqft" | "maxSqft" | "silver" | "gold" | "platinum", value: number | null) => {
    const updated = [...settings.paverTiers];
    updated[index] = { ...updated[index], [field]: value };
    updateSettings({ paverTiers: updated });
  };

  return (
    <CollapsibleSettingsSection
      title="Paver Maintenance Settings"
      tooltip={
        <CalcInfoTooltip>
          <p className="text-xs font-medium mb-1">Paver Maintenance Price Calculation:</p>
          <ol className="list-decimal list-inside space-y-0.5 text-xs">
            <li>User enters square footage</li>
            <li>System looks up which tier the sqft falls into</li>
            <li>Get the rate ($/sqft) for selected package from that tier</li>
            <li>Calculate: SqFt × Rate</li>
            <li>Apply minimum: max(calculated, minimum for that package)</li>
          </ol>
          <p className="text-xs mt-2 font-medium">Example: 350 sqft, Gold package</p>
          <ul className="text-xs space-y-0.5 ml-2">
            <li>• Falls in tier: 300–399</li>
            <li>• Gold rate: $3.33/sqft</li>
            <li>• Base: 350 × $3.33 = $1,165.50</li>
            <li>• Minimum: max($1,165.50, $1,000) = $1,165.50</li>
            <li>• Final: $1,165.50</li>
          </ul>
        </CalcInfoTooltip>
      }
    >
      {/* Pricing Tiers */}
      <div>
        <h3 className="text-sm font-semibold text-card-foreground mb-3">Pricing Tiers</h3>

        {paverTierErrors.length > 0 ? (
          <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-semibold text-red-700">Pricing matrix has errors</span>
            </div>
            {paverTierErrors.map((err, i) => (
              <p key={i} className="text-xs text-red-600 ml-6">{err.message}</p>
            ))}
          </div>
        ) : (
          <div className="mb-3 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Pricing matrix is valid ✓</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="w-8"></th>
                <th className="text-left py-2 pr-4 text-muted-foreground font-medium">SqFt Low</th>
                <th className="text-left py-2 px-4 text-muted-foreground font-medium">SqFt High</th>
                <th className="text-left py-2 px-4 text-muted-foreground font-medium">Silver $/sqft</th>
                <th className="text-left py-2 px-4 text-muted-foreground font-medium">Gold $/sqft</th>
                <th className="text-left py-2 px-4 text-muted-foreground font-medium">Platinum $/sqft</th>
              </tr>
            </thead>
            <tbody>
              {settings.paverTiers.map((tier, i) => {
                const hasError = paverErrorRowIndices.has(i);
                const isOpenEnded = tier.maxSqft === null;
                return (
                  <tr key={i} className={`border-b ${hasError ? "border-red-300 bg-red-50" : "border-border/50"}`}>
                    <td className="py-2 pr-1 text-center">
                      {hasError && <AlertTriangle className="w-4 h-4 text-red-500 inline" />}
                    </td>
                    <td className="py-2 pr-4">
                      <Input
                        type="number"
                        value={tier.minSqft}
                        onChange={(e) => updatePaverTier(i, "minSqft", parseInt(e.target.value) || 0)}
                        className={`w-24 bg-white text-card-foreground ${hasError ? "border-red-400" : "border-border"}`}
                      />
                    </td>
                    <td className="py-2 px-4">
                      {isOpenEnded ? (
                        <span className="text-sm font-medium text-muted-foreground italic px-2">Above</span>
                      ) : (
                        <Input
                          type="number"
                          value={tier.maxSqft ?? ""}
                          onChange={(e) => updatePaverTier(i, "maxSqft", parseInt(e.target.value) || 0)}
                          className={`w-24 bg-white text-card-foreground ${hasError ? "border-red-400" : "border-border"}`}
                        />
                      )}
                    </td>
                    <td className="py-2 px-4">
                      <Input type="number" step="0.01" value={tier.silver} onChange={(e) => updatePaverTier(i, "silver", parseFloat(e.target.value) || 0)} className="w-24 bg-white border-border text-card-foreground" />
                    </td>
                    <td className="py-2 px-4">
                      <Input type="number" step="0.01" value={tier.gold} onChange={(e) => updatePaverTier(i, "gold", parseFloat(e.target.value) || 0)} className="w-24 bg-white border-border text-card-foreground" />
                    </td>
                    <td className="py-2 px-4">
                      <Input type="number" step="0.01" value={tier.platinum} onChange={(e) => updatePaverTier(i, "platinum", parseFloat(e.target.value) || 0)} className="w-24 bg-white border-border text-card-foreground" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Minimum Prices */}
      <div>
        <h3 className="text-sm font-semibold text-card-foreground mb-3">Minimum Prices</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["silver", "gold", "platinum"] as const).map((pkg) => (
            <div key={pkg} className="flex items-center gap-2">
              <Label className="text-sm text-card-foreground w-28 capitalize">{pkg} Minimum</Label>
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                step="0.01"
                value={settings.paverMinimums[pkg]}
                onChange={(e) => updateSettings({ paverMinimums: { ...settings.paverMinimums, [pkg]: parseFloat(e.target.value) || 0 } })}
                className="w-28 bg-white border-border text-card-foreground"
              />
            </div>
          ))}
        </div>
      </div>

      <PaverFeaturesCollapsible />
    </CollapsibleSettingsSection>
  );
};


const Clean365MaintenanceSettings = () => {
  const { settings, updateSettings } = usePricingSettings();
  const c = settings.clean365;

  const update = (partial: Partial<Clean365Settings>) => {
    updateSettings({ clean365: { ...c, ...partial } });
  };

  const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

  return (
    <CollapsibleSettingsSection title="Clean365 Annual Maintenance Plan Settings">
      {/* Enable toggle */}
      <div className="flex items-center gap-3">
        <Checkbox
          checked={c.enabled}
          onCheckedChange={(v) => update({ enabled: !!v })}
        />
        <Label className="text-sm text-card-foreground">Enable Clean365 Module</Label>
      </div>

      {/* Loss Leader Service Pricing */}
      <div>
        <h3 className="text-sm font-semibold text-card-foreground mb-3">Loss Leader Service Pricing (per visit/service)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-card-foreground w-52">Weed Removal (per visit)</Label>
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                step="0.01"
                min={0}
                max={9999}
                value={c.weedRemovalPerVisit}
                onChange={(e) => update({ weedRemovalPerVisit: clamp(parseFloat(e.target.value) || 0, 0, 9999) })}
                className="w-28 bg-white border-border text-card-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-1">Occurs 3× per year (Q2, Q3, Q4)</p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-card-foreground w-52">Garbage Cans Cleaned (per visit)</Label>
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                step="0.01"
                min={0}
                max={9999}
                value={c.garbageCansPerVisit}
                onChange={(e) => update({ garbageCansPerVisit: clamp(parseFloat(e.target.value) || 0, 0, 9999) })}
                className="w-28 bg-white border-border text-card-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-1">Occurs 4× per year (every quarter)</p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-card-foreground w-52">Outdoor Upholstery Cleaning</Label>
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                step="0.01"
                min={0}
                max={9999}
                value={c.outdoorUpholsteryCleaning}
                onChange={(e) => update({ outdoorUpholsteryCleaning: clamp(parseFloat(e.target.value) || 0, 0, 9999) })}
                className="w-28 bg-white border-border text-card-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-1">One-time, Q3</p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-card-foreground w-52">Interior High Dusting</Label>
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                step="0.01"
                min={0}
                max={9999}
                value={c.interiorHighDusting}
                onChange={(e) => update({ interiorHighDusting: clamp(parseFloat(e.target.value) || 0, 0, 9999) })}
                className="w-28 bg-white border-border text-card-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-1">One-time, Q1</p>
          </div>
        </div>
      </div>

      {/* Roof Cleaning Annual Maintenance Modifier */}
      <div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-card-foreground w-52">Roof Cleaning Annual Maintenance Modifier</Label>
          <Input
            type="number"
            step="1"
            min={0}
            max={100}
            value={c.roofCleaningModifier}
            onChange={(e) => update({ roofCleaningModifier: clamp(parseFloat(e.target.value) || 0, 0, 100) })}
            className="w-20 bg-white border-border text-card-foreground"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 ml-1">
          Annual roof maintenance is faster than initial deep cleaning. This percentage applies to the base roof cleaning price for Clean365 calculations.
        </p>
      </div>

      {/* Annual Plan Discount */}
      <div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-card-foreground w-52">Clean365 Annual Plan Discount</Label>
          <Input
            type="number"
            step="1"
            min={0}
            max={100}
            value={c.discountPercent}
            onChange={(e) => update({ discountPercent: clamp(parseFloat(e.target.value) || 0, 0, 100) })}
            className="w-20 bg-white border-border text-card-foreground"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 ml-1">Applied to the à la carte total to calculate the annual plan price.</p>
      </div>
    </CollapsibleSettingsSection>
  );
};

export default SettingsPanel;
