import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Users, Shield, Lock } from "lucide-react";
import { RoleActions } from "./permission-actions";
import { useSuspenseQuery } from "@tanstack/react-query";

type RolePermission = { resource: string; actions: string[] };
type RoleRow = {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: RolePermission[];
};
type RoleListResponse = {
  roles: RoleRow[];
};

async function fetchRoles(): Promise<RoleListResponse> {
  const res = await fetch("/api/dashboard/system/roles");
  if (!res.ok) {
    throw new Error("Failed to fetch roles");
  }
  const json = await res.json();
  return json.data;
}

export function RoleGrid() {
  const { data: roles } = useSuspenseQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
    staleTime: 1000 * 60 * 5,
  });


  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {roles.roles.map((role) => (
        <Card
          key={role.id}
          className="group flex flex-col overflow-hidden border-l-4 border-l-primary shadow-sm transition-all hover:shadow-md"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-foreground">
                {role.name}
              </CardTitle>
            </div>
            <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
              {role.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 pb-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-md bg-muted/40 p-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Pengguna</span>
                </div>
                <span className="font-semibold text-foreground">
                  {role.userCount}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-muted/40 p-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Resource</span>
                </div>
                <span className="font-semibold text-foreground">
                  {role.permissions.length}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-muted/40 p-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Aksi</span>
                </div>
                <span className="font-semibold text-foreground">
                  {role.permissions.reduce(
                    (acc, p) => acc + p.actions.length,
                    0,
                  )}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-muted/10 p-4 pt-0">
            <RoleActions role={role} />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
