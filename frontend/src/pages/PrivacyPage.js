import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Navbar />
      
      <div className="flex-grow py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-8">Privacy Policy</h1>
          
          <div className="bg-white rounded-xl border shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">1. Introduction</h2>
              <p className="text-foreground/80">
                At Mithila Sutra, we are committed to protecting your privacy. This Privacy Policy explains how we 
                collect, use, disclose, and safeguard your information when you visit our website or make a purchase.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">2. Information We Collect</h2>
              <div className="text-foreground/80 space-y-3">
                <p><strong>Personal Information:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Name and contact details (phone number, email address)</li>
                  <li>Shipping and billing addresses</li>
                  <li>Payment information (processed securely by payment providers)</li>
                  <li>Google account information (if using Google sign-in)</li>
                </ul>
                <p className="mt-3"><strong>Automatically Collected Information:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>IP address and device information</li>
                  <li>Browser type and operating system</li>
                  <li>Pages visited and time spent on our website</li>
                  <li>Referring website addresses</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-foreground/80 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations and shipping updates via SMS and email</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Improve our website and services</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Prevent fraud and enhance security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">4. Information Sharing</h2>
              <p className="text-foreground/80 mb-3">We may share your information with:</p>
              <ul className="list-disc list-inside text-foreground/80 space-y-2">
                <li><strong>Service Providers:</strong> Delivery partners, payment processors, and SMS providers</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, sale, or acquisition</li>
              </ul>
              <p className="text-foreground/80 mt-3">
                We do NOT sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">5. Data Security</h2>
              <p className="text-foreground/80">
                We implement appropriate security measures to protect your personal information, including:
              </p>
              <ul className="list-disc list-inside text-foreground/80 space-y-2 mt-2">
                <li>SSL encryption for all data transmissions</li>
                <li>Secure payment processing through trusted providers</li>
                <li>Regular security assessments and updates</li>
                <li>Limited access to personal data on a need-to-know basis</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">6. Cookies</h2>
              <p className="text-foreground/80">
                We use cookies to enhance your browsing experience, remember your preferences, and analyze website 
                traffic. You can control cookies through your browser settings, though some features may not work 
                properly if cookies are disabled.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">7. Your Rights</h2>
              <p className="text-foreground/80 mb-3">You have the right to:</p>
              <ul className="list-disc list-inside text-foreground/80 space-y-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal data</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">8. Third-Party Links</h2>
              <p className="text-foreground/80">
                Our website may contain links to third-party websites. We are not responsible for the privacy 
                practices of these external sites. We encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">9. Children's Privacy</h2>
              <p className="text-foreground/80">
                Our services are not intended for individuals under 18 years of age. We do not knowingly collect 
                personal information from children. If you believe we have collected such information, please 
                contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">10. Updates to This Policy</h2>
              <p className="text-foreground/80">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an 
                updated revision date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">11. Contact Us</h2>
              <p className="text-foreground/80">
                If you have questions or concerns about this Privacy Policy, please contact us at:<br />
                Email: privacy@mithilasutra.com<br />
                Phone: +977 9800000000<br />
                Address: Janakpur, Nepal
              </p>
            </section>

            <div className="text-sm text-foreground/50 pt-4 border-t">
              Last updated: March 2026
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
