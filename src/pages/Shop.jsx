import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ShoppingCart,
  TestTube,
  Pill,
  Droplets,
  Dna,
  Heart,
  Shield,
  Filter
} from "lucide-react";
import ProductCard from "../components/shop/ProductCard";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const [productsData, cartData] = await Promise.all([
        base44.entities.Product.filter({ in_stock: true }, '-created_date'),
        base44.entities.CartItem.filter({ user_email: currentUser.email })
      ]);
      
      setProducts(productsData);
      setCartItems(cartData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const existingItem = cartItems.find(item => item.product_id === product.id);
      
      if (existingItem) {
        await base44.entities.CartItem.update(existingItem.id, {
          quantity: existingItem.quantity + 1
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
      
      loadData();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const types = [
    { id: 'all', label: 'All', icon: Filter },
    { id: 'test', label: 'Tests', icon: TestTube },
    { id: 'supplement', label: 'Supplements', icon: Pill }
  ];

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'blood', label: 'Blood', icon: Droplets },
    { id: 'dna', label: 'DNA', icon: Dna },
    { id: 'hormone', label: 'Hormone', icon: Heart },
    { id: 'vitamin', label: 'Vitamin', icon: Shield },
    { id: 'multivitamin', label: 'Multivitamin' },
    { id: 'protein', label: 'Protein' },
    { id: 'omega3', label: 'Omega-3' },
    { id: 'probiotic', label: 'Probiotic' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || product.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const popularProducts = filteredProducts.filter(p => p.popular);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="space-y-4 animate-pulse max-w-md mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200 w-full">
        <div className="flex items-center justify-between px-4 pt-12 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Shop</h1>
          <Link to={createPageUrl('Cart')}>
            <Button variant="outline" size="icon" className="relative rounded-full">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 flex items-center justify-center p-0 text-xs rounded-full">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-11 bg-gray-50 border-0 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-4 pb-3 min-w-max">
            {types.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.id}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedType(type.id);
                    setSelectedCategory('all');
                  }}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 h-9 flex-shrink-0 ${
                    selectedType === type.id
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Category Filter */}
        <div className="w-full">
          <div className="flex flex-wrap gap-2 px-4 pb-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap rounded-full px-4 h-8 text-xs flex-shrink-0 ${
                  selectedCategory === category.id
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-6 mt-4">
        {/* Popular Products */}
        {popularProducts.length > 0 && selectedType === 'all' && selectedCategory === 'all' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Popular Products</h2>
            <div className="grid grid-cols-2 gap-4">
              {popularProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Products */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedType !== 'all' ? `${types.find(t => t.id === selectedType)?.label}` : 'All Products'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts
              .filter(p => !(selectedType === 'all' && selectedCategory === 'all' && p.popular))
              .map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart}
                />
              ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 text-sm">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}