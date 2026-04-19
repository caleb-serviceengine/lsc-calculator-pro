import { useEffect, useRef, useState } from "react";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Temporarily comment out the types to debug
// import {
//   WidgetPricingTier,
//   SERVICE_IDS,
//   SERVICE_LABELS,
//   ServiceId,
// } from "@/lib/widgetPricingTypes";

// DEBUG: Minimal component to test rendering
export default function WidgetPricingSettings() {
  console.log("[WidgetPricingSettings] Component mounted");

  // DEBUG VERSION - Test if component renders at all
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h2 className="text-lg font-bold text-yellow-900">DEBUG: Widget Pricing Settings Component</h2>
      <p className="text-sm text-yellow-800">If you see this, the component is rendering!</p>
      <p className="text-xs text-yellow-700 mt-2">This is a test version to debug why the real component doesn't show.</p>
    </div>
  );
}
