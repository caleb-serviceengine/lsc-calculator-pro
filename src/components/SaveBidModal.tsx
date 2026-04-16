import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BundleItem {
  label: string;
  price: number;
}

interface SaveBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: BundleItem[];
  grandTotal: number;
  existingBid?: {
    bid_id: string;
    customer_name: string;
    status: "draft" | "sent" | "won" | "lost";
  };
  calculatorState?: Record<string, unknown>;
}

const generateBidId = () => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `Q-${randomDigits}`;
};

const SaveBidModal = ({
  isOpen,
  onClose,
  items,
  grandTotal,
  existingBid,
  calculatorState,
}: SaveBidModalProps) => {
  const [bidId, setBidId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [status, setStatus] = useState<"draft" | "sent" | "won" | "lost">("draft");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ customerName?: string }>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (existingBid) {
        setBidId(existingBid.bid_id);
        setCustomerName(existingBid.customer_name);
        setStatus(existingBid.status);
      } else {
        setBidId(generateBidId());
        setCustomerName("");
        setStatus("draft");
      }
      setErrors({});
    }
  }, [isOpen, existingBid]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    const trimmedName = customerName.trim();
    if (!trimmedName) {
      newErrors.customerName = "Customer name is required";
    } else if (trimmedName.length > 100) {
      newErrors.customerName = "Customer name must be less than 100 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    if (!userId) {
      toast.error("You must be logged in to save bids");
      return;
    }

    setLoading(true);
    try {
      const bidData = {
        user_id: userId,
        bid_id: bidId,
        customer_name: customerName.trim(),
        bundle_data: { items, calculatorState } as any,
        total_price: grandTotal,
        status,
        updated_by: userId,
      };

      let error;

      if (existingBid) {
        // On update, don't overwrite the original creator (user_id)
        const { user_id: _creator, ...updateData } = bidData;
        ({ error } = await supabase
          .from("bids" as any)
          .update(updateData)
          .eq("bid_id", existingBid.bid_id)
          .eq("user_id", userId));
      } else {
        ({ error } = await supabase.from("bids" as any).insert(bidData));
      }

      if (error) throw error;

      toast.success(`Bid ${bidId} saved successfully!`);
      onClose();
    } catch (error: any) {
      console.error("Error saving bid:", error);
      toast.error("Failed to save bid: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {existingBid ? "Update Bid" : "Save New Bid"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bidId" className="text-gray-700">Bid ID</Label>
            <Input id="bidId" value={bidId} readOnly className="bg-gray-100 text-gray-900 border-gray-300 cursor-not-allowed" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerName" className="text-gray-700">
              Customer Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customerName"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (errors.customerName) setErrors({ ...errors, customerName: undefined });
              }}
              className={`bg-white text-gray-900 border-gray-300 ${errors.customerName ? "border-destructive" : ""}`}
              disabled={loading}
              maxLength={100}
            />
            {errors.customerName && (
              <p className="text-sm text-destructive">{errors.customerName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-gray-700">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as "draft" | "sent" | "won" | "lost")}
              disabled={loading}
            >
              <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-gray-900">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-2">
            <p className="text-sm font-medium text-gray-600">Bid Summary</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {items.length} service{items.length !== 1 ? "s" : ""} selected
              </span>
              <span className="text-lg font-bold text-blue-600">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {existingBid ? "Update Bid" : "Save Bid"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveBidModal;
