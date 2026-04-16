import { useState } from "react";
import { ShieldCheck, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ProductCardProps {
  name: string;
  helperText: string;
  price: number;
  selected: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
}

const ProductCard = ({ name, helperText, price, selected, onSelect, children }: ProductCardProps) => {
  const borderClass = selected
    ? "border-primary ring-2 ring-primary/30 bg-primary/5"
    : "border-border hover:border-primary/40 bg-white";

  return (
    <button
      onClick={onSelect}
      className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all cursor-pointer ${borderClass}`}
    >
      {/* Radio indicator */}
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? "border-primary" : "border-muted-foreground/40"}`}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
      </div>
      <span className="text-sm font-semibold text-card-foreground">{name}</span>
      {children}
      <span className="text-xl font-bold text-primary">${price.toFixed(2)}</span>
      <span className="text-xs text-muted-foreground text-center leading-relaxed">{helperText}</span>
    </button>
  );
};

interface GutterProtectionSectionProps {
  linearFeet: string;
  onLinearFeetChange: (val: string) => void;
  downspouts: string;
  onDownspoutsChange: (val: string) => void;
  gutterStickQty: string;
  onGutterStickQtyChange: (val: string) => void;
  selectedProduct: string | null;
  onSelectProduct: (product: string | null) => void;
  prices: { raindrop: number; flowguard: number; gutterStick: number };
}

const GutterProtectionSection = ({
  linearFeet,
  onLinearFeetChange,
  downspouts,
  onDownspoutsChange,
  gutterStickQty,
  onGutterStickQtyChange,
  selectedProduct,
  onSelectProduct,
  prices,
}: GutterProtectionSectionProps) => {
  return (
    <section className="bg-card rounded-xl p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-card-foreground">
            Gutter Protection
          </h2>
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-card-foreground mb-1.5 block">
            LINEAR FEET OF GUTTER
          </Label>
          <Input
            type="number"
            placeholder="0"
            value={linearFeet}
            onChange={(e) => onLinearFeetChange(e.target.value)}
            className="bg-white border-border text-card-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-card-foreground mb-1.5 block">
            NUMBER OF DOWNSPOUTS
          </Label>
          <Input
            type="number"
            placeholder="0"
            value={downspouts}
            onChange={(e) => onDownspoutsChange(e.target.value)}
            className="bg-white border-border text-card-foreground"
          />
          
        </div>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ProductCard
          name="Raindrop"
          helperText="Includes: Best GC Package • Lifetime Warranty • Maximum Drainage • Self-Cleaning Design"
          price={prices.raindrop}
          selected={selectedProduct === "raindrop"}
          onSelect={() => onSelectProduct(selectedProduct === "raindrop" ? null : "raindrop")}
        />
        <ProductCard
          name="FlowGuard"
          helperText="Includes: Best GC Package • Lifetime Warranty • Downspout Clog Prevention"
          price={prices.flowguard}
          selected={selectedProduct === "flowguard"}
          onSelect={() => onSelectProduct(selectedProduct === "flowguard" ? null : "flowguard")}
        />
        <ProductCard
          name="Gutter Stick"
          helperText="Basic Clog Prevention - Lifetime Warranty"
          price={prices.gutterStick}
          selected={selectedProduct === "gutterstick"}
          onSelect={() => onSelectProduct(selectedProduct === "gutterstick" ? null : "gutterstick")}
        >
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Label className="text-xs text-muted-foreground">Qty:</Label>
            <Input
              type="number"
              placeholder="0"
              value={gutterStickQty}
              onChange={(e) => onGutterStickQtyChange(e.target.value)}
              className="w-20 h-8 text-sm bg-white border-border text-card-foreground"
            />
          </div>
        </ProductCard>
      </div>

      {/* Product Features Reference */}
      <ProductFeaturesCollapsible />
    </section>
  );
};

const ProductFeaturesCollapsible = () => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full group">
        <h3 className="text-sm font-semibold text-card-foreground">Product Features Reference</h3>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Feature</th>
                <th className="text-center py-2 px-4 text-muted-foreground font-medium">Raindrop</th>
                <th className="text-center py-2 px-4 text-muted-foreground font-medium">FlowGuard</th>
                <th className="text-center py-2 px-4 text-muted-foreground font-medium">Gutter Stick</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Best Gutter Cleaning Package Included", raindrop: true, flowguard: true, stick: true },
                { feature: "Lifetime Transferrable Warranty", raindrop: true, flowguard: true, stick: true },
                { feature: "Downspout Clog Prevention", raindrop: true, flowguard: true, stick: true },
                { feature: "Covers Entire Tray", raindrop: true, flowguard: true, stick: false },
                { feature: "Blocks Leaves, Twigs, Needles & Seeds", raindrop: true, flowguard: true, stick: false },
                { feature: "Maximum Drainage Capacity", raindrop: true, flowguard: false, stick: false },
                { feature: "Self Cleaning Design", raindrop: true, flowguard: false, stick: false },
                { feature: "Ultra-low Maintenance", raindrop: true, flowguard: false, stick: false },
              ].map(({ feature, raindrop, flowguard, stick }) => (
                <tr key={feature} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-card-foreground">{feature}</td>
                  <td className="py-2 px-4 text-center">{raindrop ? <span className="text-green-600 font-bold">✓</span> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="py-2 px-4 text-center">{flowguard ? <span className="text-green-600 font-bold">✓</span> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="py-2 px-4 text-center">{stick ? <span className="text-green-600 font-bold">✓</span> : <span className="text-muted-foreground">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default GutterProtectionSection;
