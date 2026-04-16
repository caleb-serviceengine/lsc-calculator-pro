import { Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface PropertySpecsProps {
  sqft: string;
  onSqftChange: (val: string) => void;
  twoStory: boolean;
  onTwoStoryChange: (val: boolean) => void;
  threeStory: boolean;
  onThreeStoryChange: (val: boolean) => void;
  detachedGarage: boolean;
  onDetachedGarageChange: (val: boolean) => void;
}

const PropertySpecs = ({
  sqft,
  onSqftChange,
  twoStory,
  onTwoStoryChange,
  threeStory,
  onThreeStoryChange,
  detachedGarage,
  onDetachedGarageChange,
}: PropertySpecsProps) => {
  const numericSqft = parseFloat(sqft) || 0;
  const sliderValue = Math.min(numericSqft, 5000);

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-primary/10">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-card-foreground">
          Property Specs
        </h2>
      </div>

      <div className="space-y-5">
        <div>
          <Label htmlFor="sqft" className="text-sm font-medium text-card-foreground mb-1.5 block">
            Building Square Footage
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id="sqft"
              type="number"
              placeholder="e.g. 2400"
              value={sqft}
              onChange={(e) => onSqftChange(e.target.value)}
              className="bg-white border-border text-card-foreground placeholder:text-muted-foreground w-32"
            />
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">sqft</span>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-muted-foreground w-6">0</span>
            <Slider
              value={[sliderValue]}
              onValueChange={([v]) => onSqftChange(v > 0 ? String(v) : "")}
              min={0}
              max={5000}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">5,000+</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="twoStory"
              checked={twoStory}
              onCheckedChange={(c) => onTwoStoryChange(c === true)}
            />
            <Label htmlFor="twoStory" className="text-sm text-card-foreground cursor-pointer">
              2 Story
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="threeStory"
              checked={threeStory}
              onCheckedChange={(c) => onThreeStoryChange(c === true)}
            />
            <Label htmlFor="threeStory" className="text-sm text-card-foreground cursor-pointer">
              3+ Story / 40' Ladder
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="detachedGarage"
              checked={detachedGarage}
              onCheckedChange={(c) => onDetachedGarageChange(c === true)}
            />
            <Label htmlFor="detachedGarage" className="text-sm text-card-foreground cursor-pointer">
              Detached Garage
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySpecs;
