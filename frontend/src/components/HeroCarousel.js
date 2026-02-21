import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCarousels = async () => {
      try {
        const response = await axios.get(`${API}/carousels`);
        if (response.data && response.data.length > 0) {
          setSlides(response.data);
        } else {
          // Default slide if no carousels in database
          setSlides([
            {
              id: 'default-1',
              image: 'https://customer-assets.emergentagent.com/job_nepal-heritage-shop/artifacts/knd24dxo_Thekuwa.png',
              tag: 'Authentic Taste of Mithila',
              title: 'Traditional Thekuwa',
              description: 'Handcrafted with love, delivered with tradition',
              button_text: 'Shop Now',
              button_link: '/products',
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch carousels:', error);
        // Default slide on error
        setSlides([
          {
            id: 'default-1',
            image: 'https://customer-assets.emergentagent.com/job_nepal-heritage-shop/artifacts/knd24dxo_Thekuwa.png',
            tag: 'Authentic Taste of Mithila',
            title: 'Traditional Thekuwa',
            description: 'Handcrafted with love, delivered with tradition',
            button_text: 'Shop Now',
            button_link: '/products',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCarousels();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-muted flex items-center justify-center">
        <div className="text-foreground/60">Loading...</div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden" data-testid="hero-carousel">
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Full-width Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black/30" />
            </div>

            {/* Text Content Overlay */}
            <div className="relative h-full flex items-center">
              <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
                <div className="max-w-xl space-y-6">
                  <p className="text-sm md:text-base uppercase tracking-widest text-white/90 font-medium drop-shadow-lg">
                    {slide.tag}
                  </p>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white tracking-tight leading-tight drop-shadow-xl">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 max-w-lg drop-shadow-lg">
                    {slide.description}
                  </p>
                  <Button
                    onClick={() => window.location.href = slide.button_link || '/products'}
                    className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                    data-testid="shop-now-button"
                  >
                    {slide.button_text || 'Shop Now'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Only show if more than 1 slide */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-20"
            aria-label="Previous slide"
            data-testid="prev-slide"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-20"
            aria-label="Next slide"
            data-testid="next-slide"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </>
      )}

      {/* Dots Indicator - Only show if more than 1 slide */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              data-testid={`carousel-dot-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
