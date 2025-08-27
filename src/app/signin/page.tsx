'use client'

import { useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, LogIn } from 'lucide-react'

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const callbackUrl = useMemo(() => {
    const url = searchParams.get('callbackUrl')
    return url && url.startsWith('/') ? url : '/'
  }, [searchParams])

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Use your account to sign in. We only use your account to let you manage your own submissions.
          </p>
          <Button onClick={() => signIn('google', { callbackUrl })} className="w-full">
            <LogIn className="h-4 w-4 mr-2" />
            Continue with Google
          </Button>
          <div className="text-xs text-gray-500">
            You can always go back and continue as a guest.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<div className="max-w-md mx-auto">Loading...</div>}>
          <SignInContent />
        </Suspense>
      </div>
    </div>
  )
}


