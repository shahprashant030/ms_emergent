import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

const footerData = {
  leftSection: {
    'Get to Know Us': [
      { label: 'About Us', url: '/about' },
      { label: 'WEE (Women Empowerment & Employment)', url: '/wee' },
      { label: 'Sustainability', url: '/sustainability' },
      { label: 'Visit our Store', url: '/store-locator' },
      { label: 'Contact Us', url: '/contact' },
    ],
    'Trending': [
      { label: 'Best Sellers', url: '/products?featured=true' },
      { label: 'New Arrivals', url: '/products?new=true' },
      { label: 'Top Deals', url: '/products' },
    ],
    "Customers' Section": [
      { label: 'Your Orders', url: '/orders' },
      { label: 'Returns & Complaints', url: '/returns' },
      { label: 'Discount Coupons', url: '/coupons' },
      { label: 'Payment Methods', url: '/payments' },
      { label: 'Mithilasutra Points', url: '/points' },
      { label: 'Balance Top-up', url: '/topup' },
    ],
  },
  rightSection: {
    'Our Address': [
      { type: 'text', value: 'Mithila Sutra Private Limited' },
      { type: 'text', value: 'Haripurwa - 04, Haripurwa' },
      { type: 'text', value: 'Sarlahi, Madhesh Province' },
      { type: 'text', value: 'Nepal 45800' },
    ],
    'Connect With Us': [
      { type: 'social', icon: FaFacebook, url: 'https://facebook.com/mithilasutra', label: 'Facebook' },
      { type: 'social', icon: FaInstagram, url: 'https://instagram.com/mithilasutra', label: 'Instagram' },
      { type: 'social', icon: FaTwitter, url: 'https://twitter.com/mithilasutra', label: 'Twitter' },
      { type: 'social', icon: FaYoutube, url: 'https://youtube.com/mithilasutra', label: 'YouTube' },
    ],
  },
};

const currentYear = new Date().getFullYear();

export const Footer = () => {
  return (
    <footer className="bg-foreground text-white text-sm w-full relative">
      {/* Middle Section: Links + Address */}
      <div className="w-full px-6 py-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
          {/* Left Column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 flex-1">
            {Object.entries(footerData.leftSection).map(([sectionTitle, links]) => (
              <div key={sectionTitle}>
                <h4 className="font-heading font-bold mb-6 text-primary text-lg">
                  {sectionTitle}
                </h4>
                <ul className="space-y-3">
                  {links.map(({ label, url }) => (
                    <li key={url}>
                      <Link
                        to={url}
                        className="text-white/60 hover:text-white transition-colors duration-200 block text-xs tracking-wide uppercase font-body font-medium hover:underline"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="md:w-1/3 lg:w-1/4 space-y-8">
            {Object.entries(footerData.rightSection).map(([sectionTitle, items]) => (
              <div key={sectionTitle}>
                <h4 className="font-heading font-bold mb-6 text-primary text-lg">
                  {sectionTitle}
                </h4>

                {/* Address Text */}
                {sectionTitle === 'Our Address' && (
                  <address className="text-white/60 not-italic space-y-2 text-sm leading-relaxed font-body">
                    {items.map((item, idx) => {
                      if ('value' in item) {
                        return <p key={idx}>{item.value}</p>;
                      }
                      return null;
                    })}
                  </address>
                )}

                {/* Social Icons */}
                {sectionTitle === 'Connect With Us' && (
                  <div className="flex space-x-6">
                    {items.map((item) => {
                      if ('icon' in item) {
                        const Icon = item.icon;
                        return (
                          <a
                            key={item.label}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/50 hover:text-primary text-2xl transition-all duration-300 hover:scale-110 transform"
                            aria-label={item.label}
                            title={item.label}
                          >
                            <Icon />
                          </a>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white/10 py-8 text-center text-white/30 text-[10px] uppercase tracking-[0.2em] w-full">
        <div className="max-w-7xl mx-auto px-4">
          &copy; {currentYear} Mithilasutra. All rights reserved. Handcrafted in Janakpur.
        </div>
      </div>
    </footer>
  );
};