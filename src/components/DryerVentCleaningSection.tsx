import { Fan, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface DryerVentCleaningSectionProps {
  quantity: string;
  onQuantityChange: (val: string) => void;
  selected: boolean;
  onSelectedChange: (val: boolean) => void;
  price: number;
}

const DryerVentCleaningSection = ({
  quantity,
  onQuantityChange,
  selected,
  onSelectedChange,
  price,
}: DryerVentCleaningSectionProps) => {
  return (
    <section className="bg-card rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-primary/10">
          <Fan className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-card-foreground">
          Dryer Vent Cleaning
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <Label className="text-sm font-medium text-card-foreground mb-1.5 block">
            QTY
          </Label>
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={quantity}
            onChange={(e) => onQuantityChange(e.target.value)}
            className="bg-white border-border text-card-foreground w-20 text-center"
          />
        </div>

        <div className="flex-1 text-right">
          <Label className="text-sm font-medium text-card-foreground mb-1.5 block">
            PRICE
          </Label>
          <span className="text-xl font-bold text-primary">
            ${price.toFixed(2)}
          </span>
        </div>

        <div className="flex-shrink-0 pt-5">
          <Checkbox
            checked={selected}
            onCheckedChange={(c) => onSelectedChange(c === true)}
          />
          <span className="text-xs text-card-foreground ml-1.5">Add</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        First vent at base price, each additional at reduced rate
      </p>
    </section>
  );
};

export default DryerVentCleaningSection;
