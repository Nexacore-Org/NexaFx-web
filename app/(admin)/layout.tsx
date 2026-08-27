import type { Metadata } from "next";
import AdminLayoutClient from "./admin-layout-client";
import { AdminErrorBoundary } from "@/components/shared/error-boundary";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminErrorBoundary>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminErrorBoundary>
  );
}
