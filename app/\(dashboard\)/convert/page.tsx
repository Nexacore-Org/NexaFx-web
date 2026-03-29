import { ConvertForm } from "@/components/dashboard/convert/convert-form";

export const metadata = {
    title: "Convert - NexaFX",
    description: "Convert between multiple currencies at real-time rates",
};

export default function ConvertPage() {
    return (
        <div className="w-full min-h-screen bg-background pb-8">
            {/* Header with background */}
            <div className="bg-gradient-to-b from-primary/5 to-transparent border-b border-border">
                <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        Convert
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                        Exchange currencies at competitive rates. Lock in your rate and complete the transaction instantly.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Left Column - Form */}
                    <div className="flex-1">
                        <ConvertForm />
                    </div>

                    {/* Right Column - Info Card (hidden on mobile) */}
                    <div className="hidden lg:flex lg:w-80 flex-col gap-6">
                        {/* Features Card */}
                        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
                            <h3 className="font-semibold text-foreground">Why Convert with NexaFX?</h3>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-primary">✓</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        Real-time exchange rates updated constantly
                                    </span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-primary">✓</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        Competitive rates with minimal spreads
                                    </span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-primary">✓</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        Support for fiat and cryptocurrencies
                                    </span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-primary">✓</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        Locked rates at checkout for protection
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* FAQ Card */}
                        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
                            <h3 className="font-semibold text-foreground">How it works</h3>
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <p>
                                    <span className="font-semibold text-foreground">1. Select currencies</span> — Choose your from and to currencies
                                </p>
                                <p>
                                    <span className="font-semibold text-foreground">2. Enter amount</span> — Specify the amount you want to convert
                                </p>
                                <p>
                                    <span className="font-semibold text-foreground">3. Preview rate</span> — See the exchange rate and converted amount
                                </p>
                                <p>
                                    <span className="font-semibold text-foreground">4. Confirm</span> — Lock in your rate and complete the transaction
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
