import { Package } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { usePricingSettings } from "@/contexts/PricingSettingsContext";

interface OutdoorFurnitureShrinkWrappingSectionProps {
  largePieces: number;
  onLargePiecesChange: (v: number) => void;
  smallPieces: number;
  onSmallPiecesChange: (v: number) => void;
  price: number;
  addToBundle: boolean;
  onAddToBundleChange: (v: boolean) => void;
}

const Counter = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex items-center justify-between">
    <label className="text-sm font-medium text-card-foreground">{label}</label>
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="px-3 py-1 rounded bg-muted/50 text-card-foreground hover:bg-muted transition-colors font-medium"
      >
        −
      </button>
      <span className="w-12 text-center font-bold text-card-foreground">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="px-3 py-1 rounded bg-muted/50 text-card-foreground hover:bg-muted transition-colors font-medium"
      >
        +
      </button>
    </div>
  </div>
);

const OutdoorFurnitureShrinkWrappingSection = ({
  largePieces,
  onLargePiecesChange,
  smallPieces,
  onSmallPiecesChange,
  price,
  addToBundle,
  onAddToBundleChange,
}: OutdoorFurnitureShrinkWrappingSectionProps) => {
  const { settings } = usePricingSettings();

  const largeTotal = largePieces * settings.shrinkWrapLargePiecePrice;
  const smallTotal = smallPieces * settings.shrinkWrapSmallPiecePrice;

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 rounded-lg bg-primary/10">
          <Package className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-card-foreground">
          Outdoor Furniture Shrink Wrapping
        </h2>
      </div>
      <p className="text-xs text-muted-foreground mb-5 ml-12">
        Protect your outdoor furniture from winter weather damage
      </p>

      <div className="space-y-4 mb-6">
        <Counter
          label="Large Pieces (Couch, Table, Lounge Chair)"
          value={largePieces}
          onChange={onLargePiecesChange}
        />
        <Counter
          label="Small Pieces (Chair, End Table, Ottoman)"
          value={smallPieces}
          onChange={onSmallPiecesChange}
        />
      </div>

      {price > 0 && (
        <>
          <div className="bg-muted/30 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Large Pieces ({largePieces} × ${settings.shrinkWrapLargePiecePrice.toFixed(2)})
              </span>
              <span className="text-sm font-bold text-card-foreground">${largeTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Small Pieces ({smallPieces} × ${settings.shrinkWrapSmallPiecePrice.toFixed(2)})
              </span>
              <span className="text-sm font-bold text-card-foreground">${smallTotal.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-card-foreground">Total</span>
                <span className="text-lg font-bold text-primary">${price.toFixed(2)}</span>
              </div>
              {settings.shrinkWrapMinPrice > 0 && price === settings.shrinkWrapMinPrice && (largeTotal + smallTotal) < settings.shrinkWrapMinPrice && (
                <p className="text-xs text-muted-foreground mt-1">Minimum price applied</p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={addToBundle}
              onCheckedChange={(v) => onAddToBundleChange(!!v)}
            />
            <span className="text-sm font-medium text-card-foreground">Add to Bundle</span>
          </label>
        </>
      )}
    </div>
  );
};

export default OutdoorFurnitureShrinkWrappingSection;
