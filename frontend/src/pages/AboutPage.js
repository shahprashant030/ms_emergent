import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Heart, Award, Truck, Users } from 'lucide-react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_nepal-heritage-shop/artifacts/y8zofolg_Mithila%20Sutra%20Final.png';

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Navbar />
      
      <div className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
            <img src={LOGO_URL} alt="Mithila Sutra" className="h-24 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">About Mithila Sutra</h1>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
              Bringing the rich cultural heritage of Mithila to your doorstep. We are dedicated to preserving and promoting 
              traditional Nepali products with authenticity and love.
            </p>
          </div>
        </div>

        {/* Our Story */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-heading font-bold text-primary mb-6">Our Story</h2>
                <div className="space-y-4 text-foreground/80">
                  <p>
                    Mithila Sutra was born from a deep love for the rich cultural heritage of the Mithila region. 
                    Our journey began with a simple mission: to bring authentic, traditional Nepali products to 
                    families everywhere.
                  </p>
                  <p>
                    The Mithila region, known for its unique art, cuisine, and traditions, has been a treasure trove 
                    of authentic Nepali culture for centuries. From the famous Mithila paintings to the delicious 
                    traditional sweets like Thekuwa and Anarsa, this region has so much to offer.
                  </p>
                  <p>
                    We work directly with local artisans and families who have been practicing these traditional 
                    crafts for generations. Every product you purchase supports these communities and helps preserve 
                    our cultural heritage for future generations.
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8">
                <img 
                  src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600" 
                  alt="Traditional Nepali Culture" 
                  className="rounded-xl w-full h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="py-16 bg-muted">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <h2 className="text-3xl font-heading font-bold text-primary text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border shadow-sm text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Authenticity</h3>
                <p className="text-foreground/70 text-sm">Every product is sourced directly from traditional artisans and families.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border shadow-sm text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Quality</h3>
                <p className="text-foreground/70 text-sm">We ensure the highest quality standards for all our products.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border shadow-sm text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Community</h3>
                <p className="text-foreground/70 text-sm">Supporting local communities and preserving traditional crafts.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border shadow-sm text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Reliability</h3>
                <p className="text-foreground/70 text-sm">Fast and reliable delivery across Nepal and beyond.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="py-16 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
            <h2 className="text-3xl font-heading font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-white/90">
              "To preserve and promote the rich cultural heritage of Mithila by connecting traditional artisans 
              with modern consumers, ensuring authentic Nepali products reach every home while supporting 
              local communities."
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
