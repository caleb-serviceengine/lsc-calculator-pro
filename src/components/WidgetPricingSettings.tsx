import { useEffect, useState } from "react";
import { Trash2, Plus, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  WidgetPricingTier,
  SERVICE_IDS,
  SERVICE_LABELS,
  ServiceId,
} from "@/lib/widgetPricingTypes";

type DraftTier = Omit<WidgetPricingTier, "id" | "created_at" | "updated_at"> & {
  id?: number;
  _key: string; // stable local key for React
  _deleted?: boolean;
};

let _keyCounter = 0;
function nextKey() {
  return `t${++_keyCounter}`;
}

function blankTier(serviceId: ServiceId): DraftTier {
  return { _key: nextKey(), service_id: serviceId, min_sqft: 0, max_sqft: 0, low_price: 0, high_price: 0 };
}

export default function WidgetPricingSettings() {
  const [tiers, setTiers] = useState<DraftTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("widget_pricing_tiers")
        .select("*")
        .order("service_id, min_sqft");
      if (error) {
        setSaveError("Failed to load widget pricing tiers: " + error.message);
      } else {
        setTiers((data || []).map((t) => ({ ...t, _key: nextKey() })));
      }
      setLoading(false);
    }
    load();
  }, []);

  function updateTier(key: string, field: keyof DraftTier, value: number) {
    setTiers((prev) =>
      prev.map((t) => (t._key === key ? { ...t, [field]: value } : t))
    );
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[`${key}-${field}`];
      return next;
    });
    setSaved(false);
  }

  function addTier(serviceId: ServiceId) {
    setTiers((prev) => [...prev, blankTier(serviceId)]);
    setSaved(false);
  }

  function removeTier(key: string) {
    setTiers((prev) =>
      prev.map((t) => (t._key === key ? { ...t, _deleted: true } : t))
    );
    setSaved(false);
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    const active = tiers.filter((t) => !t._deleted);
    for (const t of active) {
      if (t.min_sqft >= t.max_sqft) {
        errors[`${t._key}-max_sqft`] = "Max must be greater than min";
      }
      if (t.low_price > t.high_price) {
        errors[`${t._key}-high_price`] = "High price must be ≥ low price";
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);

    const toDelete = tiers.filter((t) => t._deleted && t.id !== undefined);
    const toUpsert = tiers
      .filter((t) => !t._deleted)
      .map(({ _key, _deleted, ...rest }) => rest);

    try {
      if (toDelete.length > 0) {
        const ids = toDelete.map((t) => t.id as number);
        const { error } = await supabase
          .from("widget_pricing_tiers")
          .delete()
          .in("id", ids);
        if (error) throw error;
      }

      const toInsert = toUpsert.filter((t) => !t.id).map(({ id, ...rest }) => rest);
      const toUpdate = toUpsert.filter((t) => !!t.id);

      if (toInsert.length > 0) {
        const { error } = await supabase.from("widget_pricing_tiers").insert(toInsert);
        if (error) throw error;
      }

      for (const { id, ...fields } of toUpdate) {
        const { error } = await supabase
          .from("widget_pricing_tiers")
          .update(fields)
          .eq("id", id as number);
        if (error) throw error;
      }

      // Reload to get server-assigned IDs
      const { data, error: loadError } = await supabase
        .from("widget_pricing_tiers")
        .select("*")
        .order("service_id, min_sqft");
      if (loadError) throw loadError;
      setTiers((data || []).map((t) => ({ ...t, _key: nextKey() })));
      setSaved(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message
        : (err !== null && typeof err === "object" && "message" in err)
          ? String((err as { message: unknown }).message)
          : String(err);
      setSaveError("Save failed: " + msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading widget pricing tiers…
      </div>
    );
  }

  const activeTiers = tiers.filter((t) => !t._deleted);
  const hasChanges = tiers.some((t) => t._deleted) || tiers.some((t) => !t.id);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Define low/high price ranges per service and square footage bracket. The website widget looks up and displays these prices directly.
      </p>

      {SERVICE_IDS.map((serviceId) => {
        const serviceTiers = activeTiers.filter((t) => t.service_id === serviceId);
        return (
          <div key={serviceId} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-card-foreground">
                {SERVICE_LABELS[serviceId]}
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTier(serviceId)}
                className="h-7 px-2 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Tier
              </Button>
            </div>

            {serviceTiers.length === 0 ? (
              <p className="text-xs text-muted-foreground italic pl-1">No tiers defined — widget will fall back to formula-based pricing.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-1.5 pr-3 text-xs font-medium text-muted-foreground">Min sqft</th>
                      <th className="text-left py-1.5 px-3 text-xs font-medium text-muted-foreground">Max sqft</th>
                      <th className="text-left py-1.5 px-3 text-xs font-medium text-muted-foreground">Low $</th>
                      <th className="text-left py-1.5 px-3 text-xs font-medium text-muted-foreground">High $</th>
                      <th className="py-1.5 w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {serviceTiers.map((tier) => (
                      <tr key={tier._key} className="border-b border-border/40">
                        <td className="py-1.5 pr-3">
                          <Input
                            type="number"
                            min={0}
                            value={tier.min_sqft}
                            onChange={(e) => updateTier(tier._key, "min_sqft", parseInt(e.target.value) || 0)}
                            className="w-24 h-7 text-sm bg-white border-border"
                          />
                        </td>
                        <td className="py-1.5 px-3">
                          <div>
                            <Input
                              type="number"
                              min={0}
                              value={tier.max_sqft}
                              onChange={(e) => updateTier(tier._key, "max_sqft", parseInt(e.target.value) || 0)}
                              className={`w-24 h-7 text-sm bg-white border-border ${validationErrors[`${tier._key}-max_sqft`] ? "border-destructive" : ""}`}
                            />
                            {validationErrors[`${tier._key}-max_sqft`] && (
                              <p className="text-xs text-destructive mt-0.5">{validationErrors[`${tier._key}-max_sqft`]}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-1.5 px-3">
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={tier.low_price}
                            onChange={(e) => updateTier(tier._key, "low_price", parseFloat(e.target.value) || 0)}
                            className="w-24 h-7 text-sm bg-white border-border"
                          />
                        </td>
                        <td className="py-1.5 px-3">
                          <div>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              value={tier.high_price}
                              onChange={(e) => updateTier(tier._key, "high_price", parseFloat(e.target.value) || 0)}
                              className={`w-24 h-7 text-sm bg-white border-border ${validationErrors[`${tier._key}-high_price`] ? "border-destructive" : ""}`}
                            />
                            {validationErrors[`${tier._key}-high_price`] && (
                              <p className="text-xs text-destructive mt-0.5">{validationErrors[`${tier._key}-high_price`]}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-1.5 pl-3">
                          <button
                            type="button"
                            onClick={() => removeTier(tier._key)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Remove tier"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
          size="sm"
        >
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : "Save Tiers"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            Saved
          </span>
        )}
        {saveError && (
          <p className="text-sm text-destructive">{saveError}</p>
        )}
      </div>
    </div>
  );
}
