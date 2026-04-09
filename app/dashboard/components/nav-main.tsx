"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain({
  title,
  items,
}: {
  title: string;
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
        {title}
      </SidebarGroupLabel>
      <SidebarMenu>
        <div>
          {items.map((item) => {
            const isActive =
              pathname === item.url ||
              item.items?.some((sub) => pathname === sub.url);

            return (
              <div key={item.title}>
                {item.items && item.items.length > 0 ? (
                  <Collapsible
                    asChild
                    defaultOpen={isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          className={cn(
                            "transition-all duration-200 hover:bg-primary/10 hover:text-primary dark:hover:bg-secondary/20 dark:hover:text-secondary [&_svg]:text-muted-foreground hover:[&_svg]:text-primary dark:hover:[&_svg]:text-secondary",
                            isActive &&
                              "bg-primary dark:bg-secondary text-white shadow-md hover:bg-primary/90! dark:hover:bg-secondary/90 hover:text-white! dark:hover:text-white [&_svg]:text-white hover:[&_svg]:text-white dark:hover:[&_svg]:text-white",
                          )}
                        >
                          {item.icon && (
                            <item.icon className="size-4 transition-colors" />
                          )}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                        <SidebarMenuSub className="ml-4 border-l border-sidebar-border pl-2">
                          {item.items.map((subItem) => {
                            const isSubActive = pathname === subItem.url;
                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  className={cn(
                                    "transition-all duration-200 hover:bg-primary/10 hover:text-primary dark:hover:bg-secondary/20 dark:hover:text-secondary",
                                    isSubActive &&
                                      "bg-primary dark:bg-secondary font-medium text-white shadow-sm hover:bg-primary/90 dark:hover:bg-secondary/90 hover:text-white dark:hover:text-white",
                                  )}
                                >
                                  <Link href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(
                        "transition-all my-1 duration-200 hover:bg-primary/10 hover:text-primary dark:hover:bg-secondary/20 dark:hover:text-secondary [&_svg]:text-muted-foreground hover:[&_svg]:text-primary dark:hover:[&_svg]:text-secondary",
                        isActive &&
                          "bg-primary dark:bg-secondary text-white shadow-md hover:bg-primary/90 dark:hover:bg-secondary/90 hover:text-white dark:hover:text-white [&_svg]:text-white hover:[&_svg]:text-white dark:hover:[&_svg]:text-white",
                      )}
                    >
                      <Link href={item.url}>
                        {item.icon && (
                          <item.icon className="size-4 transition-colors" />
                        )}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </div>
            );
          })}
        </div>
      </SidebarMenu>
    </SidebarGroup>
  );
}
