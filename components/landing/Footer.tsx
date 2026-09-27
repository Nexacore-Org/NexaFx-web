import Image from "next/image";
import Link from "next/link";

export interface FooterLink {
  label: string;
  /** Omit for destinations that don't exist yet — rendered as "Coming soon". */
  href?: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

// Data-driven footer link config (Issue #864): adding or reordering a link is
// a one-line data change instead of a JSX edit.
//
// Every href points at a real route. Items without a page yet omit `href` and
// are explicitly labelled "Coming soon" rather than posing as working links.
const footerLinks: FooterColumn[] = [
  {
    title: "PLATFORM",
    links: [
      { label: "Exchange", href: "/dashboard/convert" },
      { label: "Wallet", href: "/dashboard/transfers" },
      { label: "Rates", href: "/dashboard" },
    ],
  },
  {
    title: "LEGAL",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Security" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { label: "Support", href: "/dashboard/support" },
      { label: "Status", href: "/status" },
      { label: "About" },
      { label: "Press" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t py-12">
      <div className="max-w-[1440px] px-6 md:px-12 mx-auto flex flex-col md:flex-row justify-between gap-10">
        <div>
          <Image
            src="/logo.png"
            alt="NexaFX Logo"
            width={120}
            height={40}
            sizes="120px"
            className="object-contain mb-4"
          />
          <p className="text-sm text-slate-500 max-w-sm">
            Secure and fast Web3 currency exchange platform.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-20 lg:gap-40 text-sm">
          {footerLinks.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="font-bold mb-4">{column.title}</p>
              {column.links.map((link) =>
                link.href ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block mb-4 text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <span
                    key={link.label}
                    aria-disabled="true"
                    className="block mb-4 text-gray-400 cursor-default"
                  >
                    {link.label}{" "}
                    <span className="text-xs text-gray-400">(Coming soon)</span>
                  </span>
                ),
              )}
            </nav>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-10">
        © {year} NexaFX. All rights reserved.
      </p>
    </footer>
  );
}
