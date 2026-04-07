import {
  UserCircle,
  LayoutDashboard,
  BarChart3,
  Newspaper,
  Briefcase,
  Download,
  BookOpen,
  FlaskConical,
  ScrollText,
  GraduationCap,
  Users,
  BookCheck,
  MapPin,
  FileSignature,
  Mail,
  Archive,
  ShieldCheck,
  Building2,
  LucideIcon,
} from "lucide-react";

interface NavSubItem {
  titleKey: string;
  url: string;
  permission: string;
}

interface NavItem {
  titleKey: string;
  url: string;
  icon: LucideIcon;
  permission?: string;
  items?: NavSubItem[];
}

interface NavGroup {
  titleKey: string;
  items: NavItem[];
}

export const navStructureData: NavGroup[] = [
  // ==========================================
  // 1. AREA PERSONAL & CORE (Polymorphic Area)
  // ==========================================
  {
    titleKey: "personal-area",
    items: [
      {
        titleKey: "my-profile",
        url: "/dashboard/profiles",
        icon: UserCircle,
        permission: "personal_profile",
      },
    ],
  },

  // ==========================================
  // 2. PORTAL & INFORMASI
  // ==========================================
  {
    titleKey: "portal-information",
    items: [
      {
        titleKey: "dashboard-analytics",
        url: "/dashboard",
        icon: LayoutDashboard,
        permission: "dashboard",
      },
      {
        titleKey: "news-publications",
        url: "/dashboard/portal/articles",
        icon: Newspaper,
        permission: "portal_content",
      },
      {
        titleKey: "student-projects",
        url: "/dashboard/portal/projects",
        icon: Briefcase,
        permission: "portal_content",
      },
      {
        titleKey: "download-center",
        url: "/dashboard/portal/downloads",
        icon: Download,
        permission: "portal_content",
      },
    ],
  },

  // ==========================================
  // 3 & 4. AKADEMIK, LAB & RISET
  // ==========================================
  {
    titleKey: "academic-research",
    items: [
      {
        titleKey: "academic-master",
        url: "#",
        icon: BookOpen,
        items: [
          {
            titleKey: "curriculum-data",
            url: "/dashboard/academics/curriculums",
            permission: "academic_master",
          },
          {
            titleKey: "subjects-data",
            url: "/dashboard/academics/subjects",
            permission: "academic_master",
          },
          {
            titleKey: "lecturers-management",
            url: "/dashboard/academics/lecturers",
            permission: "academic_master",
          },
          {
            titleKey: "accreditation-data",
            url: "/dashboard/academics/accreditations",
            permission: "academic_master",
          },
        ],
      },
      {
        titleKey: "lab-and-research",
        url: "#",
        icon: FlaskConical,
        items: [
          {
            titleKey: "lab-facilities",
            url: "/dashboard/academics/laboratories",
            permission: "academic_master",
          },
          {
            titleKey: "research-publications",
            url: "/dashboard/academics/publications",
            permission: "academic_master",
          },
          {
            titleKey: "laboratory-booking",
            url: "/dashboard/academics/laboratories",
            permission: "academic_master",
          },
        ],
      },
    ],
  },

  // ==========================================
  // 5. KKN & MAGANG (Eksternal)
  // ==========================================
  {
    titleKey: "external-programs",
    items: [
      {
        titleKey: "dashboard-analytics",
        url: "/dashboard/programs/analytics",
        icon: BarChart3,
        permission: "programs",
      },
      {
        titleKey: "program-registration",
        url: "/dashboard/programs/registration",
        icon: GraduationCap,
        permission: "programs",
      },
      {
        titleKey: "supervisor-plotting",
        url: "/dashboard/programs/plotting",
        icon: Users,
        permission: "programs",
      },
      {
        titleKey: "daily-logbook",
        url: "/dashboard/programs/logbooks",
        icon: BookCheck,
        permission: "programs",
      },
      {
        titleKey: "partner-locations",
        url: "/dashboard/programs/partners",
        icon: MapPin,
        permission: "programs",
      },
    ],
  },

  // ==========================================
  // 6. TUGAS AKHIR
  // ==========================================
  {
    titleKey: "thesis-management",
    items: [
      {
        titleKey: "dashboard-analytics",
        url: "/dashboard/thesis/analytics",
        icon: BarChart3,
        permission: "thesis",
      },
      {
        titleKey: "thesis-proposals",
        url: "/dashboard/thesis/proposals",
        icon: ScrollText,
        permission: "thesis",
      },
      {
        titleKey: "supervisor-plotting",
        url: "/dashboard/thesis/plotting",
        icon: Users,
        permission: "thesis",
      },
      {
        titleKey: "thesis-approvals",
        url: "/dashboard/thesis/approvals",
        icon: FileSignature,
        permission: "thesis",
      },
      {
        titleKey: "defense-schedule",
        url: "/dashboard/thesis/defense",
        icon: Users,
        permission: "thesis",
      },
    ],
  },

  // ==========================================
  // 7. PERSURATAN & BIROKRASI
  // ==========================================
  {
    titleKey: "bureaucracy-letters",
    items: [
      {
        titleKey: "dashboard-analytics",
        url: "/dashboard/letters/analytics",
        icon: BarChart3,
        permission: "letters",
      },
      {
        titleKey: "request-letter",
        url: "/dashboard/letters/request",
        icon: Mail,
        permission: "letters",
      },
      {
        titleKey: "letter-approval",
        url: "/dashboard/letters/processing",
        icon: FileSignature,
        permission: "letters",
      },
      {
        titleKey: "letter-archive",
        url: "/dashboard/letters/archive",
        icon: Archive,
        permission: "letters",
      },
    ],
  },

  // ==========================================
  // SUPERADMIN AREA
  // ==========================================
  {
    titleKey: "system-security",
    items: [
      {
        titleKey: "user-directory",
        url: "/dashboard/system/users",
        icon: Users,
        permission: "system_users",
      },
      {
        titleKey: "role-permissions",
        url: "/dashboard/system/roles",
        icon: ShieldCheck,
        permission: "system_roles",
      },
      {
        titleKey: "web-configuration",
        url: "/dashboard/system/settings",
        icon: Building2,
        permission: "system_settings",
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

/**
 * Get translated navigation structure for sidebar.
 * @param t - Translation function from next-intl
 */
export const getNavStructure = (t: (key: string) => string) =>
  navStructureData.map((group) => ({
    title: t(group.titleKey),
    items: group.items.map((item) => ({
      title: t(item.titleKey),
      url: item.url,
      icon: item.icon,
      permission: item.permission,
      ...(item.items && {
        items: item.items.map((subItem) => ({
          title: t(subItem.titleKey),
          url: subItem.url,
          permission: subItem.permission,
        })),
      }),
    })),
  }));
