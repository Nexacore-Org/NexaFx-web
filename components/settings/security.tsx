"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteProfile } from "@/lib/api/users";

export function Security() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteProfile();
      localStorage.clear();
      router.push("/sign-in");
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete account"
      );
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="rounded-2xl border-[#8C8C8C] border-[0.25px] bg-card">
        <h3 className="text-muted-foreground mb-4.5 font-semibold text-base mx-5 pt-6.25 pb-4.5 dark:text-white dark:border-slate-300 border-[#00000026] border-b">
          General
        </h3>

        <div className="space-y-6 pb-5">
          <div className="flex max-sm:flex-col max-sm:items-start justify-between items-center gap-6 px-5">
            <div className="max-w-124.25">
              <h4 className="text-foreground font-semibold text-[15px] sm:text-lg">
                Session Activity Logs
              </h4>
              <p className="text-[12px] text-muted-foreground font-normal">
                Lorem ipsum dolor sit amet consectetur. Commodo tellus velit
                lectus cursus ac odio elit ultrices. Felis sed id dui viverra
                dignissim consectetur orci.
              </p>
            </div>
            <button className="button-verify shrink-0 rounded-[19px] w-21.5 h-7 cursor-pointer text-[14px] font-semibold">
              <span className="bg-background text-foreground rounded-[19px]">
                View Logs
              </span>
            </button>
          </div>

          <div className="flex max-sm:flex-col max-sm:items-start justify-between items-center gap-6 px-5">
            <div className="max-w-124.25">
              <h4 className="text-foreground font-semibold text-[15px] sm:text-lg">
                Device Logged in
              </h4>
              <p className="text-[12px] text-muted-foreground font-normal">
                Lorem ipsum dolor sit amet consectetur. Commodo tellus velit
                lectus cursus ac odio elit ultrices. Felis sed id dui viverra
                dignissim consectetur orci.
              </p>
            </div>
            <button className="button-verify shrink-0 rounded-[19px] w-21.5 h-7 cursor-pointer text-[14px] font-semibold">
              <span className="bg-background text-foreground rounded-[19px]">
                Manage
              </span>
            </button>
          </div>
          <div className="flex max-sm:flex-col max-sm:items-start justify-between items-center gap-6 px-5">
            <div className="max-w-124 .25">
              <h4 className="text-foreground font-semibold text-[15px] sm:text-lg">
                Log out all device
              </h4>
              <p className="text-[12px] text-muted-foreground font-normal">
                Lorem ipsum dolor sit amet consectetur. Commodo tellus velit
                lectus cursus ac odio elit ultrices. Felis sed id dui viverra
                dignissim consectetur orci.
              </p>
            </div>
            <button className="flex shrink-0 text-sm w-23.5 justify-center items-center gap-1.5 cursor-pointer border h-8 border-border hover:bg-muted text-foreground font-semibold transition-colors">
              <Trash2 className="size-4" /> Log out
            </button>
          </div>

          <div className="flex max-sm:flex-col max-sm:items-start justify-between items-center gap-6 px-5">
            <div className="max-w-124.25">
              <h4 className="text-foreground font-semibold text-[15px] sm:text-lg">
                Delete My Account
              </h4>
              <p className="text-[12px] text-muted-foreground font-normal">
                Lorem ipsum dolor sit amet consectetur. Commodo tellus velit
                lectus cursus ac odio elit ultrices. Felis sed id dui viverra
                dignissim consectetur orci.
              </p>
            </div>
            <button
              onClick={() => setShowConfirm(true)}
              className="flex shrink-0 text-sm w-23.5 justify-center items-center gap-1.5 cursor-pointer bg-[#E90004] h-8 text-white font-semibold rounded-xl"
            >
              <Trash2 className="size-4 text-white" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 md:flex-row flex-col md:max-w-105.25 mt-10 mb-3.5 ml-auto">
        <button className="flex-1 cursor-pointer py-4 bg-[#F0BB16] hover:bg-yellow-500 rounded-sm text-black font-medium transition-colors md:text-sm">
          Save Changes
        </button>
        <button className="flex-1 cursor-pointer py-4 border border-border hover:bg-muted text-foreground font-semibold rounded-sm transition-colors">
          Cancel
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => !isDeleting && setShowConfirm(false)}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-card rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
              <h3 className="text-base font-semibold text-center text-foreground">
                Are you sure?
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                This action cannot be undone. Your account and all associated
                data will be permanently deleted.
              </p>
              {deleteError && (
                <p className="text-xs text-destructive text-center">
                  {deleteError}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-lg bg-[#E90004] text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
