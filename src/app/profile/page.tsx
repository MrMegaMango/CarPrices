'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-semibold mb-4">Profile</h1>
          <p className="text-gray-600 mb-6">Sign in to view your profile.</p>
          <Button onClick={() => signIn()}>Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-semibold mb-6">Your Profile</h1>
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <div className="text-sm text-gray-500">Name</div>
            <div className="font-medium">{session.user?.name || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Email</div>
            <div className="font-medium">{session.user?.email}</div>
          </div>
          <div className="pt-4">
            <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
          </div>
        </div>
      </div>
    </div>
  )
}


