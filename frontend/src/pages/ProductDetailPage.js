import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setAdding(true);
    const success = await addToCart(product.id, quantity);
    if (success) {
      toast.success('Added to cart!');
    } else {
      toast.error('Failed to add to cart');
    }
    setAdding(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-xl text-foreground/60">Loading...</div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen flex flex-col" data-testid="product-detail-page">
      <Navbar />

      <div className="flex-grow py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden border border-border/50 mithila-border">
                <img
                  src={product.images[selectedImage] || 'https://via.placeholder.com/600'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  data-testid="main-product-image"
                />
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? 'border-primary' : 'border-border/50 hover:border-primary/50'
                      }`}
                      data-testid={`thumbnail-${index}`}
                    >
                      <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {product.is_new && (
                <span className="inline-block bg-secondary text-white px-4 py-2 rounded-full text-sm font-medium" data-testid="new-badge">
                  New Arrival
                </span>
              )}

              <h1 className="text-4xl md:text-5xl font-heading font-semibold text-primary" data-testid="product-title">{product.name}</h1>

              {product.rating > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'fill-secondary text-secondary' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-foreground/70">
                    {product.rating} ({product.reviews_count} reviews)
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-baseline space-x-3">
                  <span className="text-4xl font-bold text-primary" data-testid="product-price">NPR {product.discount_price || product.price}</span>
                  {product.discount_price && (
                    <span className="text-2xl text-foreground/40 line-through" data-testid="original-price">NPR {product.price}</span>
                  )}
                </div>
                {product.discount_price && (
                  <div className="text-accent font-medium" data-testid="discount-badge">
                    Save NPR {product.price - product.discount_price} ({Math.round(((product.price - product.discount_price) / product.price) * 100)}% off)
                  </div>
                )}
              </div>

              <p className="text-lg text-foreground/80 leading-relaxed" data-testid="product-description">{product.description}</p>

              {product.stock > 0 ? (
                <div className="flex items-center space-x-2 text-accent">
                  <Check className="h-5 w-5" />
                  <span className="font-medium" data-testid="in-stock">In Stock ({product.stock} available)</span>
                </div>
              ) : (
                <div className="text-destructive font-medium" data-testid="out-of-stock">Out of Stock</div>
              )}

              <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-4">
                  <label className="font-medium">Quantity:</label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="rounded-lg"
                      data-testid="decrease-quantity"
                    >
                      -
                    </Button>
                    <span className="text-xl font-medium w-12 text-center" data-testid="quantity-display">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="rounded-lg"
                      data-testid="increase-quantity"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || adding}
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                  data-testid="add-to-cart-button"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {adding ? 'Adding...' : 'Add to Cart'}
                </Button>
              </div>

              {/* Additional Info */}
              <div className="pt-6 border-t border-border space-y-3">
                {product.sku && (
                  <div className="flex items-center space-x-3">
                    <span className="text-foreground/60">SKU:</span>
                    <span className="font-medium">{product.sku}</span>
                  </div>
                )}
                {product.categories.length > 0 && (
                  <div className="flex items-center space-x-3">
                    <span className="text-foreground/60">Categories:</span>
                    <div className="flex flex-wrap gap-2">
                      {product.categories.map((cat) => (
                        <span key={cat} className="px-3 py-1 bg-muted rounded-full text-sm">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {product.weight && (
                  <div className="flex items-center space-x-3">
                    <span className="text-foreground/60">Weight:</span>
                    <span className="font-medium">{product.weight} kg</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;