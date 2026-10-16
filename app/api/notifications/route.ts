import { NextResponse } from 'next/server'

export interface AppNotification {
  id: string
  title: string
  body: string
  category: 'transactions' | 'security' | 'promotions' | 'system'
  createdAt: string
}

function seed(): AppNotification[] {
  const now = Date.now()
  const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString()

  return [
    {
      id: 'ntf-1001',
      title: 'Conversion completed',
      body: 'You converted 250 USDC to 396,850 NGN.',
      category: 'transactions',
      createdAt: minutesAgo(12),
    },
    {
      id: 'ntf-1002',
      title: 'New sign-in detected',
      body: 'A new sign-in to your account was detected from Lagos, NG.',
      category: 'security',
      createdAt: minutesAgo(90),
    },
    {
      id: 'ntf-1003',
      title: 'Deposit received',
      body: 'Your deposit of 1,200 XLM has been credited.',
      category: 'transactions',
      createdAt: minutesAgo(240),
    },
    {
      id: 'ntf-1004',
      title: 'Zero-fee week',
      body: 'Enjoy zero conversion fees on all NGN pairs until Friday.',
      category: 'promotions',
      createdAt: minutesAgo(1_500),
    },
    {
      id: 'ntf-1005',
      title: 'Scheduled maintenance',
      body: 'We will be performing maintenance on Sunday 02:00–04:00 UTC.',
      category: 'system',
      createdAt: minutesAgo(2_880),
    },
  ]
}

export async function GET() {
  return NextResponse.json({ notifications: seed() })
}
