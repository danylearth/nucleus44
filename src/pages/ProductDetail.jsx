import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ChevronLeft, 
  ChevronRight,
  Heart,
  Share2,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function ProductDetailPage() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const productId = urlParams.get('id');
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [user, setUser] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [includeAddon, setIncludeAddon] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const productData = await base44.entities.Product.get(productId);
      setProduct(productData);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      
      const finalPrice = includeAddon ? product.price + 10 : product.price;
      
      const cartItems = await base44.entities.CartItem.filter({ 
        user_email: user.email,
        product_id: product.id 
      });
      
      if (cartItems.length > 0) {
        await base44.entities.CartItem.update(cartItems[0].id, {
          quantity: cartItems[0].quantity + 1,
          product_price: finalPrice
        });
      } else {
        await base44.entities.CartItem.create({
          product_id: product.id,
          product_name: product.name,
          product_price: finalPrice,
          product_image: product.image_url,
          quantity: 1,
          user_email: user.email
        });
      }
      
      window.location.href = createPageUrl('Cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const productImages = [
    product?.image_url || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=600&h=600&fit=crop"
  ];

  const whatItTells = [
    { title: "Hormone Balance", description: "Understanding your hormone levels" },
    { title: "Health Insights", description: "Key biomarkers analyzed" },
    { title: "Personalized Report", description: "Detailed analysis of results" }
  ];

  const coveredItems = [
    { name: "Estradiol", description: "Primary female sex hormone" },
    { name: "Progesterone", description: "Supports pregnancy & cycle" },
    { name: "Testosterone", description: "Muscle & bone health" },
    { name: "FSH", description: "Follicle stimulating hormone" },
    { name: "LH", description: "Luteinizing hormone" },
    { name: "Cortisol", description: "Stress hormone levels" }
  ];

  const howItWorks = [
    { step: "01", title: "Buy your test", description: "Order online and receive your at-home test kit within 2-3 days" },
    { step: "02", title: "Post, accept sample", description: "Complete your test and return it using the prepaid envelope" },
    { step: "03", title: "Receive your results", description: "Get your comprehensive results within 5-7 days via email and app" }
  ];

  const faqs = [
    { question: "What you'll receive in your hormone blood test kit?", answer: "Your kit includes everything you need: lancets, blood collection tubes, alcohol wipes, bandages, and a prepaid return envelope." },
    { question: "When is included in your hormone blood test?", answer: "The test analyzes key hormone markers including estradiol, progesterone, testosterone, FSH, LH, and cortisol levels." },
    { question: "How we collect your sample at home?", answer: "Using the provided lancets, you'll collect a small blood sample at home. The process is simple and comes with detailed instructions." },
    { question: "Why us and how we can get you?", answer: "We provide lab-certified testing with fast results, personalized insights, and ongoing support from health professionals." },
    { question: "How it's work and when your results is?", answer: "After we receive your sample, our lab processes it within 5-7 business days. Results are delivered via email and in your app dashboard." },
    { question: "How you know take your test, results is?", answer: "You'll receive an email and app notification when your results are ready. You can then view and download your comprehensive report." }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4 pt-12 space-y-6 animate-pulse max-w-md mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center max-w-md mx-auto">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  const totalPrice = includeAddon ? product.price + 10 : product.price;

  return (
    <div className="min-h-screen bg-white pb-32 w-screen overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4 sticky top-0 bg-white z-10 max-w-md mx-auto">
        <Link to={createPageUrl("Shop")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <div className="flex items-center gap-2">
          <button className="p-2">
            <Heart className="w-6 h-6 text-gray-900" />
          </button>
          <button className="p-2">
            <Share2 className="w-6 h-6 text-gray-900" />
          </button>
        </div>
      </div>

      {/* Product Image Carousel */}
      <div className="px-4 mb-6 relative w-full max-w-md mx-auto">
        <div className="relative bg-gray-100 aspect-[4/3] rounded-2xl overflow-hidden w-full">
          <img
            src={productImages[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          
          {/* Navigation arrows */}
          {productImages.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex((currentImageIndex - 1 + productImages.length) % productImages.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md"
              >
                <ChevronLeft className="w-5 h-5 text-gray-900" />
              </button>
              <button
                onClick={() => setCurrentImageIndex((currentImageIndex + 1) % productImages.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md"
              >
                <ChevronRight className="w-5 h-5 text-gray-900" />
              </button>
            </>
          )}

          {/* Dots indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {productImages.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === currentImageIndex ? 'bg-gray-900' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="px-4 space-y-6 w-full max-w-md mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          {product.description && (
            <p className="text-gray-600 text-sm leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Price */}
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-gray-900">£{product.price.toFixed(2)}</span>
            <span className="text-sm text-gray-500">per test</span>
          </div>
        </div>

        {/* Addon Checkbox */}
        <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl">
          <Checkbox 
            checked={includeAddon}
            onCheckedChange={setIncludeAddon}
            className="mt-0.5"
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900 mb-1">
              Have a result in your email - <span className="font-bold">+ £10.00</span>
            </p>
            <p className="text-xs text-gray-500">
              Get comprehensive results and insights delivered to your email within 5-7 days
            </p>
          </div>
        </div>

        {/* Proceed to Checkout Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isAdding || !product.in_stock}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white h-14 rounded-full text-base font-semibold"
        >
          {isAdding ? 'Adding...' : `Proceed to checkout → £${totalPrice.toFixed(2)}`}
        </Button>

        {/* Payment Methods */}
        <div className="flex items-center justify-center gap-3 py-2">
          <div className="bg-white px-3 py-2 rounded-lg border border-gray-200">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-5" />
          </div>
          <div className="bg-white px-3 py-2 rounded-lg border border-gray-200">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="Google Pay" className="h-5" />
          </div>
          <div className="bg-white px-3 py-2 rounded-lg border border-gray-200">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" className="h-5" />
          </div>
          <div className="bg-white px-3 py-2 rounded-lg border border-gray-200">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-5" />
          </div>
          <div className="bg-white px-3 py-2 rounded-lg border border-gray-200">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-5" />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check className="w-5 h-5 text-gray-900" />
              </div>
              <p className="text-xs font-medium text-gray-900">Fast Results</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check className="w-5 h-5 text-gray-900" />
              </div>
              <p className="text-xs font-medium text-gray-900">Lab Certified</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check className="w-5 h-5 text-gray-900" />
              </div>
              <p className="text-xs font-medium text-gray-900">Free Delivery</p>
            </CardContent>
          </Card>
        </div>

        {/* What can it tell you */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">What can a {product.name.toLowerCase()} tell you?</h2>
          <div className="space-y-3">
            {whatItTells.map((item, idx) => (
              <Card key={idx} className="border border-gray-200">
                <CardContent className="p-4">
                  <p className="font-semibold text-gray-900 mb-1">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* What's covered */}
        <div className="space-y-4 -mx-4 w-screen max-w-full">
          <h2 className="text-xl font-bold text-gray-900 px-4">What's covered in this blood test?</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 px-4 w-full">
            {coveredItems.map((item, idx) => (
              <Card key={idx} className="border border-gray-200 flex-shrink-0 w-[200px]">
                <CardContent className="p-4">
                  <p className="font-semibold text-gray-900 mb-2">{item.name}</p>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="space-y-4 bg-gradient-to-b from-teal-600 to-teal-700 rounded-3xl p-6 -mx-4">
          <h2 className="text-xl font-bold text-white">How it Works</h2>
          <div className="space-y-4">
            {howItWorks.map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-700 font-bold">{step.step}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white mb-1">{step.title}</p>
                  <p className="text-sm text-white/90">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4 pb-6">
          <h2 className="text-xl font-bold text-gray-900">Want to know more?</h2>
          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <Card key={idx} className="border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full p-4 flex items-start justify-between gap-3 text-left"
                >
                  <p className="font-medium text-gray-900 text-sm">{faq.question}</p>
                  {expandedFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}