import { useState, useRef, useEffect, useCallback } from "react";
import { SprayCanIcon, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePricingSettings } from "@/contexts/PricingSettingsContext";

export interface FlatworkArea {
  id: number;
  label: string;
  material: string;
  sqft: string;
  stain: "Standard" | "Heavy";
  checked: boolean;
}

const AutoResizeTextarea = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <textarea
      ref={ref}
      placeholder={placeholder}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      rows={1}
      className="flex w-full rounded-md border border-border bg-white px-3 py-1.5 text-sm text-card-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none overflow-hidden min-w-[8rem]"
    />
  );
};

interface FlatworkPowerWashingSectionProps {
  areas: FlatworkArea[];
  onAreasChange: (areas: FlatworkArea[]) => void;
}

const FlatworkPowerWashingSection = ({
  areas,
  onAreasChange,
}: FlatworkPowerWashingSectionProps) => {
  const { settings } = usePricingSettings();
  const [nextId, setNextId] = useState(1);

  const materials = (settings.flatworkRates ?? []).map((r) => r.name);

  const calcRowPrice = (area: FlatworkArea): number => {
    const sq = parseFloat(area.sqft) || 0;
    if (sq <= 0 || !area.material) return 0;
    const rate = (settings.flatworkRates ?? []).find((r) => r.name === area.material);
    if (!rate) return 0;
    return sq * (area.stain === "Heavy" ? rate.heavy : rate.standard);
  };

  const addArea = () => {
    const newArea: FlatworkArea = {
      id: nextId,
      label: "",
      material: materials[0] || "",
      sqft: "",
      stain: "Standard",
      checked: false,
    };
    setNextId((p) => p + 1);
    onAreasChange([...areas, newArea]);
  };

  const updateArea = (id: number, partial: Partial<FlatworkArea>) => {
    onAreasChange(areas.map((a) => (a.id === id ? { ...a, ...partial } : a)));
  };

  const removeArea = (id: number) => {
    onAreasChange(areas.filter((a) => a.id !== id));
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 rounded-lg bg-primary/10">
          <SprayCanIcon className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-card-foreground">
          Power Washing — Flatwork
        </h2>
      </div>
      <p className="text-xs text-muted-foreground mb-5 ml-12">
        Minimum total price set to ${(settings.flatworkMinPrice ?? 349).toFixed(0)}. Adjust in settings.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-2 text-muted-foreground font-medium w-16">Area #</th>
              <th className="text-left py-2 px-2 text-muted-foreground font-medium">Label</th>
              <th className="text-left py-2 px-2 text-muted-foreground font-medium">Material</th>
              <th className="text-left py-2 px-2 text-muted-foreground font-medium w-24">SqFt</th>
              <th className="text-left py-2 px-2 text-muted-foreground font-medium w-28">Stain</th>
              <th className="text-right py-2 px-2 text-muted-foreground font-medium w-24">Price</th>
              <th className="text-center py-2 px-2 text-muted-foreground font-medium w-12">Add</th>
              <th className="text-center py-2 px-1 text-muted-foreground font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {areas.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-muted-foreground text-sm">
                  No areas added yet. Click "Add Area" to get started.
                </td>
              </tr>
            ) : (
              <>
                {areas.map((area, idx) => {
                  const price = calcRowPrice(area);
                  return (
                    <tr
                      key={area.id}
                      className={`border-b border-border/50 ${idx % 2 === 1 ? "bg-muted/20" : ""}`}
                    >
                      <td className="py-2 pr-2 text-card-foreground font-medium">
                        Area {idx + 1}
                      </td>
                      <td className="py-2 px-2">
                        <AutoResizeTextarea
                          placeholder="e.g. Front Porch"
                          value={area.label}
                          onChange={(val) => updateArea(area.id, { label: val })}
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Select
                          value={area.material}
                          onValueChange={(v) => updateArea(area.id, { material: v })}
                        >
                          <SelectTrigger className="h-8 bg-white border-border text-card-foreground text-sm truncate">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {materials.map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          placeholder="0"
                          value={area.sqft}
                          onChange={(e) => updateArea(area.id, { sqft: e.target.value })}
                          className="h-8 w-20 bg-white border-border text-card-foreground text-sm"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Select
                          value={area.stain}
                          onValueChange={(v) =>
                            updateArea(area.id, { stain: v as "Standard" | "Heavy" })
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
                      </td>
                      <td className="py-2 px-2 text-right font-bold text-card-foreground">
                        ${price.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <Checkbox
                          checked={area.checked}
                          onCheckedChange={(c) =>
                            updateArea(area.id, { checked: c === true })
                          }
                        />
                      </td>
                      <td className="py-2 px-1 text-center">
                        <button
                          onClick={() => removeArea(area.id)}
                          className="text-destructive hover:text-destructive/80 transition-colors p-1"
                          title="Remove area"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {(() => {
                  const checkedAreas = areas.filter((a) => a.checked);
                  const rawSum = checkedAreas.reduce((acc, a) => acc + calcRowPrice(a), 0);
                  const minPrice = settings.flatworkMinPrice ?? 349;
                  const adjustedTotal = rawSum > 0 ? Math.max(rawSum, minPrice) : 0;
                  const isMinApplied = rawSum > 0 && rawSum < minPrice;

                  if (checkedAreas.length > 0 && adjustedTotal > 0) {
                    return (
                      <tr className="bg-white border-t-2 border-border">
                        <td colSpan={5} className="py-3 pr-2 text-right font-semibold text-card-foreground">
                          Selected Areas Total
                          {isMinApplied && (
                            <span className="block text-xs font-normal text-muted-foreground">
                              Minimum applied (was ${rawSum.toFixed(2)})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-primary text-base">
                          ${adjustedTotal.toFixed(2)}
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    );
                  }
                  return null;
                })()}
              </>
            )}
          </tbody>
        </table>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={addArea}
        className="mt-4"
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Area
      </Button>
    </div>
  );
};

export default FlatworkPowerWashingSection;
