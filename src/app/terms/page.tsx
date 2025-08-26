import { Navigation } from '@/components/navigation'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="space-y-4">
          <p>
            These Terms of Service ("Terms") govern your access to and use of CarDeals. By accessing or using the service, you agree to be bound by these Terms.
          </p>

          <h2 className="text-xl font-semibold mt-6">1. Acceptance of Terms</h2>
          <p>
            By using CarDeals, you confirm that you are at least the age of majority in your jurisdiction and that you have the right, authority, and capacity to enter into these Terms.
          </p>

          <h2 className="text-xl font-semibold mt-6">2. Your Account</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You agree to provide accurate information and to keep it up to date.
          </p>

          <h2 className="text-xl font-semibold mt-6">3. User Content</h2>
          <p>
            You may submit vehicle price reports and related information ("Content"). You retain ownership of your Content. By submitting Content, you grant CarDeals a non-exclusive, worldwide, royalty-free license to host, store, display, and share the Content for the purpose of operating and improving the service.
          </p>

          <h2 className="text-xl font-semibold mt-6">4. Prohibited Conduct</h2>
          <p>
            You agree not to use the service to: (a) violate any law; (b) post false, misleading, or fraudulent information; (c) infringe the rights of others; (d) attempt to interfere with or compromise the system integrity or security.
          </p>

          <h2 className="text-xl font-semibold mt-6">5. Intellectual Property</h2>
          <p>
            CarDeals and its logos, trademarks, and service marks are the property of their respective owners. Except for the license granted to your Content, no rights are transferred to you.
          </p>

          <h2 className="text-xl font-semibold mt-6">6. Disclaimer of Warranties</h2>
          <p>
            The service is provided "as is" and "as available" without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
          </p>

          <h2 className="text-xl font-semibold mt-6">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, CarDeals shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, or goodwill.
          </p>

          <h2 className="text-xl font-semibold mt-6">8. Changes to the Service and Terms</h2>
          <p>
            We may modify or discontinue the service, and we may update these Terms from time to time. Continued use of the service constitutes acceptance of the updated Terms.
          </p>

          <h2 className="text-xl font-semibold mt-6">9. Termination</h2>
          <p>
            We may suspend or terminate your access if you violate these Terms or if required by law. You may stop using the service at any time.
          </p>

          <h2 className="text-xl font-semibold mt-6">10. Governing Law</h2>
          <p>
            These Terms are governed by the laws applicable in the jurisdiction where CarDeals is operated, without regard to conflict of laws principles.
          </p>

          <h2 className="text-xl font-semibold mt-6">11. Contact</h2>
          <p>
            For questions about these Terms, please contact us using the information provided on our website.
          </p>
        </section>
      </main>
    </div>
  )
}


