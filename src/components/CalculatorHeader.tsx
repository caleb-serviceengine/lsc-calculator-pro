import { LogOut, History, Pencil, FilePlus, RotateCcw, UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CalculatorHeaderProps {
  onSettingsClick?: () => void;
  onBidHistoryClick: () => void;
  onAccountSettingsClick?: () => void;
  onNewBid?: () => void;
  onReset?: () => void;
  userEmail?: string;
  currentBidId?: string | null;
  isAdmin?: boolean;
}

const CalculatorHeader = ({ onBidHistoryClick, onAccountSettingsClick, onNewBid, onReset, userEmail, currentBidId }: CalculatorHeaderProps) => {

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
    } catch (err: any) {
      toast.error('Error signing out');
      console.error('Logout error:', err);
    }
  };

  return (
    <>
      <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Lake State Cleaning
          </h1>
          <p className="text-sm text-muted-foreground">
            Exterior Clean Pro — Estimate Builder
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {userEmail && (
            <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-[200px] mr-2">
              {userEmail}
            </span>
          )}
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors text-xs font-medium"
            title="Reset Calculator — zero out all inputs"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={onBidHistoryClick}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors text-xs font-medium"
            title="Bid History"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </button>
          <button
            onClick={onAccountSettingsClick}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors text-xs font-medium"
            title="Account Settings"
          >
            <UserCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Account</span>
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors text-xs font-medium"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {currentBidId && (
        <div className="bg-amber-500 border-b-4 border-amber-600 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Pencil className="w-5 h-5 text-white shrink-0" />
              <div>
                <div className="text-white font-bold text-base sm:text-lg">
                  Editing Bid: {currentBidId}
                </div>
                <div className="text-amber-100 text-xs sm:text-sm">
                  Click "Save Bid" to update, or "New Bid" to start fresh
                </div>
              </div>
            </div>
            <button
              onClick={onNewBid}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-white text-amber-600 font-bold rounded-lg hover:bg-amber-50 transition-colors text-sm"
            >
              <FilePlus className="w-4 h-4" />
              New Bid
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CalculatorHeader;
