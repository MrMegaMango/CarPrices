import { Navigation } from '@/components/navigation'
import Link from 'next/link'

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-sm text-gray-500 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="space-y-6">
          <p className="text-gray-700">
            To be implemented once I get more questions.
          </p>
        </section>
      </main>
    </div>
  )
}


