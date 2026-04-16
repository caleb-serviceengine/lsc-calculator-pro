import { useState } from "react";
import { ChevronRight, Check } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CollapsibleServiceSectionProps {
  title: string;
  price: number;
  isInBundle: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const CollapsibleServiceSection = ({
  title,
  price,
  isInBundle,
  defaultOpen = false,
  children,
}: CollapsibleServiceSectionProps) => {
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
          {!open && price > 0 && (
            <span className="text-sm font-bold text-primary">
              ${price.toFixed(2)}
            </span>
          )}
          {!open && isInBundle && (
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center ml-1">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border border-t-0 border-border rounded-b-xl overflow-hidden">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CollapsibleServiceSection;
