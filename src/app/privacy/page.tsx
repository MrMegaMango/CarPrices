import { Navigation } from '@/components/navigation'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="space-y-4">
          <p>
            We respect your privacy. This page explains what data we collect and how we use it
            when you use CarDeals.
          </p>

          <h2 className="text-xl font-semibold mt-6">Information we collect</h2>
          <p>
            When you sign in, we receive basic profile details from your identity provider such as
            name, email, and profile image. When you submit a price report, we store the deal data
            you provide (vehicle, prices, dealer details, and optional notes).
          </p>

          <h2 className="text-xl font-semibold mt-6">How we use information</h2>
          <p>
            We use your information to operate CarDeals, display anonymized market data, and allow
            you to manage your own reports. We do not sell personal information.
          </p>

          <h2 className="text-xl font-semibold mt-6">Data visibility</h2>
          <p>
            Submitted reports are shown publicly without exposing private identifiers. We may show
            your first name or initials when clearly consented by you in the product.
          </p>

          <h2 className="text-xl font-semibold mt-6">Cookies</h2>
          <p>
            We may use cookies for sign in and basic analytics necessary to operate the service.
          </p>

          <h2 className="text-xl font-semibold mt-6">Your choices</h2>
          <p>
            You can delete your own reports from the My Deals page and sign out at any time. If you
            need help with data access or deletion, contact us using the information below.
          </p>

          <h2 className="text-xl font-semibold mt-6">Contact</h2>
          <p>
            For privacy questions, please contact support at the email listed on our website.
          </p>
        </section>
      </main>
    </div>
  )
}


