'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'

export function TipButton() {
  const [pending, setPending] = useState(false)

  async function handleTip() {
    setPending(true)
    try {
      const res = await fetch('/api/stripe/tip', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Tip API error:', data.error)
        alert(data.error ?? 'Something went wrong.')
      }
    } catch (err) {
      console.error('Tip fetch error:', err)
      alert('Could not reach the server.')
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      onClick={handleTip}
      disabled={pending}
      className="hover:text-white text-gray-400 text-sm flex items-center space-x-1 transition-colors disabled:opacity-50"
    >
      <Heart className="h-4 w-4" />
      <span>{pending ? 'Opening…' : 'Tip jar'}</span>
    </button>
  )
}
