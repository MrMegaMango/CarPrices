'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Share2, Copy, Check, Facebook, MessageCircle } from 'lucide-react'
import { CarDealWithRelations } from '@/types'
import { toast } from 'sonner'

interface ShareDealProps {
  deal: CarDealWithRelations
}

export function ShareDeal({ deal }: ShareDealProps) {
  const [copied, setCopied] = useState(false)

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceInCents / 100)
  }

  const savings = deal.msrp - deal.sellingPrice
  const savingsPercentage = ((savings / deal.msrp) * 100).toFixed(1)

  // Create a shareable URL pointing to the deal detail page
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/deals/${deal.id}`
  
  // Create share text
  const shareText = `🚗 Amazing deal on ${deal.year} ${deal.make.name} ${deal.model.name}!
💰 MSRP: ${formatPrice(deal.msrp)}
🎯 Selling Price: ${formatPrice(deal.sellingPrice)}
💚 Save ${formatPrice(savings)} (${savingsPercentage}% off!)${deal.dealerLocation ? `
📍 Location: ${deal.dealerLocation}` : ''}

Check it out: ${shareUrl}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}`)
      setCopied(true)
      toast.success('Deal info copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
    toast.success('Opening Facebook share dialog...')
  }

  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
    window.open(whatsappUrl, '_blank')
    toast.success('Opening WhatsApp share...')
  }

  const shareViaNative = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: `${deal.year} ${deal.make.name} ${deal.model.name} Deal`,
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        console.error('Native share failed:', error)
        copyToClipboard()
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-1">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-neutral-900">
        <DropdownMenuItem onClick={copyToClipboard}>
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copied ? 'Copied!' : 'Copy deal info'}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareOnWhatsApp}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Share on WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareOnFacebook}>
          <Facebook className="h-4 w-4 mr-2" />
          Share on Facebook
        </DropdownMenuItem>
        
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <DropdownMenuItem onClick={shareViaNative}>
            <Share2 className="h-4 w-4 mr-2" />
            More options...
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
