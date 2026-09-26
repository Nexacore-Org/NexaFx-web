import Image from "next/image";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

// Data-driven footer link config (Issue #864): adding or reordering a link is
// a one-line data change instead of a JSX edit.
//
// Hrefs map to real app routes where they exist. Routes that do not have a
// page yet keep a `#` placeholder so the live app never 404s — the canonical
// destinations are supplied by the separately-tracked Footer dead-link fix.
const footerLinks: FooterColumn[] = [
  {
    title: "PLATFORM",
    links: [
      { label: "Exchange", href: "/dashboard/convert" },
      { label: "Wallet", href: "/dashboard/transfers" },
      { label: "Rates", href: "#" },
    ],
  },
  {
    title: "LEGAL",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { label: "Support", href: "/dashboard/support" },
      { label: "About", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
];

export default function Footer() {
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
          <div>
            <p className="font-bold mb-4">PLATFORM</p>
            <p className="mb-4 text-gray-500">Exchange</p>
            <p className="mb-4 text-gray-500">Wallet</p>
            <p className="mb-4 text-gray-500">Rates</p>
          </div>

          <div>
            <p className="font-bold mb-4">LEGAL</p>
            <p className="mb-4 text-gray-500">Privacy</p>
            <p className="mb-4 text-gray-500">Terms</p>
            <p className="mb-4 text-gray-500">Security</p>
          </div>

          <div>
            <p className="font-bold mb-4">COMPANY</p>
            <p className="mb-4 text-gray-500">Support</p>
            <p className="mb-4 text-gray-500">About</p>
            <p className="mb-4 text-gray-500">Press</p>
            <p className="mb-4 text-gray-500"><a href="/status" className="text-yellow-600">Status</a></p>
          </div>
          {footerLinks.map((column) => (
            <div key={column.title}>
              <p className="font-bold mb-4">{column.title}</p>
              {column.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block mb-4 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-10">
        © 2024 NexaFX. All rights reserved.
      </p>
    </footer>
  );
}
