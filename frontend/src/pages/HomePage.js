import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import HeroCarousel from '@/components/HeroCarousel';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories] = useState([
    { name: 'Traditional Food', slug: 'food', image: 'https://customer-assets.emergentagent.com/job_nepal-heritage-shop/artifacts/knd24dxo_Thekuwa.png' },
    { name: 'Premium Groceries', slug: 'groceries', image: 'https://images.unsplash.com/photo-1642935264368-963f3d53681f?crop=entropy&cs=srgb&fm=jpg&q=85' },
    { name: 'Authentic Pickles', slug: 'achar', image: 'https://customer-assets.emergentagent.com/job_nepal-heritage-shop/artifacts/o8gz2tcv_Mango_Pickle.png' },
    { name: 'Traditional Mithai', slug: 'mithai', image: 'https://images.pexels.com/photos/36024428/pexels-photo-36024428.jpeg' },
    { name: 'Woolen Clothes', slug: 'clothes', image: 'https://images.unsplash.com/photo-1595972424993-0cf6b1273a68?crop=entropy&cs=srgb&fm=jpg&q=85' },
    { name: 'Mithila Art', slug: 'art', image: 'https://images.pexels.com/photos/22820070/pexels-photo-22820070.jpeg' },
  ]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${API}/products?featured=true`);
      setFeaturedProducts(response.data.slice(0, 6));
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" data-testid="home-page">
      <Navbar />

      {/* Hero Carousel */}
      <HeroCarousel />
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/34961656/pexels-photo-34961656.jpeg"
            alt="Mithila Art Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-6 md:px-12 flex items-center">
          <div className="max-w-3xl space-y-8">
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-primary tracking-tight leading-tight">
              Heritage in Every Bite
            </h1>
            <p className="text-lg md:text-xl text-foreground leading-relaxed max-w-2xl">
              Discover authentic Nepali sweets, groceries, and handicrafts from the heart of Mithila, crafted with tradition and delivered with care.
            </p>
            <Link to="/products">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1" data-testid="explore-products-button">
                Explore Products <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 md:py-32 bg-muted" data-testid="categories-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-semibold text-primary mb-4">Shop by Category</h2>
            <p className="text-lg text-foreground/70">Explore our curated collection of traditional products</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/products?category=${category.slug}`}
                className="group relative bg-white rounded-xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
                data-testid={`category-${category.slug}`}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-heading font-medium text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-20 md:py-32" data-testid="featured-products-section">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-heading font-semibold text-primary mb-4">Featured Products</h2>
              <p className="text-lg text-foreground/70">Handpicked favorites from our collection</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group relative bg-white rounded-xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
                  data-testid={`product-${product.id}`}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.images[0] || 'https://via.placeholder.com/400'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-foreground/60 text-sm line-clamp-2">{product.short_description}</p>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-2xl font-bold text-primary">NPR {product.discount_price || product.price}</span>
                        {product.discount_price && (
                          <span className="text-sm text-foreground/40 line-through ml-2">NPR {product.price}</span>
                        )}
                      </div>
                      {product.rating > 0 && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-secondary text-secondary" />
                          <span className="text-sm font-medium">{product.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/products">
                <Button className="bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-full px-8 py-6 text-lg font-medium transition-all duration-300" data-testid="view-all-button">
                  View All Products
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Values Section */}
      <section className="py-20 md:py-32 bg-muted">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="text-5xl font-heading text-primary">100%</div>
              <h3 className="text-xl font-semibold">Authentic</h3>
              <p className="text-foreground/70 leading-relaxed">Traditional recipes passed down through generations</p>
            </div>
            <div className="text-center space-y-4">
              <div className="text-5xl font-heading text-primary">Pure</div>
              <h3 className="text-xl font-semibold">Natural</h3>
              <p className="text-foreground/70 leading-relaxed">No preservatives, only pure ingredients from Nepal</p>
            </div>
            <div className="text-center space-y-4">
              <div className="text-5xl font-heading text-primary">Fast</div>
              <h3 className="text-xl font-semibold">Delivery</h3>
              <p className="text-foreground/70 leading-relaxed">Fresh products delivered right to your doorstep</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;