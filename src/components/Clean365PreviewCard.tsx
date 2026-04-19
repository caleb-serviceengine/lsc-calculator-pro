import { useState, useMemo } from "react";
import { ChevronRight, Check, AlertTriangle, Minus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Clean365Settings } from "@/contexts/PricingSettingsContext";

export type ServiceConfigStatus = "configured" | "missing" | "na";

export interface ServiceStatusEntry {
  status: ServiceConfigStatus;
  price: number;
  sectionTitle?: string;
}

export type ServiceStatusMap = Record<string, ServiceStatusEntry>;

const SERVICE_SCHEDULE = [
  { service: "Gutter Cleaning (Silver Package)", key: "gutterCleaning", q1: true, q2: true, q3: true, q4: true },
  { service: "Dryer Vent Cleaning", key: "dryerVent", q1: true, q2: false, q3: false, q4: false },
  { service: "Interior High Dusting: Cabinets, Ceiling Fans, Fixtures", key: "interiorDusting", q1: true, q2: false, q3: false, q4: false },
  { service: "Garage Power Washing", key: "garagePW", q1: true, q2: false, q3: false, q4: false },
  { service: "Window Cleaning (Spot Free Exterior)", key: "windowCleaning", q1: true, q2: false, q3: false, q4: true },
  { service: "House Washing (Silver Package)", key: "houseWashing", q1: false, q2: true, q3: false, q4: false },
  { service: "Gutter Brightening: Outside Faces & Downspouts", key: "gutterBrightening", q1: false, q2: true, q3: false, q4: false },
  { service: "Power Washing: Porches, Decks, Patios", key: "deckPW", q1: false, q2: true, q3: false, q4: false },
  { service: "Weed Removal (Included)", key: "weedRemoval", q1: false, q2: true, q3: true, q4: false },
  { service: "Power Washing: Driveway, Sidewalks", key: "drivewayPW", q1: false, q2: false, q3: true, q4: false },
  { service: "Roof Cleaning (Annual Maintenance Rate)", key: "roofCleaning", q1: false, q2: false, q3: true, q4: false },
  { service: "Outdoor Upholstery Cleaning", key: "outdoorUpholstery", q1: false, q2: false, q3: true, q4: false },
  { service: "Outdoor Furniture Shrink Wrapping", key: "furnitureWrap", q1: false, q2: false, q3: false, q4: true },
  { service: "Garbage Cans Cleaned & Sanitized", key: "garbageCans", q1: true, q2: true, q3: true, q4: true },
  { service: "Free Touch-Ups Of Everything!", key: "touchUps", q1: true, q2: true, q3: true, q4: true, bold: true },
];

export interface Clean365SourcePrices {
  gutterBasePrice: number;
  dryerVentPrice: number;
  windowCleaningPrice: number;
  houseWashPrice: number;
  gutterBrighteningPrice: number;
  deckCleaningPrice: number;
  flatworkDrivewayPrice: number;
  flatworkGaragePrice: number;
  roofCleaningPrice: number;
  shrinkWrapPrice: number;
}

interface Clean365PreviewCardProps {
  sourcePrices: Clean365SourcePrices;
  clean365Settings: Clean365Settings;
  addToBundle: boolean;
  onAddToBundleChange: (v: boolean) => void;
  serviceStatus: ServiceStatusMap;
  naServices: string[];
  onToggleNA: (serviceKey: string) => void;
  onScrollToSection: (sectionTitle: string) => void;
}

