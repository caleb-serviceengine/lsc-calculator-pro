import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Loader2, Search, Upload, Trash2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SellSheetModal from "./SellSheetModal";

interface SavedBid {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  bid_id: string;
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  customer_address?: string | null;
  bundle_data: any;
  total_price: number;
  status: "draft" | "sent" | "won" | "lost";
  creator_name?: string;
  sell_sheet_id?: string | null;
  sell_sheet_data?: any;
}

interface BidHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadBid: (bid: SavedBid) => void;
  currentBidId?: string | null;
  onClearCurrentBid?: () => void;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatPrice = (price: number) =>
  "$" + price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const BidHistoryModal = ({ isOpen, onClose, onLoadBid, currentBidId, onClearCurrentBid }: BidHistoryModalProps) => {
  const [bids, setBids] = useState<SavedBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sellSheetBid, setSellSheetBid] = useState<SavedBid | null>(null);

  const hasClean365Data = (bid: SavedBid) => {
    const bd = bid.bundle_data;
    return bd && (bd.clean365Plan || bd.selectedClean365Plan || bd.clean365Data);
  };

  const extractClean365Data = (bid: SavedBid) => {
    const bd = bid.bundle_data;
    if (bd.clean365Data) return bd.clean365Data;
    return {
      selectedPlan: bd.clean365Plan || bd.selectedClean365Plan || "silver",
      aLaCarteTotal: bd.aLaCarteTotal || bid.total_price,
      tiers: bd.clean365Tiers || [],
      propertySpecs: bd.propertySpecs || { sqft: 0, twoStory: false, threeStory: false, detachedGarage: false },
    };
  };

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setStatusFilter("all");
      loadBids();
    }
  }, [isOpen]);

  const loadBids = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // Fetch bids
      const { data: bidsData, error: bidsError } = await supabase
        .from("bids" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (bidsError) throw bidsError;

      // Fetch current user's profile for creator name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      const creatorName = profile?.full_name || user.email || "Unknown";

      // Attach creator name to each bid
      const bidsWithCreator = ((bidsData as any[]) || []).map((bid: any) => ({
        ...bid,
        creator_name: creatorName,
      }));

      setBids(bidsWithCreator);
    } catch (error: any) {
      console.error("Error loading bids:", error);
      toast.error("Failed to load bids: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bid: SavedBid) => {
    if (!confirm(`Delete bid ${bid.bid_id} for "${bid.customer_name}"?`)) return;

    setDeletingId(bid.id);
    try {
      const { error } = await supabase
        .from("bids" as any)
        .delete()
        .eq("id", bid.id);

      if (error) throw error;
      toast.success(`Bid ${bid.bid_id} deleted`);
      setBids((prev) => prev.filter((b) => b.id !== bid.id));
      if (currentBidId === bid.bid_id) {
        onClearCurrentBid?.();
      }
    } catch (error: any) {
      toast.error("Failed to delete: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoad = (bid: SavedBid) => {
    onLoadBid(bid);
    onClose();
  };

  const filteredBids = useMemo(() => {
    return bids.filter((bid) => {
      const matchesSearch =
        !search ||
        bid.bid_id.toLowerCase().includes(search.toLowerCase()) ||
        bid.customer_name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || bid.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bids, search, statusFilter]);

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Bid History
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by bid ID or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white text-gray-900 border-gray-300"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px] bg-white text-gray-900 border-gray-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="all" className="text-gray-900">All</SelectItem>
              <SelectItem value="draft" className="text-gray-900">Draft</SelectItem>
              <SelectItem value="sent" className="text-gray-900">Sent</SelectItem>
              <SelectItem value="won" className="text-gray-900">Won</SelectItem>
              <SelectItem value="lost" className="text-gray-900">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading bids...</span>
            </div>
          ) : filteredBids.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">
                {bids.length === 0 ? "No saved bids yet" : "No bids match your filters"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {bids.length === 0
                  ? "Save a bid from the calculator to see it here"
                  : "Try adjusting your search or status filter"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="text-gray-600">Bid ID</TableHead>
                  <TableHead className="text-gray-600">Customer</TableHead>
                  <TableHead className="text-gray-600 hidden lg:table-cell">Created By</TableHead>
                  <TableHead className="text-gray-600 hidden md:table-cell">Created</TableHead>
                  <TableHead className="text-gray-600 hidden md:table-cell">Updated</TableHead>
                  <TableHead className="text-gray-600 text-right">Total</TableHead>
                  <TableHead className="text-gray-600">Status</TableHead>
                  <TableHead className="text-gray-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBids.map((bid, i) => (
                  <TableRow
                    key={bid.id}
                    className={`border-gray-200 hover:bg-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                  >
                    <TableCell className="font-mono text-sm font-medium text-gray-900">
                      {bid.bid_id}
                    </TableCell>
                    <TableCell className="text-gray-900">{bid.customer_name}</TableCell>
                    <TableCell className="text-sm text-gray-700 hidden lg:table-cell">
                      {bid.creator_name || "Unknown"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 hidden md:table-cell">
                      {formatDate(bid.created_at)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 hidden md:table-cell">
                      {formatDate(bid.updated_at)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-900">
                      {formatPrice(bid.total_price)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[bid.status]}`}
                      >
                        {bid.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {hasClean365Data(bid) ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSellSheetBid(bid)}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                            title={bid.sell_sheet_id ? "View Sell Sheet" : "Create Sell Sheet"}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled
                                  className="text-gray-300"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>This bid doesn't include Clean365</TooltipContent>
                          </Tooltip>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLoad(bid)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Load bid"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(bid)}
                          disabled={deletingId === bid.id}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          title="Delete bid"
                        >
                          {deletingId === bid.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Footer */}
        {!loading && bids.length > 0 && (
          <div className="pt-2 border-t border-gray-200 text-sm text-gray-500">
            {filteredBids.length} of {bids.length} bid{bids.length !== 1 ? "s" : ""}
          </div>
        )}
      </DialogContent>
    </Dialog>

    {sellSheetBid && (
      <SellSheetModal
        isOpen={!!sellSheetBid}
        onClose={() => {
          setSellSheetBid(null);
          loadBids();
        }}
        clean365Data={extractClean365Data(sellSheetBid)}
        existingBidId={sellSheetBid.bid_id}
        existingCustomerInfo={{
          name: sellSheetBid.customer_name,
          email: sellSheetBid.customer_email ?? undefined,
          phone: sellSheetBid.customer_phone ?? undefined,
          address: sellSheetBid.customer_address ?? undefined,
        }}
        existingSellSheetId={sellSheetBid.sell_sheet_id ?? undefined}
      />
    )}
    </>
  );
};

export default BidHistoryModal;
