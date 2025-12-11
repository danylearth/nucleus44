import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ShoppingCart,
  Heart,
  Share2,
  Check,
  TestTube,
  Pill
} from "lucide-react";

export default function ProductDetailPage() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const productId = urlParams.get('id');
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [user, setUser] = useState(null);

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
      
      const cartItems = await base44.entities.CartItem.filter({ 
        user_email: user.email,
        product_id: product.id 
      });
      
      if (cartItems.length > 0) {
        await base44.entities.CartItem.update(cartItems[0].id, {
          quantity: cartItems[0].quantity + 1
        });
      } else {
        await base44.entities.CartItem.create({
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
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

  return (
    <div className="min-h-screen bg-white pb-32 w-full overflow-x-hidden">
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

      {/* Product Image */}
      <div className="px-4 mb-6 max-w-md mx-auto">
        <div className="relative bg-gray-100 aspect-square rounded-2xl overflow-hidden">
          <img
            src={product.image_url || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=600&fit=crop"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.popular && (
            <Badge className="absolute top-4 left-4 bg-red-600 text-white">
              Popular
            </Badge>
          )}
          {!product.in_stock && (
            <Badge className="absolute top-4 right-4 bg-gray-600 text-white">
              Out of Stock
            </Badge>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="px-4 space-y-6 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          {product.type === 'test' ? (
            <TestTube className="w-6 h-6 text-gray-900 flex-shrink-0 mt-1" />
          ) : (
            <Pill className="w-6 h-6 text-gray-900 flex-shrink-0 mt-1" />
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-sm text-gray-500 capitalize mb-2">
              {product.type} • {product.category}
            </p>
            {product.description && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">£{product.price.toFixed(2)}</span>
        </div>

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <Card className="border border-gray-200 rounded-2xl">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">What's included</h3>
              <ul className="space-y-2">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Duration for tests */}
        {product.type === 'test' && product.duration_days && (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <TestTube className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Test Results</p>
                  <p className="text-sm text-gray-600">Get results in {product.duration_days} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleAddToCart}
            disabled={isAdding || !product.in_stock}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 rounded-full text-base font-semibold"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {isAdding ? 'Adding...' : product.in_stock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </div>
    </div>
  );
}