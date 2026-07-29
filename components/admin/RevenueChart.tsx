"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function RevenueChart() {
    return (
        <div className="flex-1 min-w-0 h-63.25 py-2.5 px-5 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground flex items-center">
                            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$12,314.50</div>
                        <p className="text-xs text-muted-foreground flex items-center">
                            <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                            -4.5% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>
            {/* TODO: Integrate with backend GET /admin/metrics to fetch real data */}
        </div>
    );
}
