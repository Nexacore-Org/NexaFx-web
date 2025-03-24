import type React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LeftSideContent from "./left-side-content";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[1000px] bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-2 md:gap-8">
          <div className="flex flex-col">
            <Link
              href="/"
              className="flex items-center text-gray-600 mb-6 w-fit"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Back to home</span>
            </Link>

            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="text-blue-500 font-bold text-2xl mr-1">N</div>
                <div className="text-yellow-500 font-bold text-2xl mr-1">/</div>
                <div className="text-blue-500 font-bold text-2xl">NexaFX</div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
              <p className="text-gray-600">{subtitle}</p>
            </div>

            <LeftSideContent />
          </div>

          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
