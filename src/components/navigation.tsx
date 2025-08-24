'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Car, Plus, User, LogOut, BarChart3 } from 'lucide-react'

export function Navigation() {
  const { data: session, status } = useSession()

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
          <Car className="h-6 w-6 text-blue-600" />
          <span>CarDeals</span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link
            href="/deals"
            className="text-sm font-medium transition-colors hover:text-blue-600"
          >
            Browse Deals
          </Link>
          <Link
            href="/statistics"
            className="text-sm font-medium transition-colors hover:text-blue-600 flex items-center space-x-1"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Statistics</span>
          </Link>

          {status === 'loading' ? (
            <div className="h-9 w-20 bg-gray-200 animate-pulse rounded" />
          ) : session ? (
            <div className="flex items-center space-x-3">
              <Button asChild variant="default" size="sm">
                <Link href="/deals/new" className="flex items-center space-x-1">
                  <Plus className="h-4 w-4" />
                  <span>Add Deal</span>
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {session.user?.name || session.user?.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-deals">My Deals</Link>
                  </DropdownMenuItem>
                  {session.user?.email === 'amangocoding@gmail.com' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/backup">Admin Backup</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => signIn()}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => signIn()}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
