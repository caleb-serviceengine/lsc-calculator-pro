import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Loader2, Settings, User, Shield, SlidersHorizontal, Users, X } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useProfile } from "@/hooks/useProfile";
import { SettingsPanelContent } from "@/components/SettingsPanel";
import UserManagementContent from "@/components/UserManagementContent";

type Tab = "profile" | "security" | "preferences" | "pricing" | "users";

interface AccountSettingsModalProps {
  open: boolean;
  onClose: () => void;
  userEmail?: string;
}

const AccountSettingsModal = ({ open, onClose, userEmail }: AccountSettingsModalProps) => {
  const { role, isRoleLoading, isAdmin } = useUserRole();
  const { profile, isLoading: profileLoading, updateFullName } = useProfile();

  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [fullName, setFullName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Security tab state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) setFullName(profile.fullName);
  }, [profile]);

  useEffect(() => {
    if (open) {
      setActiveTab("profile");
      setSidebarOpen(true);
    }
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    const ok = await updateFullName(fullName);
    if (ok) toast.success("Profile updated successfully!");
    else toast.error("Failed to update profile");
    setSavingProfile(false);
  };

  const handleChangePassword = async () => {
    if (!newPassword) { toast.error("Please enter a new password"); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) toast.error(error.message);
      else { toast.success("Password updated successfully!"); setNewPassword(""); setConfirmPassword(""); }
    } catch { toast.error("An unexpected error occurred"); }
    finally { setLoading(false); }
  };

  const handleClose = () => {
    setNewPassword(""); setConfirmPassword(""); setShowNew(false); setShowConfirm(false);
    onClose();
  };

  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : "User";
  const createdDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";
  const initials = profile?.fullName?.charAt(0)?.toUpperCase() || "U";

  const tabTitle: Record<Tab, string> = {
    profile: "Profile Settings",
    security: "Security Settings",
    preferences: "Preferences",
    pricing: "Pricing Settings",
    users: "User Management",
  };

  const navItems: { key: Tab; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { key: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    { key: "security", label: "Security", icon: <Shield className="h-4 w-4" /> },
    { key: "preferences", label: "Preferences", icon: <SlidersHorizontal className="h-4 w-4" /> },
    { key: "users", label: "Users", icon: <Users className="h-4 w-4" />, adminOnly: true },
    { key: "pricing", label: "Pricing Settings", icon: <Settings className="h-4 w-4" />, adminOnly: true },
  ];

  const visibleNav = navItems.filter((t) => !t.adminOnly || (!isRoleLoading && isAdmin));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-900">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-[60] bg-slate-700 text-slate-300 p-2 rounded-lg hover:bg-slate-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[51]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div
        className={`
          fixed md:relative z-[52] md:z-auto
          w-72 md:w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full
          transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* User Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-white font-medium truncate">{profile?.fullName || "User"}</div>
              <div className="text-slate-400 text-sm truncate">{userEmail || "—"}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {visibleNav.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveTab(item.key);
                setSidebarOpen(false); // close on mobile
              }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                activeTab === item.key
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <div className="text-xs text-slate-400">
            Role: <span className="capitalize text-slate-300">{isRoleLoading ? "..." : roleLabel}</span>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 md:px-8 py-5 flex items-center justify-between shrink-0">
          <h1 className="text-xl md:text-2xl font-bold text-white ml-10 md:ml-0">
            {tabTitle[activeTab]}
          </h1>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-2xl">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wide">Email</Label>
                  <p className="text-sm text-white font-medium">{userEmail ?? "—"}</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-slate-400 text-xs uppercase tracking-wide">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    disabled={profileLoading || savingProfile}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs uppercase tracking-wide">Role</Label>
                    <p className="text-sm text-white font-medium">{isRoleLoading ? "Loading..." : roleLabel}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs uppercase tracking-wide">Account Created</Label>
                    <p className="text-sm text-white font-medium">{profileLoading ? "Loading..." : createdDate}</p>
                  </div>
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={savingProfile || profileLoading || fullName === profile?.fullName}
                  className="w-full"
                >
                  {savingProfile ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : "Save Changes"}
                </Button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type={showNew ? "text" : "password"}
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 bg-slate-800 border-slate-700 text-white"
                    disabled={loading}
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors" tabIndex={-1}>
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 bg-slate-800 border-slate-700 text-white"
                    disabled={loading}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors" tabIndex={-1}>
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button onClick={handleChangePassword} disabled={loading || !newPassword} className="w-full">
                  {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>) : "Change Password"}
                </Button>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div className="pt-4">
                <p className="text-sm text-slate-400 text-center py-8">Preferences coming soon.</p>
              </div>
            )}
          </div>

          {/* Users Tab - full width */}
          {activeTab === "users" && isAdmin && (
            <div>
              <UserManagementContent />
            </div>
          )}

          {/* Pricing Tab - full width */}
          {activeTab === "pricing" && isAdmin && (
            <div>
              <SettingsPanelContent />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsModal;
