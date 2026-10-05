import {
  LayoutDashboard,
  Link as LinkIcon,
  Palette,
  BarChart3,
  CreditCard,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface DashboardNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  description: string;
}

export interface DashboardNavGroup {
  id: "workspace" | "account";
  label: string;
  items: DashboardNavItem[];
}

export const DASHBOARD_NAV_GROUPS: DashboardNavGroup[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      {
        id: "overview",
        label: "Overview",
        href: "/dashboard/overview",
        icon: LayoutDashboard,
        exact: true,
        description: "At-a-glance performance summary and quick actions.",
      },
      {
        id: "links",
        label: "My Links",
        href: "/dashboard",
        icon: LinkIcon,
        exact: true,
        description: "Manage and reorder links, payments, and buttons.",
      },
      {
        id: "appearance",
        label: "Appearance",
        href: "/dashboard/appearance",
        icon: Palette,
        description: "Customize your profile theme, fonts, and colors.",
      },
      {
        id: "analytics",
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
        description: "Detailed traffic, conversion, and campaign analytics.",
      },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      {
        id: "billing",
        label: "Billing & Plans",
        href: "/dashboard/monetization",
        icon: CreditCard,
        description: "Manage subscription plans, invoices, and entitlements.",
      },
      {
        id: "settings",
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        description: "Update username, display name, and preferences.",
      },
    ],
  },
];

export const ALL_DASHBOARD_NAV_ITEMS = DASHBOARD_NAV_GROUPS.flatMap(
  (group) => group.items
);

export function getDashboardPageMeta(pathname: string) {
  // First match exact routes
  const exactMatch = ALL_DASHBOARD_NAV_ITEMS.find((item) => item.href === pathname);
  if (exactMatch) return exactMatch;

  // Then match prefix routes (e.g. /dashboard/analytics/...)
  const prefixMatch = ALL_DASHBOARD_NAV_ITEMS.find(
    (item) => !item.exact && pathname.startsWith(item.href)
  );
  if (prefixMatch) return prefixMatch;

  // Fallback for /dashboard default
  if (pathname === "/dashboard") {
    return ALL_DASHBOARD_NAV_ITEMS.find((item) => item.id === "links") || ALL_DASHBOARD_NAV_ITEMS[0];
  }

  return {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Manage your personalized Linkle profile.",
  };
}
