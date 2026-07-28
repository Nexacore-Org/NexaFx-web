'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { TrustScoreBreakdown } from '@/lib/utils/trust-score';

interface TrustScoreBadgeProps {
  score: number;
  breakdown: TrustScoreBreakdown;
  size?: 'sm' | 'md';
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
}

function getBgColor(score: number): string {
  if (score >= 70) return 'bg-green-50 border-green-200';
  if (score >= 40) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

function getCircleColor(score: number): string {
  if (score >= 70) return '#16a34a';
  if (score >= 40) return '#d97706';
  return '#dc2626';
}

const circumference = 2 * Math.PI * 18;
const radius = 18;

export function TrustScoreBadge({ score, breakdown, size = 'md' }: TrustScoreBadgeProps) {
  const percentage = Math.min(score, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const circleColor = getCircleColor(score);
  const textColor = getScoreColor(score);
  const bgColor = getBgColor(score);

  const items = [
    { label: 'KYC', value: breakdown.kyc, max: 30 },
    { label: 'Age', value: breakdown.accountAge, max: 20 },
    { label: 'Txns', value: breakdown.successfulTransactions, max: 10 },
    { label: 'No fails', value: breakdown.noRecentFailures, max: 10 },
    { label: 'Clean', value: breakdown.noFlagged, max: 10 },
    { label: '2FA', value: breakdown.twoFactor, max: 10 },
  ];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center justify-center rounded-full border ${bgColor} ${size === 'sm' ? 'p-1' : 'p-1.5'} cursor-help`}>
            <svg width={size === 'sm' ? 36 : 44} height={size === 'sm' ? 36 : 44} viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="4"
              />
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                stroke={circleColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 22 22)"
                style={{ transition: 'stroke-dashoffset 0.3s ease' }}
              />
              <text
                x="22"
                y="22"
                textAnchor="middle"
                dominantBaseline="central"
                className={`${textColor} font-bold`}
                style={{ fontSize: size === 'sm' ? '10px' : '12px', fill: 'currentColor' }}
              >
                {score}
              </text>
            </svg>
            <HelpCircle className={`text-gray-400 ${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} ml-1`} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="w-64 p-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Trust Score Breakdown</p>
            <div className="space-y-1.5">
              {items.map(item => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{item.label}</span>
                  <span className={`font-medium ${item.value > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                    {item.value}/{item.max}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-900">Total</span>
              <span className={`font-bold ${textColor}`}>{score}/100</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
