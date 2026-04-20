import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Loader2 } from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  email: string | null;
}

const UserManagementContent = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, role, is_active, created_at, email")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers((data || []) as UserProfile[]);
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;
      toast.success("Role updated!");
      loadUsers();
    } catch (error: any) {
      toast.error("Failed to update role: " + error.message);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !currentStatus })
        .eq("id", userId);

      if (error) throw error;
      toast.success(`User ${!currentStatus ? "activated" : "deactivated"}!`);
      loadUsers();
    } catch (error: any) {
      toast.error("Failed to update status: " + error.message);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <span className="ml-2 text-sm text-slate-400">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-700">
            <TableHead className="text-slate-400">Name</TableHead>
            <TableHead className="text-slate-400">Email</TableHead>
            <TableHead className="text-slate-400">Role</TableHead>
            <TableHead className="text-slate-400">Status</TableHead>
            <TableHead className="text-slate-400">Joined</TableHead>
            <TableHead className="text-right text-slate-400">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="border-slate-700">
              <TableCell className="font-medium text-white">
                {user.full_name || "No name set"}
              </TableCell>
              <TableCell className="text-sm text-slate-300">
                {user.email || "—"}
              </TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(val) => handleRoleChange(user.id, val)}
                >
                  <SelectTrigger className="w-[130px] h-8 text-xs bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="sales_rep">Sales Rep</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Badge
                  variant={user.is_active ? "default" : "secondary"}
                  className={
                    user.is_active
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-slate-700 text-slate-400"
                  }
                >
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-slate-400">
                {formatDate(user.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(user.id, user.is_active)}
                  className="text-xs border-slate-700 text-slate-300 hover:text-white"
                >
                  {user.is_active ? "Deactivate" : "Activate"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagementContent;
