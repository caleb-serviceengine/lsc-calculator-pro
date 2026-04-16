import { useState } from "react";
import { Building2, Plus, X, ChevronDown, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePricingSettings } from "@/contexts/PricingSettingsContext";

export interface ArchSurface {
  material: string;
  value: string; // sqft or linear ft
  stain: "Standard" | "Heavy";
}

export interface ArchArea {
  id: number;
  label: string;
  open: boolean;
  verticalWalls: ArchSurface;
  ballustrades: ArchSurface;
  curbs: ArchSurface;
}

interface ArchitecturalPowerWashingSectionProps {
  areas: ArchArea[];
  onAreasChange: (areas: ArchArea[]) => void;
  addToBundle: boolean;
  onAddToBundleChange: (v: boolean) => void;
}

const MATERIALS = ["Natural Stone/Pre-Cast", "Concrete", "Block/Brick"];

const calcSurfacePrice = (
  value: string,
  material: string,
  stain: "Standard" | "Heavy",
  rates: { name: string; standard: number; heavy: number }[]
): number => {
  const v = parseFloat(value) || 0;
  if (v <= 0 || !material) return 0;
  const rate = rates.find((r) => r.name === material);
  if (!rate) return 0;
  return v * (stain === "Heavy" ? rate.heavy : rate.standard);
};

const ArchitecturalPowerWashingSection = ({
  areas,
  onAreasChange,
  addToBundle,
  onAddToBundleChange,
}: ArchitecturalPowerWashingSectionProps) => {
  const { settings } = usePricingSettings();
  const [nextId, setNextId] = useState(1);

  const addArea = () => {
    const newArea: ArchArea = {
      id: nextId,
      label: "",
      open: true,
      verticalWalls: { material: MATERIALS[0], value: "", stain: "Standard" },
      ballustrades: { material: MATERIALS[0], value: "", stain: "Standard" },
      curbs: { material: MATERIALS[0], value: "", stain: "Standard" },
    };
    setNextId((p) => p + 1);
    onAreasChange([...areas, newArea]);
  };

  const updateArea = (id: number, partial: Partial<ArchArea>) => {
    onAreasChange(areas.map((a) => (a.id === id ? { ...a, ...partial } : a)));
  };

  const removeArea = (id: number) => {
    onAreasChange(areas.filter((a) => a.id !== id));
  };

  const getAreaTotal = (area: ArchArea): number => {
    const vw = calcSurfacePrice(area.verticalWalls.value, area.verticalWalls.material, area.verticalWalls.stain, settings.archVerticalWallRates);
    const bl = calcSurfacePrice(area.ballustrades.value, area.ballustrades.material, area.ballustrades.stain, settings.archBallustradeRates);
    const cb = calcSurfacePrice(area.curbs.value, area.curbs.material, area.curbs.stain, settings.archCurbRates);
    return vw + bl + cb;
  };

  const rawGrandTotal = areas.reduce((acc, a) => acc + getAreaTotal(a), 0);
  const grandTotal = rawGrandTotal > 0 ? Math.max(rawGrandTotal, settings.archMinPrice) : 0;
  const isMinApplied = rawGrandTotal > 0 && rawGrandTotal < settings.archMinPrice;

  const renderSurfaceRow = (
    area: ArchArea,
    surfaceKey: "verticalWalls" | "ballustrades" | "curbs",
    label: string,
    unitLabel: string,
    rates: { name: string; standard: number; heavy: number }[]
  ) => {
    const surface = area[surfaceKey];
    const price = calcSurfacePrice(surface.value, surface.material, surface.stain, rates);

    return (
      <div key={surfaceKey} className="grid grid-cols-[1fr_1fr_80px_100px_80px] gap-2 items-center">
        <span className="text-sm font-medium text-card-foreground">{label}</span>
        <Select
          value={surface.material}
          onValueChange={(v) =>
            updateArea(area.id, { [surfaceKey]: { ...surface, material: v } })
          }
        >
          <SelectTrigger className="h-8 bg-white border-border text-card-foreground text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MATERIALS.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="0"
          value={surface.value}
          onChange={(e) =>
            updateArea(area.id, { [surfaceKey]: { ...surface, value: e.target.value } })
          }
          className="h-8 bg-white border-border text-card-foreground text-sm"
        />
        <Select
          value={surface.stain}
          onValueChange={(v) =>
            updateArea(area.id, { [surfaceKey]: { ...surface, stain: v as "Standard" | "Heavy" } })
          }
        >
          <SelectTrigger className="h-8 bg-white border-border text-card-foreground text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Standard">Standard</SelectItem>
            <SelectItem value="Heavy">Heavy</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm font-bold text-card-foreground text-right">${price.toFixed(2)}</span>
      </div>
    );
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 rounded-lg bg-primary/10">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-card-foreground">
          Power Washing — Architectural
        </h2>
      </div>
      <p className="text-xs text-muted-foreground mb-5 ml-12">
        Minimum total price ${settings.archMinPrice.toFixed(0)}. Add areas below.
      </p>

      {areas.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No areas added yet. Click "Add Architectural Area" to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {areas.map((area, idx) => {
            const areaTotal = getAreaTotal(area);
            return (
              <Collapsible
                key={area.id}
                open={area.open}
                onOpenChange={(open) => updateArea(area.id, { open })}
              >
                <div className="border border-border rounded-lg overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2">
                        {area.open ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="font-medium text-card-foreground text-sm">
                          Area {idx + 1}{area.label ? ` — ${area.label}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-primary">
                          ${areaTotal.toFixed(2)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeArea(area.id);
                          }}
                          className="text-destructive hover:text-destructive/80 transition-colors p-1"
                          title="Remove area"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 py-4 space-y-4">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Area Label</label>
                        <Input
                          placeholder="e.g. Front Entrance"
                          value={area.label}
                          onChange={(e) => updateArea(area.id, { label: e.target.value })}
                          className="h-8 bg-white border-border text-card-foreground text-sm max-w-xs"
                        />
                      </div>

                      {/* Column headers */}
                      <div className="grid grid-cols-[1fr_1fr_80px_100px_80px] gap-2 text-xs text-muted-foreground font-medium">
                        <span>Surface</span>
                        <span>Material</span>
                        <span>Qty</span>
                        <span>Stain</span>
                        <span className="text-right">Price</span>
                      </div>

                      {renderSurfaceRow(area, "verticalWalls", "Vertical Walls (sqft)", "sqft", settings.archVerticalWallRates)}
                      {renderSurfaceRow(area, "ballustrades", "Ballustrades (lin ft)", "ft", settings.archBallustradeRates)}
                      {renderSurfaceRow(area, "curbs", "Curbs (lin ft)", "ft", settings.archCurbRates)}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}

          {/* Grand total */}
          {grandTotal > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-muted/20 rounded-lg border border-border">
              <div>
                <span className="font-semibold text-card-foreground text-sm">Grand Total</span>
                {isMinApplied && (
                  <span className="block text-xs text-muted-foreground">
                    Minimum applied (was ${rawGrandTotal.toFixed(2)})
                  </span>
                )}
              </div>
              <span className="text-base font-bold text-primary">${grandTotal.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <Button variant="outline" size="sm" onClick={addArea}>
          <Plus className="w-4 h-4 mr-1" />
          Add Architectural Area
        </Button>
        {grandTotal > 0 && (
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={addToBundle}
              onCheckedChange={(v) => onAddToBundleChange(!!v)}
            />
            <span className="text-sm font-medium text-card-foreground">Add to Bundle</span>
          </label>
        )}
      </div>
    </div>
  );
};

export default ArchitecturalPowerWashingSection;
