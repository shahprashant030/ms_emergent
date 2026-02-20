import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Star, Search } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const categoryParam = searchParams.get('category');

  useEffect(() => {
    fetchProducts();
  }, [categoryParam, searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryParam) params.category = categoryParam;
      const searchParam = searchParams.get('search');
      if (searchParam) params.search = searchParam;
      const response = await axios.get(`${API}/products`, { params });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchProducts();
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API}/products`, { params: { search: searchQuery } });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to search products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'All', slug: null },
    { name: 'Sweets', slug: 'sweets' },
    { name: 'Groceries', slug: 'groceries' },
    { name: 'Clothing', slug: 'clothing' },
    { name: 'Handicrafts', slug: 'handicrafts' },
  ];

  return (
    <div className="min-h-screen flex flex-col" data-testid="products-page">
      <Navbar />

      <div className="flex-grow py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-semibold text-primary mb-6">
              {categoryParam ? `${categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)}` : 'All Products'}
            </h1>

            {/* Search Bar */}
            <div className="flex gap-3 max-w-2xl">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="rounded-lg"
                data-testid="search-input"
              />
              <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6" data-testid="search-button">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-12">
            {categories.map((cat) => (
              <Button
                key={cat.slug || 'all'}
                onClick={() => {
                  if (cat.slug) {
                    setSearchParams({ category: cat.slug });
                  } else {
                    setSearchParams({});
                  }
                }}
                variant={categoryParam === cat.slug || (!categoryParam && !cat.slug) ? 'default' : 'outline'}
                className={`rounded-full ${categoryParam === cat.slug || (!categoryParam && !cat.slug) ? 'bg-primary text-white' : 'border-primary text-primary hover:bg-primary/10'}`}
                data-testid={`category-filter-${cat.slug || 'all'}`}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="text-xl text-foreground/60">Loading products...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-xl text-foreground/60">No products found</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" data-testid="products-grid">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group relative bg-white rounded-xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
                  data-testid={`product-card-${product.id}`}
                >
                  {product.is_new && (
                    <div className="absolute top-3 right-3 bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium z-10" data-testid="new-badge">
                      New
                    </div>
                  )}
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.images[0] || 'https://via.placeholder.com/400'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-foreground/60 text-sm line-clamp-2">{product.short_description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="text-xl font-bold text-primary">NPR {product.discount_price || product.price}</span>
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
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductsPage;