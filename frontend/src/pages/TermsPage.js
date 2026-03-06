import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const TermsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Navbar />
      
      <div className="flex-grow py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-8">Terms & Conditions</h1>
          
          <div className="bg-white rounded-xl border shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">1. Introduction</h2>
              <p className="text-foreground/80">
                Welcome to Mithila Sutra. By accessing or using our website and services, you agree to be bound by these 
                Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">2. Definitions</h2>
              <ul className="list-disc list-inside text-foreground/80 space-y-2">
                <li>"Company," "we," "us," or "our" refers to Mithila Sutra</li>
                <li>"Website" refers to mithilasutra.com</li>
                <li>"User," "you," or "your" refers to anyone who accesses our website</li>
                <li>"Products" refers to all items available for purchase on our website</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">3. Account Registration</h2>
              <p className="text-foreground/80">
                To make purchases, you must create an account using a valid phone number or Google account. You are 
                responsible for maintaining the confidentiality of your account information and for all activities 
                under your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">4. Orders and Payments</h2>
              <ul className="list-disc list-inside text-foreground/80 space-y-2">
                <li>All orders are subject to product availability</li>
                <li>Prices are in Nepali Rupees (NPR) and include applicable taxes</li>
                <li>We reserve the right to cancel orders due to pricing errors or stock issues</li>
                <li>Payment must be made through our accepted payment methods</li>
                <li>Cash on Delivery is available for all locations in Nepal</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">5. Shipping and Delivery</h2>
              <ul className="list-disc list-inside text-foreground/80 space-y-2">
                <li>Delivery times are estimates and may vary</li>
                <li>Risk of loss transfers to you upon delivery</li>
                <li>You must provide accurate delivery information</li>
                <li>We are not responsible for delays caused by incorrect addresses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">6. Returns and Refunds</h2>
              <ul className="list-disc list-inside text-foreground/80 space-y-2">
                <li>Damaged or incorrect products may be returned within 48 hours</li>
                <li>Food items cannot be returned once opened unless defective</li>
                <li>Refunds are processed within 5-7 business days</li>
                <li>Original shipping charges are non-refundable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">7. Product Information</h2>
              <p className="text-foreground/80">
                We strive to provide accurate product descriptions and images. However, actual products may vary 
                slightly due to their handcrafted nature. Colors may appear different depending on your screen settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">8. Intellectual Property</h2>
              <p className="text-foreground/80">
                All content on this website, including logos, images, text, and graphics, is the property of 
                Mithila Sutra and is protected by copyright laws. You may not reproduce, distribute, or use our 
                content without written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">9. Limitation of Liability</h2>
              <p className="text-foreground/80">
                Mithila Sutra shall not be liable for any indirect, incidental, or consequential damages arising 
                from your use of our website or products. Our total liability shall not exceed the amount paid 
                for the specific product in question.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">10. Changes to Terms</h2>
              <p className="text-foreground/80">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon 
                posting. Continued use of our services constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">11. Contact Information</h2>
              <p className="text-foreground/80">
                For questions about these Terms and Conditions, please contact us at:<br />
                Email: legal@mithilasutra.com<br />
                Phone: +977 9800000000
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

export default TermsPage;
