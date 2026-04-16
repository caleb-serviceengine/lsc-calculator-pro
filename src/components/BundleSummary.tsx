import { Receipt, Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useState } from "react";
import SaveBidModal from "./SaveBidModal";
import SellSheetModal from "./SellSheetModal";

interface BundleItem {
  label: string;
  price: number;
}

interface Clean365DataForSellSheet {
  selectedPlan: string;
  aLaCarteTotal: number;
  tiers: { name: string; discountPercent: number; annual: number; monthly: number; savings: number }[];
  propertySpecs: { sqft: number; twoStory: boolean; threeStory: boolean; detachedGarage: boolean };
}

interface BundleSummaryProps {
  items: BundleItem[];
  currentBid?: { bid_id: string; customer_name: string; status: "draft" | "sent" | "won" | "lost" } | null;
  calculatorState?: Record<string, unknown>;
  selectedClean365Plan?: string | null;
  clean365Data?: Clean365DataForSellSheet | null;
}

const BundleSummary = ({ items, currentBid, calculatorState, selectedClean365Plan, clean365Data }: BundleSummaryProps) => {
  const [discountDollar, setDiscountDollar] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [saveBidOpen, setSaveBidOpen] = useState(false);
  const [showSellSheetModal, setShowSellSheetModal] = useState(false);

  const isSellSheetEnabled = !!selectedClean365Plan;

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  const dollarOff = parseFloat(discountDollar) || 0;
  const percentOff = parseFloat(discountPercent) || 0;
  const percentSavings = (subtotal - dollarOff) * (percentOff / 100);
  const totalSavings = Math.max(0, dollarOff + percentSavings);
  const total = Math.max(0, subtotal - totalSavings);

  return (
    <>
      <div className="bg-card rounded-xl p-6 shadow-sm sticky top-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-primary/10">
            <Receipt className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-card-foreground">
            Bundle Summary
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Select services to build your estimate
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-card-foreground">{item.label}</span>
                <span className="font-medium text-card-foreground">
                  ${item.price.toFixed(2)}
                </span>
              </div>
            ))}

            <div className="border-t border-border pt-3 mt-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-card-foreground">${subtotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Final Price Adjustment */}
            <div className="border-t border-border pt-3 space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground tracking-wide block">
                BUNDLE DISCOUNT
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={discountDollar}
                  onChange={(e) => setDiscountDollar(e.target.value)}
                  className="h-8 text-sm bg-white border-border text-card-foreground"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">%</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="h-8 text-sm bg-white border-border text-card-foreground"
                />
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-success">Savings</span>
                  <span className="text-success font-medium">
                    -${totalSavings.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-3">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-card-foreground">
                  GRAND TOTAL
                </span>
                <span className="text-2xl font-extrabold text-primary">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3">
          Lock In Price
        </Button>
        <Button
          variant="outline"
          className="w-full mt-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          onClick={() => setSaveBidOpen(true)}
        >
          <Save className="w-5 h-5" />
          Save Bid
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <span className="w-full mt-3 block">
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isSellSheetEnabled}
                onClick={() => setShowSellSheetModal(true)}
              >
                <FileText className="w-5 h-5" />
                Create Sell Sheet
              </Button>
            </span>
          </TooltipTrigger>
          {!isSellSheetEnabled && (
            <TooltipContent>
              <p>Select a Clean365 plan first</p>
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      <SaveBidModal
        isOpen={saveBidOpen}
        onClose={() => setSaveBidOpen(false)}
        items={items}
        grandTotal={total}
        existingBid={currentBid ?? undefined}
        calculatorState={calculatorState}
      />

      {clean365Data && (
        <SellSheetModal
          isOpen={showSellSheetModal}
          onClose={() => setShowSellSheetModal(false)}
          clean365Data={clean365Data}
          existingBidId={currentBid?.bid_id}
          existingCustomerInfo={currentBid ? { name: currentBid.customer_name } : undefined}
        />
      )}
    </>
  );
};

export default BundleSummary;
