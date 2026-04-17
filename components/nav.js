"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Predictor" },
  { href: "/social", label: "Friend Feed" },
  { href: "/friends/aarya", label: "Profiles" }
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <div className="top-nav">
      <div className="container top-nav-inner">
        <Link href="/" className="brand-lockup">
          <div className="brand-mark" />
          <div>
            <p className="brand-title display">binge-d</p>
            <p className="brand-subtitle pixel">predict the next obsession</p>
          </div>
        </Link>

        <div className="nav-row">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`chip ${pathname === item.href ? "nav-active" : ""}`}
              style={{
                borderColor: pathname === item.href ? "rgba(81, 243, 255, 0.35)" : undefined,
                background: pathname === item.href ? "rgba(81, 243, 255, 0.08)" : undefined
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
