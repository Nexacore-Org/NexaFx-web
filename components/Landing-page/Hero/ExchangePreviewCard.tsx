import { RefreshCw } from "lucide-react";
import { Button } from "../../ui/button";

export default function ExchangePreviewCard() {
  return (
    <div className="w-full max-w-md p-2 border bg-background rounded-lg shadow-xl">
      <div className="bg-gradient-to-b from-blue-50 to-yellow-50 dark:from-blue-950/20 dark:to-yellow-950/20 rounded-md p-6 hover:opacity-90 transition">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">From</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">NGN</span>
                <span className="text-muted-foreground">Nigerian Naira</span>
              </div>
            </div>
            <div className="bg-background rounded-full p-2 shadow-sm">
              <RefreshCw className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">To</p>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-2xl font-bold">USD</span>
                <span className="text-muted-foreground">US Dollar</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border bg-background p-3">
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-xl font-medium">100,000 NGN</p>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <p className="text-sm text-muted-foreground">You'll receive</p>
              <p className="text-xl font-medium">~65.78 USD</p>
            </div>
          </div>
          <div className="rounded-lg border bg-background p-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Exchange Rate</span>
              <span>1 USD = 1,520.25 NGN</span>
            </div>
          </div>
          <Button className="w-full bg-gradient-to-r from-blue-500 to-yellow-500 text-white">
            Exchange Now
          </Button>
        </div>
      </div>
    </div>
  );
}
