import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const currentYear = new Date().getFullYear();

export const Footer = () => {
  return (
    <footer className="bg-foreground text-white text-sm w-full relative">
      {/* Main Footer Content */}
      <div className="w-full px-6 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* About */}
          <div>
            <h4 className="font-heading font-bold mb-6 text-primary text-lg">About Mithila Sutra</h4>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Bringing the rich cultural heritage of Mithila to your doorstep. Authentic traditional products, handcrafted with love.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com/mithilasutra" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/mithilasutra" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/mithilasutra" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://youtube.com/mithilasutra" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold mb-6 text-primary text-lg">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/products" className="text-white/60 hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?featured=true" className="text-white/60 hover:text-white transition-colors">Best Sellers</Link></li>
              <li><Link to="/products?new=true" className="text-white/60 hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link to="/about" className="text-white/60 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-white/60 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-heading font-bold mb-6 text-primary text-lg">Customer Service</h4>
            <ul className="space-y-3">
              <li><Link to="/orders" className="text-white/60 hover:text-white transition-colors">My Orders</Link></li>
              <li><Link to="/faq" className="text-white/60 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/terms" className="text-white/60 hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-white/60 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/contact" className="text-white/60 hover:text-white transition-colors">Returns & Refunds</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading font-bold mb-6 text-primary text-lg">Contact Us</h4>
            <ul className="space-y-4 text-white/60">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Janakpur, Nepal<br />Mithila Region</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <span>+977 9800000000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span>info@mithilasutra.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white/40 text-xs">We Accept:</div>
          <div className="flex items-center gap-4">
            <div className="bg-white/10 rounded px-3 py-1.5 text-xs text-white/60">Cash on Delivery</div>
            <div className="bg-white/10 rounded px-3 py-1.5 text-xs text-white/60">eSewa</div>
            <div className="bg-white/10 rounded px-3 py-1.5 text-xs text-white/60">Khalti</div>
            <div className="bg-white/10 rounded px-3 py-1.5 text-xs text-white/60">IME Pay</div>
            <div className="bg-white/10 rounded px-3 py-1.5 text-xs text-white/60">Visa/Mastercard</div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white/10 py-6 text-center text-white/30 text-xs w-full">
        <div className="max-w-7xl mx-auto px-6">
          &copy; {currentYear} Mithila Sutra. All rights reserved. Handcrafted with love in Janakpur, Nepal.
        </div>
      </div>
    </footer>
  );
};
