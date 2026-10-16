'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navItems, isActivePath } from '@/lib/navigation'
import { NavIcon } from '@/components/dashboard/nav-icons'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      aria-label="Primary"
      className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-white px-3 py-6 md:flex"
    >
      <div className="px-3 pb-6 text-lg font-semibold text-gray-900">NexaFx</div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = isActivePath(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <NavIcon name={item.key} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