const Clean365PreviewCard = ({
  sourcePrices,
  clean365Settings,
  addToBundle,
  onAddToBundleChange,
  serviceStatus,
  naServices,
  onToggleNA,
  onScrollToSection,
}: Clean365PreviewCardProps) => {
  const [showSchedule, setShowSchedule] = useState(false);
  const c = clean365Settings;

  const q1Count = SERVICE_SCHEDULE.filter(s => s.q1).length;
  const q2Count = SERVICE_SCHEDULE.filter(s => s.q2).length;
  const q3Count = SERVICE_SCHEDULE.filter(s => s.q3).length;
  const q4Count = SERVICE_SCHEDULE.filter(s => s.q4).length;

  const aLaCarteTotal = useMemo(() => {
    const p = sourcePrices;
    const isNA = (key: string) => naServices.includes(key);

    const gutterCleaning = isNA("gutterCleaning") ? 0 : p.gutterBasePrice * 4;
    const dryerVent = isNA("dryerVent") ? 0 : p.dryerVentPrice;
    const exteriorWindows = isNA("windowCleaning") ? 0 : p.windowCleaningPrice;
    const houseWashing = isNA("houseWashing") ? 0 : p.houseWashPrice;
    const gutterBrightening = isNA("gutterBrightening") ? 0 : p.gutterBrighteningPrice;
    const deckPatioPW = isNA("deckPW") ? 0 : p.deckCleaningPrice;
    const drivewayPW = isNA("drivewayPW") ? 0 : p.flatworkDrivewayPrice;
    const garagePW = isNA("garagePW") ? 0 : p.flatworkGaragePrice;
    const roofCleaning = isNA("roofCleaning") ? 0 : p.roofCleaningPrice;
    const furnitureShrinkWrap = isNA("furnitureWrap") ? 0 : p.shrinkWrapPrice;
    const weedRemoval = isNA("weedRemoval") ? 0 : c.weedRemovalPerVisit * 3;
    const garbageCans = isNA("garbageCans") ? 0 : c.garbageCansPerVisit * 4;
    const outdoorUpholstery = isNA("outdoorUpholstery") ? 0 : c.outdoorUpholsteryCleaning;
    const interiorDusting = isNA("interiorDusting") ? 0 : c.interiorHighDusting;

    return gutterCleaning + dryerVent + exteriorWindows + houseWashing +
      gutterBrightening + deckPatioPW + drivewayPW + garagePW +
      roofCleaning + furnitureShrinkWrap + weedRemoval + garbageCans +
      outdoorUpholstery + interiorDusting;
  }, [sourcePrices, c, naServices]);

  const annualPrice = aLaCarteTotal * (1 - c.discountPercent / 100);
  const monthlyPrice = annualPrice / 12;
  const savings = aLaCarteTotal - annualPrice;

  if (!c.enabled) return null;

  const renderStatusCell = (serviceKey: string) => {
    const entry = serviceStatus[serviceKey];
    if (!entry) return <span className="text-muted-foreground">—</span>;

    const isNA = naServices.includes(serviceKey);

    if (isNA) {
      return (
        <div className="flex items-center gap-1.5">
          <Minus className="w-4 h-4 text-muted-foreground" />
          <Badge variant="secondary" className="text-xs px-1.5 py-0">N/A</Badge>
        </div>
      );
    }

    if (entry.status === "configured") {
      return (
        <div className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-green-600" strokeWidth={3} />
          <span className="text-xs font-semibold text-green-700">${entry.price.toFixed(0)}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        {entry.sectionTitle && (
          <button
            onClick={(e) => { e.stopPropagation(); onScrollToSection(entry.sectionTitle!); }}
            className="text-xs font-medium text-primary hover:text-primary/80 underline underline-offset-2"
          >
            Configure
          </button>
        )}
      </div>
    );
  };

  const renderActionCell = (serviceKey: string) => {
    const entry = serviceStatus[serviceKey];
    if (!entry) return null;
    if (serviceKey === "touchUps") return null;

    const isNA = naServices.includes(serviceKey);

    return (
      <div className="flex items-center gap-1.5">
        {entry.sectionTitle && !isNA && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2.5 text-xs font-medium border border-border bg-transparent"
            onClick={(e) => { e.stopPropagation(); onScrollToSection(entry.sectionTitle!); }}
          >
            Configure
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 px-2.5 text-xs font-medium border bg-transparent ${isNA ? "border-primary text-primary" : "border-border"}`}
          onClick={(e) => { e.stopPropagation(); onToggleNA(serviceKey); }}
        >
          N/A
        </Button>
      </div>
    );
  };

  return (
    <div className="bg-card text-card-foreground p-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Year-round property maintenance with quarterly service visits. Pricing is calculated dynamically from your current service inputs.
        </p>
      </div>

      {/* A La Carte Value */}
      {aLaCarteTotal > 0 && (
        <div className="bg-muted/30 border border-border rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-card-foreground">Total A La Carte Value</span>
            <span className="text-lg font-bold text-card-foreground">${aLaCarteTotal.toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Based on current calculator inputs + loss leader services</p>
        </div>
      )}

      {/* Single Plan Card */}
      <div className="mb-6">
        <div className="border-2 border-primary bg-primary/5 shadow-md rounded-xl p-5">
          <div className="text-center text-sm font-bold text-primary bg-primary/10 -mx-5 -mt-5 px-5 pt-3 pb-3 rounded-t-xl mb-4">
            CLEAN365 ANNUAL MAINTENANCE PLAN
          </div>

          {aLaCarteTotal > 0 ? (
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">
                ${monthlyPrice.toFixed(0)}
                <span className="text-base font-medium text-muted-foreground">/mo</span>
              </div>
              <div className="text-sm text-muted-foreground mb-4">Billed annually at ${annualPrice.toFixed(2)}</div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="bg-muted/40 rounded-lg p-3">
                  <div className="font-semibold text-card-foreground">${aLaCarteTotal.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">À La Carte Value</div>
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <div className="font-semibold text-card-foreground">${annualPrice.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Annual Total</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="font-semibold text-green-700">${savings.toFixed(2)}</div>
                  <div className="text-xs text-green-600 mt-0.5">You Save ({c.discountPercent}%)</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Enter service details above to calculate pricing
            </p>
          )}
        </div>
      </div>

      {/* Add to Bundle */}
      {aLaCarteTotal > 0 && annualPrice > 0 && (
        <div className="flex items-center gap-3 mb-6 p-4 border border-border rounded-xl bg-muted/20">
          <Checkbox
            checked={addToBundle}
            onCheckedChange={(v) => onAddToBundleChange(!!v)}
            id="clean365-bundle"
          />
          <Label htmlFor="clean365-bundle" className="text-sm font-medium text-card-foreground cursor-pointer flex-1">
            Add Clean365 Annual Plan to Bundle
          </Label>
          <span className="text-sm font-bold text-primary">
            ${annualPrice.toFixed(2)}/year
          </span>
          <span className="text-xs text-muted-foreground">
            (${monthlyPrice.toFixed(2)}/mo)
          </span>
        </div>
      )}

      {/* Collapsible Service Schedule */}
      <button
        onClick={() => setShowSchedule(!showSchedule)}
        className="w-full mb-4 text-sm text-primary hover:text-primary/80 flex items-center justify-center gap-2 transition-colors"
      >
        <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${showSchedule ? "rotate-90" : ""}`} />
        View Quarterly Service Schedule
      </button>

      {showSchedule && (
        <div className="mb-6 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="text-left py-2.5 px-3 border-r border-primary-foreground/20 font-semibold">Services</th>
                <th className="text-center py-2.5 px-2 border-r border-primary-foreground/20 font-semibold w-24">Status</th>
                <th className="text-center py-2.5 px-3 border-r border-primary-foreground/20 font-semibold">Q1<br /><span className="font-normal text-xs">(Jan-Mar)</span></th>
                <th className="text-center py-2.5 px-3 border-r border-primary-foreground/20 font-semibold">Q2<br /><span className="font-normal text-xs">(Apr-Jun)</span></th>
                <th className="text-center py-2.5 px-3 border-r border-primary-foreground/20 font-semibold">Q3<br /><span className="font-normal text-xs">(Jul-Sep)</span></th>
                <th className="text-center py-2.5 px-3 border-r border-primary-foreground/20 font-semibold">Q4<br /><span className="font-normal text-xs">(Oct-Dec)</span></th>
                <th className="text-center py-2.5 px-2 font-semibold w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {SERVICE_SCHEDULE.map((row, i) => {
                const isNA = naServices.includes(row.key);
                return (
                  <tr key={i} className={`border-b border-border ${isNA ? "opacity-50" : ""} ${i % 2 === 0 ? "bg-muted/30" : ""}`}>
                    <td className={`py-2 px-3 text-card-foreground ${row.bold ? "font-bold" : ""} ${isNA ? "line-through" : ""}`}>{row.service}</td>
                    <td className="text-center px-2">{renderStatusCell(row.key)}</td>
                    {[row.q1, row.q2, row.q3, row.q4].map((active, qi) => (
                      <td key={qi} className="text-center">
                        {active ? (
                          <Check className="w-5 h-5 text-green-600 inline-block" strokeWidth={3} />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    ))}
                    <td className="text-center px-2">{renderActionCell(row.key)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-secondary font-bold text-secondary-foreground">
                <td className="py-2 px-3">Services Per Quarter:</td>
                <td></td>
                <td className="text-center">{q1Count}</td>
                <td className="text-center">{q2Count}</td>
                <td className="text-center">{q3Count}</td>
                <td className="text-center">{q4Count}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Value Proposition */}
      <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
        <h4 className="font-bold text-card-foreground mb-2">Why Choose Clean365?</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✓ <strong className="text-card-foreground">Year-round protection</strong> — Your property maintained every season</li>
          <li>✓ <strong className="text-card-foreground">Priority scheduling</strong> — Lock in your preferred dates</li>
          <li>✓ <strong className="text-card-foreground">Guaranteed savings</strong> — {c.discountPercent}% off vs. individual services</li>
          <li>✓ <strong className="text-card-foreground">Weather-optimized</strong> — Services scheduled at ideal times</li>
          <li>✓ <strong className="text-card-foreground">No November rush</strong> — Avoid the fall gutter cleaning surge</li>
          <li>✓ <strong className="text-card-foreground">Smooth cash flow</strong> — Quarterly billing or annual prepay</li>
        </ul>
      </div>
    </div>
  );
};

export default Clean365PreviewCard;
