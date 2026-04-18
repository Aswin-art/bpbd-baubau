import {
  Users,
  MapPin,
  Archive,
  ShieldCheck,
  Settings,
  LayoutDashboard,
  UserCircle,
  FileText,
  MessageSquareText,
  Newspaper,
  LucideIcon,
} from "lucide-react";

interface NavSubItem {
  title: string;
  url: string;
  permission: string;
}

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  permission?: string;
  items?: NavSubItem[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navStructureData: NavGroup[] = [
  {
    title: "Umum",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        permission: "dashboard",
      },
      {
        title: "Profil",
        url: "/dashboard/profiles",
        icon: UserCircle,
        permission: "profile",
      },
    ],
  },

  {
    title: "Layanan Publik",
    items: [
      {
        title: "Articles",
        url: "/dashboard/articles",
        icon: Newspaper,
        permission: "articles",
      },
      {
        title: "Dokumen",
        url: "/dashboard/documents",
        icon: FileText,
        permission: "documents",
      },
      {
        title: "Aspirasi",
        url: "/dashboard/aspirations",
        icon: MessageSquareText,
        permission: "aspirations",
      },
      {
        title: "Arsip",
        url: "/dashboard/archives",
        icon: Archive,
        permission: "archives",
      },
      {
        title: "Map Bencana",
        url: "/dashboard/maps",
        icon: MapPin,
        permission: "maps",
      },
    ],
  },

  {
    title: "Administrasi",
    items: [
      {
        title: "Users",
        url: "/dashboard/users",
        icon: Users,
        permission: "users",
      },
      {
        title: "Permissions",
        url: "/dashboard/permissions",
        icon: ShieldCheck,
        permission: "permissions",
      },
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
        permission: "settings",
      },
    ],
  },
];

// ============================================
// Derived Exports
// ============================================

function extractNavigationResources(): string[] {
  const resources = new Set<string>();

  for (const group of navStructureData) {
    for (const item of group.items) {
      if (item.permission) {
        resources.add(item.permission);
      }
      if (item.items) {
        for (const subItem of item.items) {
          resources.add(subItem.permission);
        }
      }
    }
  }

  return Array.from(resources);
}

/**
 * Navigation resources auto-derived from navStructureData.
 * Used for permission caching optimization.
 */
export const navigationResources = extractNavigationResources();

export const getNavStructure = () => navStructureData;
