'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function EditDealPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    msrp: '',
    sellingPrice: '',
    otdPrice: '',
    rebates: '',
    dealerName: '',
    dealerLocation: '',
    dealDate: '',
    notes: '',
  })

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const res = await fetch(`/api/deals/${params.id}`)
        if (!res.ok) throw new Error('Failed to load deal')
        const deal = await res.json()
        setForm({
          msrp: String(Math.round((deal.msrp ?? 0) / 100)),
          sellingPrice: String(Math.round((deal.sellingPrice ?? 0) / 100)),
          otdPrice: deal.otdPrice != null ? String(Math.round(deal.otdPrice / 100)) : '',
          rebates: deal.rebates != null ? String(Math.round(deal.rebates / 100)) : '',
          dealerName: deal.dealerName ?? '',
          dealerLocation: deal.dealerLocation ?? '',
          dealDate: deal.dealDate ? new Date(deal.dealDate).toISOString().split('T')[0] : '',
          notes: deal.notes ?? '',
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error loading deal')
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchDeal()
  }, [params.id])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/api/auth/signin')
    return null
  }

  const onSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/deals/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msrp: form.msrp ? Number(form.msrp) : undefined,
          sellingPrice: form.sellingPrice ? Number(form.sellingPrice) : undefined,
          otdPrice: form.otdPrice ? Number(form.otdPrice) : null,
          rebates: form.rebates ? Number(form.rebates) : null,
          dealerName: form.dealerName || null,
          dealerLocation: form.dealerLocation || null,
          dealDate: form.dealDate || undefined,
          notes: form.notes || null,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to save changes')
      }
      router.push('/my-deals')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-semibold mb-6">Edit Deal</h1>
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Core Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">MSRP (USD)</label>
              <Input value={form.msrp} onChange={(e) => setForm({ ...form, msrp: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Selling Price (USD)</label>
              <Input value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">OTD Price (USD)</label>
              <Input value={form.otdPrice} onChange={(e) => setForm({ ...form, otdPrice: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Rebates (USD)</label>
              <Input value={form.rebates} onChange={(e) => setForm({ ...form, rebates: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Dealer Name</label>
              <Input value={form.dealerName} onChange={(e) => setForm({ ...form, dealerName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Dealer Location</label>
              <Input value={form.dealerLocation} onChange={(e) => setForm({ ...form, dealerLocation: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Deal Date</label>
              <Input type="date" value={form.dealDate} onChange={(e) => setForm({ ...form, dealDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Notes</label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="pt-2 flex gap-2">
              <Button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


