import { Shield, Users, Briefcase, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSuspenseQuery } from "@tanstack/react-query";

type RoleStats = {
  totalRoles: number;
  totalAdmins: number;
  totalStaff: number;
  totalLecturers: number;
};

async function fetchStats(): Promise<RoleStats> {
  const res = await fetch("/api/dashboard/system/roles/stats");
  if (!res.ok) {
    throw new Error("Failed to fetch stats");
  }
  const json = await res.json();
  return json.data;
}

export function RoleCards() {
  const { data: stats } = useSuspenseQuery({
    queryKey: ["roles", "stats"],
    queryFn: fetchStats,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total role
          </CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRoles}</div>
          <p className="text-xs text-muted-foreground">
            Jumlah role yang tersedia di sistem.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total admin
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAdmins}</div>
          <p className="text-xs text-muted-foreground">
            Jumlah pengguna dengan peran admin.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total staff
          </CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalStaff}</div>
          <p className="text-xs text-muted-foreground">
            Jumlah pengguna dengan peran staff/operator.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total lainnya
          </CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLecturers}</div>
          <p className="text-xs text-muted-foreground">
            Total pengguna untuk role lain (mis. kepala BPBD/masyarakat).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
