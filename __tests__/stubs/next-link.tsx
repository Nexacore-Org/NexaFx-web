import React from "react";

// Test stub for next/link — renders a plain anchor without app-router context.
type LinkProps = {
  children: React.ReactNode;
  href: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export default function Link({ children, href, ...props }: LinkProps) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
