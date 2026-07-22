"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const segmentLabels: Record<string, string> = {
  admin: "Admin",
  analytics: "Analytics",
  messages: "Messages",
  customers: "Customers",
  media: "Media Library",
  cms: "CMS Editor",
  activity: "Activity Log",
  settings: "Settings",
  users: "User Management",
  inventory: "Inventory",
  faqs: "FAQ Management",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1 || segments[0] !== "admin") return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = segmentLabels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav className="px-6 pt-4 pb-2 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
      {crumbs.map((crumb) =>
        crumb.isLast ? (
          <span key={crumb.href} className="text-gray-600 dark:text-gray-300 font-medium">{crumb.label}</span>
        ) : (
          <span key={crumb.href} className="flex items-center gap-1.5">
            <Link href={crumb.href} className="hover:text-[var(--color-primary-light)] transition-colors">{crumb.label}</Link>
            <span>/</span>
          </span>
        )
      )}
    </nav>
  );
}
