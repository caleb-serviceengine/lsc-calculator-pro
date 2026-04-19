import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Download, CheckCircle, FileText, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateSellSheetHTML } from "@/utils/sellSheetTemplate";

interface Clean365Data {
  aLaCarteTotal: number;
  annualPrice: number;
  monthlyPrice: number;
  savings: number;
  discountPercent: number;
  propertySpecs: { sqft: number; twoStory: boolean; threeStory: boolean; detachedGarage: boolean };
}

interface SellSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  clean365Data: Clean365Data;
  existingBidId?: string;
  existingCustomerInfo?: { name?: string; email?: string; phone?: string; address?: string };
  existingSellSheetId?: string;
}

function buildStories(specs: Clean365Data["propertySpecs"]): string {
  if (specs.threeStory) return "3-Story";
  if (specs.twoStory) return "2-Story";
  return "1-Story";
}

const SellSheetModal = ({ isOpen, onClose, clean365Data, existingBidId, existingCustomerInfo, existingSellSheetId }: SellSheetModalProps) => {
  const isViewMode = !!existingSellSheetId;
  const [step, setStep] = useState<1 | 2>(isViewMode ? 2 : 1);
  const [customerName, setCustomerName] = useState(existingCustomerInfo?.name ?? "");
  const [customerEmail, setCustomerEmail] = useState(existingCustomerInfo?.email ?? "");
  const [customerPhone, setCustomerPhone] = useState(existingCustomerInfo?.phone ?? "");
  const [customerAddress, setCustomerAddress] = useState(existingCustomerInfo?.address ?? "");
  const [generating, setGenerating] = useState(false);
  const [sellSheetId, setSellSheetId] = useState(existingSellSheetId ?? "");
  const [shareableUrl, setShareableUrl] = useState(existingSellSheetId ? `${window.location.origin}/quote/${existingSellSheetId}` : "");
  const [generatedHTML, setGeneratedHTML] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCustomerName(existingCustomerInfo?.name ?? "");
      setCustomerEmail(existingCustomerInfo?.email ?? "");
      setCustomerPhone(existingCustomerInfo?.phone ?? "");
      setCustomerAddress(existingCustomerInfo?.address ?? "");
      if (existingSellSheetId) {
        setStep(2);
        setSellSheetId(existingSellSheetId);
        setShareableUrl(`${window.location.origin}/quote/${existingSellSheetId}`);
        // Regenerate HTML for view mode
        const html = generateSellSheetHTML({
          customerName: existingCustomerInfo?.name ?? "",
          customerEmail: existingCustomerInfo?.email,
          customerPhone: existingCustomerInfo?.phone,
          customerAddress: existingCustomerInfo?.address,
          propertySpecs: { sqft: clean365Data.propertySpecs.sqft, stories: buildStories(clean365Data.propertySpecs) },
          pricing: {
            aLaCarteTotal: clean365Data.aLaCarteTotal,
            annualPrice: clean365Data.annualPrice,
            monthlyPrice: clean365Data.monthlyPrice,
            savings: clean365Data.savings,
            discountPercent: clean365Data.discountPercent,
          },
          quoteDate: new Date().toLocaleDateString(),
          sellSheetId: existingSellSheetId,
        });
        setGeneratedHTML(html);
      } else {
        setStep(1);
        setSellSheetId("");
        setShareableUrl("");
        setGeneratedHTML(null);
      }
    }
  }, [isOpen, existingSellSheetId, existingCustomerInfo, clean365Data]);

  const handleGenerate = async () => {
    if (!customerName.trim()) return;
    setGenerating(true);

    try {
      const id = `SS-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const quoteDate = new Date().toLocaleDateString();

      const sellSheetData = {
        sellSheetId: id,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || null,
        customerPhone: customerPhone.trim() || null,
        customerAddress: customerAddress.trim() || null,
        aLaCarteTotal: clean365Data.aLaCarteTotal,
        annualPrice: clean365Data.annualPrice,
        monthlyPrice: clean365Data.monthlyPrice,
        savings: clean365Data.savings,
        discountPercent: clean365Data.discountPercent,
        propertySpecs: clean365Data.propertySpecs,
        quoteDate: new Date().toISOString(),
      };

      const htmlContent = generateSellSheetHTML({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        customerAddress: customerAddress.trim() || undefined,
        propertySpecs: { sqft: clean365Data.propertySpecs.sqft, stories: buildStories(clean365Data.propertySpecs) },
        pricing: {
          aLaCarteTotal: clean365Data.aLaCarteTotal,
          annualPrice: clean365Data.annualPrice,
          monthlyPrice: clean365Data.monthlyPrice,
          savings: clean365Data.savings,
          discountPercent: clean365Data.discountPercent,
        },
        quoteDate,
        sellSheetId: id,
      });

      const url = `${window.location.origin}/quote/${id}`;

      if (existingBidId) {
        const { error } = await supabase
          .from("bids")
          .update({
            sell_sheet_data: sellSheetData as any,
            sell_sheet_id: id,
            sell_sheet_created_at: new Date().toISOString(),
            customer_name: customerName.trim(),
            customer_email: customerEmail.trim() || null,
            customer_phone: customerPhone.trim() || null,
            customer_address: customerAddress.trim() || null,
          })
          .eq("bid_id", existingBidId);

        if (error) throw error;
      }

      setGeneratedHTML(htmlContent);
      setSellSheetId(id);
      setShareableUrl(url);
      setStep(2);
    } catch (err: any) {
      toast.error("Failed to generate sell sheet: " + (err.message || "Unknown error"));
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDownloadPdf = async () => {
    if (!generatedHTML) return;

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      const container = document.createElement("div");
      container.innerHTML = generatedHTML;

      const opt = {
        margin: 0,
        filename: `Clean365-${customerName.replace(/\s+/g, "-")}-${sellSheetId}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" as const },
      };

      await html2pdf().set(opt).from(container).save();
      toast.success("PDF downloaded successfully!");
    } catch (error: any) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF: " + (error.message || "Unknown error"));
    }
  };

  const handlePreview = () => {
    if (!generatedHTML) return;
    const previewWindow = window.open("", "_blank");
    if (previewWindow) {
      previewWindow.document.write(generatedHTML);
      previewWindow.document.close();
    }
  };

  const handleClose = () => {
    setStep(1);
    setSellSheetId("");
    setShareableUrl("");
    setGeneratedHTML(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {step === 1 ? "Create Sell Sheet" : "Sell Sheet Ready!"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Enter customer information to generate a shareable Clean365 sell sheet."
              : `Sell sheet ${sellSheetId} has been generated.`}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ss-name">Customer Name *</Label>
              <Input id="ss-name" placeholder="John Smith" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ss-email">Email</Label>
              <Input id="ss-email" type="email" placeholder="john@example.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ss-phone">Phone</Label>
              <Input id="ss-phone" type="tel" placeholder="(555) 123-4567" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ss-address">Property Address</Label>
              <Input id="ss-address" placeholder="123 Main St" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium text-card-foreground">
                Clean365 Annual Plan — {clean365Data.discountPercent}% off
              </p>
              <p className="text-muted-foreground">
                À La Carte Value: ${clean365Data.aLaCarteTotal.toFixed(2)} → ${clean365Data.annualPrice.toFixed(2)}/yr
              </p>
            </div>

            <Button className="w-full" disabled={!customerName.trim() || generating} onClick={handleGenerate}>
              {generating ? "Generating..." : "Generate Sell Sheet"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
              <div>
                <p className="font-medium text-card-foreground">Sell sheet generated successfully!</p>
                <p className="text-sm text-muted-foreground">ID: {sellSheetId}</p>
              </div>
            </div>

            {generatedHTML && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border border-border rounded-lg overflow-hidden bg-white" style={{ height: 200 }}>
                  <iframe
                    srcDoc={generatedHTML}
                    title="Sell Sheet Preview"
                    className="w-full h-full border-0"
                    style={{ transform: "scale(0.45)", transformOrigin: "top left", width: "222%", height: "222%" }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Shareable Link</Label>
              <div className="flex gap-2">
                <Input value={shareableUrl} readOnly className="text-xs" />
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handlePreview}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleDownloadPdf}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button className="flex-1" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SellSheetModal;
