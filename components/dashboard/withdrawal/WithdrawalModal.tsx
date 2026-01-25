"use client";

import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import { WithdrawalMethodSelect } from "./WithdrawalMethodSelect";
import { WithdrawalForm } from "./WithdrawalForm";
import { WithdrawalReview } from "./WithdrawalReview";
import { WithdrawalSuccess } from "./WithdrawalSuccess";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function WithdrawalModal() {
    const { isOpen, step, close, reset } = useWithdrawalStore();

    if (!isOpen) return null;

    const handleClose = () => {
        close();
        // Reset after animation
        setTimeout(() => reset(), 300);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const renderStep = () => {
        switch (step) {
            case 'select':
                return <WithdrawalMethodSelect />;
            case 'form':
                return <WithdrawalForm />;
            case 'review':
            case 'processing':
                return <WithdrawalReview />;
            case 'success':
            case 'error':
                return <WithdrawalSuccess />;
            default:
                return <WithdrawalMethodSelect />;
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={handleBackdropClick}
            />

            {/* Modal - Desktop */}
            <div
                className={cn(
                    "fixed z-50 animate-in fade-in slide-in-from-bottom-4 duration-300",
                    // Desktop: centered modal
                    "hidden md:flex md:items-center md:justify-center md:inset-0 md:p-4"
                )}
                onClick={handleBackdropClick}
            >
                <div className="relative w-full max-w-md bg-card rounded-xl shadow-2xl overflow-hidden">
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
                    >
                        <X className="size-5 text-muted-foreground" />
                    </button>
                    {renderStep()}
                </div>
            </div>

            {/* Modal - Mobile (Full Screen) */}
            <div
                className={cn(
                    "fixed inset-0 z-50 md:hidden",
                    "bg-card animate-in slide-in-from-bottom duration-300"
                )}
            >
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
                >
                    <X className="size-5 text-muted-foreground" />
                </button>
                <div className="h-full overflow-y-auto">
                    {renderStep()}
                </div>
            </div>
        </>
    );
}
