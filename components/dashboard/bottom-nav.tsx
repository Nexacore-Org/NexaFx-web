'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navItems, isActivePath } from '@/lib/navigation'
import { NavIcon } from '@/components/dashboard/nav-icons'

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-gray-200 bg-white md:hidden"
    >
      {navItems.map((item) => {
        const active = isActivePath(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium ${
              active ? 'text-blue-700' : 'text-gray-500'
            }`}
          >
            <NavIcon name={item.key} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
