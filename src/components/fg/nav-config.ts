import {
  Clock,
  Film,
  LayoutGrid,
  ScanSearch,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  to: "/" | "/videos" | "/analysis" | "/history" | "/profiles" | "/settings";
  icon: LucideIcon;
  match: string[];
}

export const WORKSPACE_NAV: NavItem[] = [
  { title: "Overview", to: "/", icon: LayoutGrid, match: ["/"] },
  { title: "My Videos", to: "/videos", icon: Film, match: ["/videos"] },
  {
    title: "Analysis",
    to: "/analysis",
    icon: ScanSearch,
    match: ["/analysis", "/compatibility", "/preparation", "/review", "/processing", "/verification", "/export"],
  },
  { title: "History", to: "/history", icon: Clock, match: ["/history"] },
];

export const CONFIG_NAV: NavItem[] = [
  { title: "Platform Profiles", to: "/profiles", icon: ShieldCheck, match: ["/profiles"] },
  { title: "Settings", to: "/settings", icon: Settings, match: ["/settings"] },
];

export const PAGE_CONTEXT: Record<string, { section: string; title: string }> = {
  "/": { section: "Workspace", title: "Overview" },
  "/videos": { section: "Prepare", title: "Select video" },
  "/analysis": { section: "Prepare", title: "Analysis" },
  "/compatibility": { section: "Prepare", title: "Compatibility" },
  "/preparation": { section: "Prepare", title: "Preparation" },
  "/review": { section: "Prepare", title: "Review" },
  "/processing": { section: "Prepare", title: "Processing" },
  "/verification": { section: "Prepare", title: "Verification" },
  "/export": { section: "Prepare", title: "Export & share" },
  "/history": { section: "Workspace", title: "History" },
  "/profiles": { section: "Configuration", title: "Platform profiles" },
  "/settings": { section: "Configuration", title: "Settings" },
};
