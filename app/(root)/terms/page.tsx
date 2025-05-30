"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { TermsOfServiceSkeleton } from "@/components/skeletons/TermsOfServiceSkeleton";
import { termsData } from "@/utils/Data";
import Link from "next/link";

export default function TermsOfService() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <TermsOfServiceSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="w-full pt-4 pb-3">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Back to home</span>
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Terms of Service</h1>
          <p className="text-sm text-gray-500">Last updated: March 15, 2023</p>
        </div>

        {termsData.sections.map((section) => (
          <section key={section.id} className={`mb-6`}>
            <h2 className="font-semibold mb-2">
              {section.id}. {section.title}
            </h2>
            {section.content.map((paragraph, index) => (
              <p key={index} className="text-sm mb-3">
                {paragraph}{" "}
                {section.id === 11 ? (
                  <a href="#" className="text-blue-500 underline">
                    legal@nexafx.com
                  </a>
                ) : null}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
