"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  const resolvedUser = useMemo(
    () => ({
      name: session?.user?.name || user.name,
      email: session?.user?.email || user.email,
      avatar: ((session?.user as any)?.photoUrl as string) || user.avatar,
    }),
    [session?.user, user.avatar, user.email, user.name],
  );

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          queryClient.clear();
          router.push("/sign-in");
        },
      },
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="cursor-pointer transition-all duration-200 hover:bg-primary/10 hover:text-primary dark:hover:bg-secondary/20 dark:hover:text-secondary data-[state=open]:bg-primary/10 data-[state=open]:text-primary dark:data-[state=open]:bg-secondary/20 dark:data-[state=open]:text-secondary [&_svg]:text-muted-foreground hover:[&_svg]:text-primary dark:hover:[&_svg]:text-secondary data-[state=open]:[&_svg]:text-primary dark:data-[state=open]:[&_svg]:text-secondary"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={resolvedUser.avatar}
                  alt={resolvedUser.name}
                />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {resolvedUser.name}
                </span>
                <span className="truncate text-xs">{resolvedUser.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-background dark:bg-popover text-foreground"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={resolvedUser.avatar}
                    alt={resolvedUser.name}
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {resolvedUser.name}
                  </span>
                  <span className="truncate text-xs">{resolvedUser.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer focus:bg-primary/10 focus:text-primary dark:focus:bg-secondary/20 dark:focus:text-secondary [&_svg]:text-muted-foreground focus:[&_svg]:text-primary dark:focus:[&_svg]:text-secondary"
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
