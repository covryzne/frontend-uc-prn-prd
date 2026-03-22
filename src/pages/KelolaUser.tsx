import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockUsers } from "@/data/mockData";
import type { User, UserRole } from "@/types";
import { Users, Shield, CheckCircle, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function KelolaUser() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [form, setForm] = useState({ nama: "", email: "", password: "", role: "Verifikator" as UserRole });

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

  const handleSave = () => {
    if (editingUser) {
      setUsers((prev) => prev.map((u) => u.id === editingUser.id ? { ...u, nama: form.nama, email: form.email, role: form.role } : u));
    } else {
      const newUser: User = {
        id: Date.now(), nama: form.nama, email: form.email, role: form.role,
        dibuat: new Date().toISOString().slice(0, 10), login_terakhir: "-", avatar_initial: form.nama[0]?.toUpperCase() ?? "U",
      };
      setUsers((prev) => [...prev, newUser]);
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteUser) setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
    setDeleteOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Tambah, edit, dan hapus user sistem</p>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Tambah User</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[{ label: "Total User", value: users.length, icon: Users }, { label: "Admin", value: admins, icon: Shield }, { label: "Verifikator", value: verifikators, icon: CheckCircle }].map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <c.icon className="h-5 w-5 text-muted-foreground" />
              <div><p className="text-xs text-muted-foreground">{c.label}</p><p className="text-xl font-bold">{c.value}</p></div>
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
                  <th className="p-3 font-medium text-muted-foreground">User</th>
                  <th className="p-3 font-medium text-muted-foreground">Email</th>
                  <th className="p-3 font-medium text-muted-foreground">Role</th>
                  <th className="p-3 font-medium text-muted-foreground">Dibuat</th>
                  <th className="p-3 font-medium text-muted-foreground">Login Terakhir</th>
                  <th className="p-3 font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">{u.avatar_initial}</div>
                        <span className="font-medium text-sm">{u.nama}</span>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{u.email}</td>
                    <td className="p-3"><StatusBadge status={u.role} type="role" /></td>
                    <td className="p-3 text-xs text-muted-foreground">{u.dibuat}</td>
                    <td className="p-3 text-xs text-muted-foreground">{u.login_terakhir}</td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(u)}><Pencil className="h-3.5 w-3.5 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => { setDeleteUser(u); setDeleteOpen(true); }}><Trash2 className="h-3.5 w-3.5 mr-2" />Hapus</DropdownMenuItem>
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
          <DialogHeader><DialogTitle>{editingUser ? "Edit User" : "Tambah User"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nama</Label><Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Password {editingUser && <span className="text-muted-foreground text-xs">(kosongkan jika tidak diubah)</span>}</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div>
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Verifikator">Verifikator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleSave}>Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User</AlertDialogTitle>
            <AlertDialogDescription>Apakah Anda yakin ingin menghapus user {deleteUser?.nama}?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
