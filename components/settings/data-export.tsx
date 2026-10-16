"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormError } from "./settings-section";
import {
  type DataExportRequest,
  type ExportStatus,
  requestDataExport,
  getDataExportStatus,
} from "@/lib/api/user";

const formSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof formSchema>;

function statusLabel(status: ExportStatus): string {
  switch (status) {
    case "requested":
      return "Requested";
    case "preparing":
      return "Preparing";
    case "ready":
      return "Ready";
    case "expired":
      return "Expired";
    default:
      return status;
  }
}

function canRequestAgain(exp?: string | null): boolean {
  if (!exp) return false;
  const expMs = new Date(exp).getTime();
  if (Number.isNaN(expMs)) return false;
  return Date.now() > expMs;
}

export default function DataExport() {
  const [open, setOpen] = useState(false);
  const [exportInfo, setExportInfo] = useState<DataExportRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "" },
  });

  useEffect(() => {
    let mounted = true;
    async function fetchLatest() {
      try {
        const latest = await getDataExportStatus();
        if (mounted) {
          setExportInfo(latest);
        }
      } catch {
        if (mounted) {
          setError("Failed to load export status");
        }
      }
    }
    fetchLatest();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!exportInfo) return;
    if (exportInfo.status === "preparing") {
      setIsPolling(true);
      const id = setInterval(async () => {
        try {
          const updated = await getDataExportStatus(exportInfo.requestId);
          if (updated) {
            setExportInfo(updated);
            if (updated.status !== "preparing") {
              setIsPolling(false);
            }
          } else {
            setIsPolling(false);
          }
        } catch {
          // ignore polling errors; stop after a few attempts is not required
        }
      }, 5000);
      return () => clearInterval(id);
    }
    setIsPolling(false);
  }, [exportInfo]);

  const isPending = exportInfo && (exportInfo.status === "requested" || exportInfo.status === "preparing");
  const canDownload = exportInfo && exportInfo.status === "ready" && exportInfo.downloadUrl;
  const canRequestNew = !isPending && (exportInfo?.status === "expired" || canRequestAgain(exportInfo?.canRequestAgainAt));

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);
    try {
      const res = await requestDataExport(values.password);
      setExportInfo(res);
      form.reset();
      setOpen(false);
    } catch (e: any) {
      setError(e?.message || "Failed to request export");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Download my data</h3>
          <p className="text-sm text-muted-foreground">
            Request an export of your account data. We'll notify you when it's ready to download.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={!!isPending}>Request export</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request data export</DialogTitle>
              <DialogDescription>
                Re-enter your password to confirm this request.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="current-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormError message={error} />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Requesting..." : "Request export"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {exportInfo && (
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export status</p>
              <p className="text-sm text-muted-foreground">Status: {statusLabel(exportInfo.status)}</p>
            </div>
            {isPolling && <p className="text-sm text-muted-foreground">Checking...</p>}
          </div>
          {canDownload && exportInfo.downloadUrl && (
            <a
              href={exportInfo.downloadUrl}
              download
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
            >
              Download
            </a>
          )}
          {exportInfo.status === "expired" && (
            <Alert>
              <AlertDescription>
                Your export has expired. You can request a new export.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
      {error && !exportInfo && <FormError message={error} />}
    </div>
  );
}
