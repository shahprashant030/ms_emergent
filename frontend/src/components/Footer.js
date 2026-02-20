import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border mt-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-heading font-bold text-primary mb-4">Mithila Sutra</h3>
            <p className="text-foreground/70 leading-relaxed">
              Authentic Nepali products crafted with tradition and delivered with care.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Shop</h4>
            <div className="space-y-3">
              <Link to="/products?category=sweets" className="block text-foreground/70 hover:text-primary transition-colors">
                Traditional Sweets
              </Link>
              <Link to="/products?category=groceries" className="block text-foreground/70 hover:text-primary transition-colors">
                Groceries
              </Link>
              <Link to="/products?category=clothing" className="block text-foreground/70 hover:text-primary transition-colors">
                Clothing
              </Link>
              <Link to="/products?category=handicrafts" className="block text-foreground/70 hover:text-primary transition-colors">
                Handicrafts
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <div className="space-y-3">
              <Link to="/orders" className="block text-foreground/70 hover:text-primary transition-colors">
                Track Order
              </Link>
              <Link to="/profile" className="block text-foreground/70 hover:text-primary transition-colors">
                My Account
              </Link>
              <a href="#" className="block text-foreground/70 hover:text-primary transition-colors">
                Help Center
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <div className="space-y-3 text-foreground/70">
              <p>Janakpur, Nepal</p>
              <p>+977 123456789</p>
              <p>info@mithilasutra.com</p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/50 text-center text-foreground/60">
          <p>© 2026 Mithila Sutra. Handcrafted with love in Nepal.</p>
        </div>
      </div>
    </footer>
  );
};