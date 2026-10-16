import { AccountOverview } from '@/components/dashboard/account-overview'
import { MarketOverview } from '@/components/dashboard/market-overview'

export default function DashboardPage() {
  return (
    <div>
      <AccountOverview />
      <MarketOverview />
    </div>
  )
}
