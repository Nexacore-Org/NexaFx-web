"use client";

import { useState, useEffect } from "react";
import {
  KeyRound,
  Webhook,
  BarChart3,
  Shield,
  Zap,
  Check,
  Mail,
  Building2,
  User,
  Send,
  Sparkles,
  Globe,
  Lock,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: KeyRound,
    title: "API Key Management",
    description:
      "Generate and manage API keys with granular permissions. Rotate keys securely and monitor usage in real time.",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-500",
    gradientBorder: "hover:border-violet-500/30",
  },
  {
    icon: BarChart3,
    title: "Usage Analytics",
    description:
      "Track request volume, success rates, and latency with detailed dashboards. Export data for your own analysis.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500",
    gradientBorder: "hover:border-blue-500/30",
  },
  {
    icon: Webhook,
    title: "Real-Time Webhooks",
    description:
      "Receive instant notifications for events like completed transactions, exchange rate updates, and account changes.",
    gradient: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-500",
    gradientBorder: "hover:border-emerald-500/30",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "OAuth 2.0 authentication, IP whitelisting, rate limiting, and full audit logging to keep your integrations safe.",
    gradient: "from-orange-500/20 to-amber-500/20",
    iconColor: "text-orange-500",
    gradientBorder: "hover:border-orange-500/30",
  },
  {
    icon: Globe,
    title: "Live Exchange Rates",
    description:
      "Access real-time and historical exchange rates for all supported currency pairs via a single REST endpoint.",
    gradient: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-500",
    gradientBorder: "hover:border-pink-500/30",
  },
  {
    icon: Lock,
    title: "Rate Limiting & Quotas",
    description:
      "Transparent rate limits with per-endpoint quotas. Upgrade your tier as your integration scales.",
    gradient: "from-indigo-500/20 to-blue-500/20",
    iconColor: "text-indigo-500",
    gradientBorder: "hover:border-indigo-500/30",
  },
];

const useCases = [
  "Payment processing",
  "Currency conversion",
  "Account management",
  "Data analytics",
  "Trading automation",
  "Other",
];

