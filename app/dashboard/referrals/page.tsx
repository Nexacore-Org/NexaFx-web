"use client"

import { useEffect, useState } from "react"
import { Copy, Share2, Gift } from "lucide-react"
import { getReferralStats, getReferralHistory, type ReferralStats, type ReferralHistoryItem } from "@/lib/api/referrals"

export default function ReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [history, setHistory] = useState<ReferralHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<'link' | 'code' | null>(null)

  useEffect(() => {
    Promise.all([getReferralStats(), getReferralHistory()])
      .then(([s, h]) => {
        setStats(s)
        setHistory(h)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load referral data'))
      .finally(() => setLoading(false))
  }, [])

  const copyToClipboard = async (text: string, type: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch { /* ignore */ }
  }

  const whatsappShare = () => {
    if (!stats) return
    window.open(`https://wa.me/?text=${encodeURIComponent(`Join me on NexaFx! Use my referral link: ${stats.referralLink}`)}`, '_blank')
  }

  const twitterShare = () => {
    if (!stats) return
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me on NexaFx! Use my referral link: ${stats.referralLink}`)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-destructive text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="text-sm underline text-muted-foreground hover:text-foreground">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Gift className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Refer & Earn</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total Referred</p>
          <p className="text-2xl font-bold mt-1">{stats?.totalReferred ?? 0}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Pending Rewards</p>
          <p className="text-2xl font-bold mt-1">{stats?.pendingRewards ?? 0} {stats?.currency}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Claimed Rewards</p>
          <p className="text-2xl font-bold mt-1">{stats?.claimedRewards ?? 0} {stats?.currency}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h3 className="font-semibold">Your Referral Link</h3>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-md bg-muted px-3 py-2 text-sm">{stats?.referralLink}</code>
          <button
            onClick={() => copyToClipboard(stats?.referralLink ?? '', 'link')}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Copy className="h-4 w-4" />
            {copied === 'link' ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <h3 className="font-semibold">Referral Code</h3>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-md bg-muted px-3 py-2 text-sm">{stats?.referralCode}</code>
          <button
            onClick={() => copyToClipboard(stats?.referralCode ?? '', 'code')}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Copy className="h-4 w-4" />
            {copied === 'code' ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <span className="text-sm text-muted-foreground">Share via</span>
          <button onClick={whatsappShare} className="flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">
            <Share2 className="h-4 w-4" /> WhatsApp
          </button>
          <button onClick={twitterShare} className="flex items-center gap-1.5 rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-black/80 dark:bg-white dark:text-black">
            <Share2 className="h-4 w-4" /> Twitter/X
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold mb-4">Referral History</h3>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No referrals yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Reward</th>
                  <th className="pb-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3">{item.email}</td>
                    <td className="py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3">{item.reward}</td>
                    <td className="py-3 text-muted-foreground">{new Date(item.joinedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
