import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQPage = () => {
  const faqs = [
    {
      category: "Orders & Shipping",
      questions: [
        {
          q: "How long does delivery take?",
          a: "Delivery typically takes 2-5 business days within Kathmandu Valley and 5-10 business days for other locations in Nepal. For remote areas, delivery may take up to 15 days."
        },
        {
          q: "Do you deliver outside Nepal?",
          a: "Currently, we only deliver within Nepal. We are working on expanding our services internationally. Please subscribe to our newsletter for updates."
        },
        {
          q: "What are the shipping charges?",
          a: "We offer FREE shipping on all orders above NPR 2,000. For orders below NPR 2,000, a flat shipping charge of NPR 100 applies for Kathmandu Valley and NPR 150 for other locations."
        },
        {
          q: "How can I track my order?",
          a: "Once your order is shipped, you will receive an SMS notification with tracking details. You can also check your order status by logging into your account and visiting the 'My Orders' section."
        },
        {
          q: "Can I cancel my order?",
          a: "Yes, you can cancel your order within 24 hours of placing it. Please contact our customer support immediately. Once the order is shipped, cancellation is not possible."
        }
      ]
    },
    {
      category: "Products",
      questions: [
        {
          q: "Are your products authentic?",
          a: "Yes! All our products are sourced directly from traditional artisans and families in the Mithila region. We guarantee 100% authenticity and quality."
        },
        {
          q: "What is the shelf life of food products?",
          a: "Our traditional sweets like Thekuwa and Anarsa have a shelf life of 15-30 days when stored properly. Pickles and achar can last 6-12 months. Each product comes with specific storage instructions."
        },
        {
          q: "Are the food products vegetarian?",
          a: "Yes, all our food products are 100% vegetarian. Some items may contain dairy products like ghee and milk. Please check individual product descriptions for allergen information."
        },
        {
          q: "Do you offer customization?",
          a: "Yes, we offer customization for bulk orders and special occasions. Please contact us at least 7 days in advance for custom orders."
        }
      ]
    },
    {
      category: "Payment",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept Cash on Delivery (COD), eSewa, Khalti, IME Pay, and Credit/Debit cards. More payment options are coming soon."
        },
        {
          q: "Is Cash on Delivery available?",
          a: "Yes, Cash on Delivery is available for all locations within Nepal. You can pay in cash when you receive your order."
        },
        {
          q: "Is online payment secure?",
          a: "Absolutely! All online payments are processed through secure, encrypted payment gateways. Your financial information is never stored on our servers."
        },
        {
          q: "Can I get a refund?",
          a: "Yes, we offer refunds for damaged or incorrect products. Please contact us within 48 hours of receiving your order with photos of the issue. Refunds are processed within 5-7 business days."
        }
      ]
    },
    {
      category: "Account & Support",
      questions: [
        {
          q: "How do I create an account?",
          a: "You can create an account using your phone number (OTP verification) or by signing in with Google. It only takes a few seconds!"
        },
        {
          q: "How do I reset my password?",
          a: "We use OTP-based authentication, so there's no password to reset. Simply request a new OTP when logging in."
        },
        {
          q: "How can I contact customer support?",
          a: "You can reach us via phone at +977 9800000000, email at support@mithilasutra.com, or through our Contact page. Our support team is available Sunday-Friday, 9 AM - 6 PM."
        },
        {
          q: "Do you have a physical store?",
          a: "Currently, we operate as an online-only store. We plan to open physical stores in major cities soon. Stay tuned for updates!"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Navbar />
      
      <div className="flex-grow py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-foreground/70">
              Find answers to common questions about our products, orders, and services.
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((category, idx) => (
              <div key={idx} className="bg-white rounded-xl border shadow-sm p-6">
                <h2 className="text-xl font-heading font-semibold text-primary mb-4">{category.category}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, faqIdx) => (
                    <AccordionItem key={faqIdx} value={`${idx}-${faqIdx}`}>
                      <AccordionTrigger className="text-left font-medium">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-foreground/70">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-primary/5 rounded-xl p-8 text-center">
            <h3 className="text-xl font-heading font-semibold text-primary mb-2">Still have questions?</h3>
            <p className="text-foreground/70 mb-4">Can't find what you're looking for? Please contact our support team.</p>
            <a href="/contact" className="inline-block bg-primary text-white rounded-full px-8 py-3 font-medium hover:bg-primary/90 transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQPage;
