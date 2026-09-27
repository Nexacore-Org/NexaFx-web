import { render, screen } from "@testing-library/react";
import Footer from "@/components/landing/Footer";

jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt, ...props }: { alt: string }) => <img alt={alt} {...props} />,
}));

describe("Footer", () => {
  it.each([
    ["Exchange", "/dashboard/convert"],
    ["Wallet", "/dashboard/transfers"],
    ["Rates", "/dashboard"],
    ["Privacy", "/privacy"],
    ["Terms", "/terms"],
    ["Support", "/dashboard/support"],
    ["Status", "/status"],
  ])("renders %s as a link to %s", (label, href) => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: label })).toHaveAttribute("href", href);
  });

  it("labels items without a page as coming soon instead of linking them", () => {
    render(<Footer />);
    for (const label of ["Security", "About", "Press"]) {
      expect(screen.queryByRole("link", { name: new RegExp(label) })).not.toBeInTheDocument();
      expect(screen.getByText(label, { exact: false })).toHaveTextContent(/coming soon/i);
    }
  });

  it("has no placeholder '#' hrefs", () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('a[href="#"]')).toBeNull();
  });

  it("computes the copyright year dynamically", () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(`© ${year} NexaFX. All rights reserved.`)).toBeInTheDocument();
  });
});