export default function DeveloperPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    useCase: "",
    subscribeUpdates: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }
    if (!formData.useCase) errors.useCase = "Please select a use case";
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);

    // Simulate API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error on change
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="relative space-y-16">
        {/* ─── Hero Section ─── */}
        <section className="pt-8 md:pt-16 text-center space-y-8">
          <div className="flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
            <Badge variant="warning" className="px-4 py-1.5 text-sm font-medium gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              Coming Soon
            </Badge>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
              Build on NexaFx
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-blue-500 bg-clip-text text-transparent">
                Your API, Your Way
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4 duration-700 delay-200 leading-relaxed">
              We&apos;re building a powerful API platform that lets you integrate
              NexaFx&apos;s currency exchange, payment, and account management
              capabilities directly into your applications.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/80 to-blue-500/80 border-2 border-background flex items-center justify-center text-[10px] font-bold text-white"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">200+</span> developers
              on the waitlist
            </p>
          </div>
        </section>

        {/* ─── Features Grid ─── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">
              Everything you need to build
            </h2>
            <p className="text-muted-foreground">
              A complete API toolkit for financial applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                variant="elevated"
                className={cn(
                  "group relative overflow-hidden transition-all duration-300",
                  "hover:shadow-lg hover:-translate-y-1",
                  feature.gradientBorder,
                )}
              >
                {/* Hover gradient overlay */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    "bg-gradient-to-br",
                    feature.gradient,
                  )}
                />

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        "relative z-10 rounded-xl p-3 bg-gradient-to-br",
                        feature.gradient,
                        "group-hover:scale-110 transition-transform duration-300",
                      )}
                    >
                      <feature.icon
                        className={cn("h-6 w-6", feature.iconColor)}
                      />
                    </div>
                    <Zap className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors duration-300" />
                  </div>
                  <h3 className="relative z-10 text-lg font-semibold mt-3">
                    {feature.title}
                  </h3>
                </CardHeader>
                <CardBody>
                  <p className="relative z-10 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* ─── Waitlist Form Section ─── */}
        <section className="max-w-2xl mx-auto w-full">
          <Card variant="elevated" className="border-primary/20 relative overflow-hidden">
            {/* Decorative top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-violet-500" />

            <CardHeader className="text-center pb-2">
              <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4 mx-auto">
                {isSubmitted ? (
                  <Check className="h-6 w-6 text-green-500" />
                ) : (
                  <Mail className="h-6 w-6 text-primary" />
                )}
              </div>
              <h2 className="text-2xl font-bold">
                {isSubmitted ? "You're on the list!" : "Get Early Access"}
              </h2>
              <p className="text-muted-foreground">
                {isSubmitted
                  ? "We'll notify you when the API launches. Stay tuned for updates and early-bird benefits."
                  : "Join the waitlist to be among the first to integrate with the NexaFx API."}
              </p>
            </CardHeader>

            <CardBody>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      error={formErrors.name}
                      leftIcon={<User className="h-4 w-4" />}
                    />
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      error={formErrors.email}
                      leftIcon={<Mail className="h-4 w-4" />}
                    />
                  </div>

                  <Input
                    label="Company (optional)"
                    name="company"
                    placeholder="Acme Corp"
                    value={formData.company}
                    onChange={handleChange}
                    leftIcon={<Building2 className="h-4 w-4" />}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">
                      How do you plan to use the API?
                    </label>
                    <select
                      name="useCase"
                      value={formData.useCase}
                      onChange={handleChange}
                      aria-invalid={!!formErrors.useCase}
                      className={cn(
                        "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors",
                        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
                        formErrors.useCase && "border-destructive focus-visible:ring-destructive/20",
                      )}
                    >
                      <option value="" disabled>
                        Select a use case...
                      </option>
                      {useCases.map((uc) => (
                        <option key={uc} value={uc}>
                          {uc}
                        </option>
                      ))}
                    </select>
                    {formErrors.useCase && (
                      <p className="text-xs text-destructive">
                        {formErrors.useCase}
                      </p>
                    )}
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="subscribeUpdates"
                      checked={formData.subscribeUpdates}
                      onChange={handleChange}
                      className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary focus:ring-offset-0"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      Send me product updates and launch announcements
                    </span>
                  </label>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2 group"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Joining waitlist...
                      </>
                    ) : (
                      <>
                        Join the Waitlist
                        <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    No spam, ever. We&apos;ll only email you about the API
                    launch and major updates.
                  </p>
                </form>
              ) : (
                <div className="space-y-6 text-center py-4">
                  <div className="space-y-3">
                    <div className="inline-flex items-center justify-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full">
                      <Check className="h-4 w-4" />
                      Successfully registered
                    </div>
                    <p className="text-muted-foreground">
                      Thanks, <span className="font-semibold text-foreground">{formData.name}</span>!
                      We&apos;ll send updates to{" "}
                      <span className="font-semibold text-foreground">{formData.email}</span>.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                    <div className="rounded-lg border bg-card p-3 text-center space-y-1">
                      <p className="text-2xl font-bold text-primary">Q3</p>
                      <p className="text-xs text-muted-foreground">Beta Launch</p>
                    </div>
                    <div className="rounded-lg border bg-card p-3 text-center space-y-1">
                      <p className="text-2xl font-bold text-primary">Q4</p>
                      <p className="text-xs text-muted-foreground">Public Release</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        company: "",
                        useCase: "",
                        subscribeUpdates: true,
                      });
                    }}
                  >
                    Register another email
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </section>

        {/* ─── Roadmap Preview ─── */}
        <section className="max-w-4xl mx-auto w-full space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">What&apos;s Coming</h2>
            <p className="text-muted-foreground">
              Our roadmap for the NexaFx public API
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                phase: "Phase 1",
                title: "Beta",
                icon: Zap,
                items: [
                  "REST API with auth",
                  "Exchange rate endpoints",
                  "API key management",
                  "Rate limiting",
                ],
                gradient: "from-violet-500/10 to-purple-500/10",
                border: "border-violet-500/20",
              },
              {
                phase: "Phase 2",
                title: "Production",
                icon: Activity,
                items: [
                  "Transaction processing",
                  "Account management",
                  "Webhook notifications",
                  "Usage dashboard",
                ],
                gradient: "from-blue-500/10 to-cyan-500/10",
                border: "border-blue-500/20",
              },
              {
                phase: "Phase 3",
                title: "Enterprise",
                icon: Shield,
                items: [
                  "OAuth 2.0 integration",
                  "IP whitelisting",
                  "Custom rate limits",
                  "SLA guarantees",
                ],
                gradient: "from-emerald-500/10 to-green-500/10",
                border: "border-emerald-500/20",
              },
            ].map((phase) => (
              <Card
                key={phase.phase}
                className={cn(
                  "border bg-gradient-to-br",
                  phase.gradient,
                  phase.border,
                )}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <phase.icon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">
                      {phase.phase}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mt-1">{phase.title}</h3>
                </CardHeader>
                <CardBody>
                  <ul className="space-y-2">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* ─── Bottom CTA ─── */}
        <section className="text-center space-y-4 pt-4">
          <p className="text-muted-foreground">
            Questions about the API? We&apos;d love to hear from you.
          </p>
          <Button variant="outline" size="lg" className="gap-2" asChild>
            <a href="mailto:api@nexafx.com">
              <Mail className="h-4 w-4" />
              Contact API Team
            </a>
          </Button>
        </section>
      </div>
    </div>
  );
}
