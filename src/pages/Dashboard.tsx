import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockDashboardSummary, mockTrenTemuan, mockDistribusi, mockTopVerifikator, mockVerifikasiTerakhir } from "@/data/mockData";
import { Link2, Globe, Search, Ban, CheckCircle, ClipboardList, RefreshCw } from "lucide-react";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";

const summaryCards = [
  { key: "total_url_crawled" as const, label: "Total URL Crawled", icon: Link2, color: "text-primary" },
  { key: "total_domain" as const, label: "Total Domain", icon: Globe, color: "text-primary" },
  { key: "manual_check" as const, label: "Manual Check", icon: Search, color: "text-warning" },
  { key: "pornografi" as const, label: "Pornografi", icon: Ban, color: "text-destructive" },
  { key: "non_pornografi" as const, label: "Non-Pornografi", icon: CheckCircle, color: "text-success" },
  { key: "verifikasi_hari_ini" as const, label: "Verifikasi Hari Ini", icon: ClipboardList, color: "text-muted-foreground" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [trendFilter, setTrendFilter] = useState("Domain");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-sm">Selamat datang, {user?.nama}! Berikut ringkasan monitoring hari ini.</p>
          <p className="text-xs text-muted-foreground mt-1">Update terakhir: 21.02.26</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-2" />Sync Data</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {summaryCards.map((c) => (
          <Card key={c.key} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
              <p className="text-2xl font-bold tabular-nums">{mockDashboardSummary[c.key].toLocaleString("id-ID")}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Tren Temuan */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Tren Temuan</h3>
              <Select value={trendFilter} onValueChange={setTrendFilter}>
                <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Domain">Domain</SelectItem>
                  <SelectItem value="URL">URL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={mockTrenTemuan}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="pornografi" stroke="#EF4444" strokeWidth={2} dot={false} name="Pornografi" />
                <Line type="monotone" dataKey="non_pornografi" stroke="#22C55E" strokeWidth={2} dot={false} name="Non-Pornografi" />
                <Line type="monotone" dataKey="manual_check" stroke="#F59E0B" strokeWidth={2} dot={false} name="Manual Check" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribusi Status */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-4">Distribusi Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={mockDistribusi} dataKey="jumlah" nameKey="status" cx="50%" cy="50%" innerRadius={50} outerRadius={80} label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {mockDistribusi.map((d, i) => <Cell key={i} fill={d.warna} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Verifikator */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-4">Top Verifikator</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mockTopVerifikator} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="nama" tick={{ fontSize: 11 }} width={120} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="total_verifikasi" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Total Verifikasi" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Verifikasi Terakhir */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-4">Verifikasi Terakhir</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Waktu</th>
                    <th className="pb-2 font-medium">Domain</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Verifikator</th>
                  </tr>
                </thead>
                <tbody>
                  {mockVerifikasiTerakhir.map((v, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 text-xs text-muted-foreground whitespace-nowrap">{v.waktu.slice(11, 16)}</td>
                      <td className="py-2 font-mono text-xs max-w-[160px] truncate">{v.domain}</td>
                      <td className="py-2"><StatusBadge status={v.status} /></td>
                      <td className="py-2 text-xs">{v.verifikator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
