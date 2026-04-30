import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { User, UserRole } from "@/types";
import {
  Users,
  Shield,
  CheckCircle,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  userService,
  type User as BackendUser,
  type UserCreateInput,
  type UserUpdateInput,
} from "@/services/userService";

function mapBackendUserToView(user: BackendUser): User {
  return {
    id: user.id,
    nama: user.full_name,
    email: user.email,
    role: user.is_admin ? "Admin" : "Verifikator",
    dibuat: user.created_at
      ? new Date(user.created_at).toLocaleDateString("id-ID")
      : "-",
    login_terakhir: user.last_login
      ? new Date(user.last_login).toLocaleString("id-ID")
      : "-",
    avatar_initial: (user.full_name?.[0] ?? "U").toUpperCase(),
  };
}

export default function KelolaUser() {
  const [users, setUsers] = useState<User[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    role: "Verifikator" as UserRole,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await userService.getAllUsers();
      setUsers(result.map(mapBackendUserToView));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data user");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const admins = users.filter((u) => u.role === "Admin").length;
  const verifikators = users.filter((u) => u.role === "Verifikator").length;

  const openAdd = () => {
    setEditingUser(null);
    setForm({ nama: "", email: "", password: "", role: "Verifikator" });
    setFormOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setForm({ nama: u.nama, email: u.email, password: "", role: u.role });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.nama.trim() || !form.email.trim()) {
      setError("Nama dan email wajib diisi");
      return;
    }

    if (!editingUser && !form.password.trim()) {
      setError("Password wajib diisi untuk user baru");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (editingUser) {
        const payload: UserUpdateInput = {
          full_name: form.nama,
          email: form.email,
          is_admin: form.role === "Admin",
        };

        if (form.password.trim()) {
          payload.password = form.password;
        }

        await userService.updateUser(String(editingUser.id), payload);
      } else {
        const payload: UserCreateInput = {
          full_name: form.nama,
          email: form.email,
          password: form.password,
          is_active: true,
          is_admin: form.role === "Admin",
        };
        await userService.createUser(payload);
      }

      await loadUsers();
      setFormOpen(false);
      setForm({ nama: "", email: "", password: "", role: "Verifikator" });
      setEditingUser(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan user");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;

    setIsDeleting(true);
    setError(null);

    try {
      await userService.deleteUser(String(deleteUser.id));
      await loadUsers();
      setDeleteOpen(false);
      setDeleteUser(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Tambah, edit, dan hapus user sistem
        </p>
        <Button size="sm" onClick={openAdd} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-1" />
          Tambah User
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/30">
          <CardContent className="p-3 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total User", value: users.length, icon: Users },
          { label: "Admin", value: admins, icon: Shield },
          { label: "Verifikator", value: verifikators, icon: CheckCircle },
        ].map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <c.icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="text-xl font-bold">{c.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="p-3 font-medium text-muted-foreground">
                    User
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Dibuat
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Login Terakhir
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-6 text-center text-sm text-muted-foreground"
                    >
                      Memuat data user...
                    </td>
                  </tr>
                )}
                {!isLoading && users.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-6 text-center text-sm text-muted-foreground"
                    >
                      Belum ada data user
                    </td>
                  </tr>
                )}
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                          {u.avatar_initial}
                        </div>
                        <span className="font-medium text-sm">{u.nama}</span>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {u.email}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={u.role} type="role" />
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {u.dibuat}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {u.login_terakhir}
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(u)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setDeleteUser(u);
                              setDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Tambah User"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nama</Label>
              <Input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label>
                Password{" "}
                {editingUser && (
                  <span className="text-muted-foreground text-xs">
                    (kosongkan jika tidak diubah)
                  </span>
                )}
              </Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Verifikator">Verifikator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={() => void handleSave()}
              disabled={isSaving}
            >
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus user {deleteUser?.nama}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
