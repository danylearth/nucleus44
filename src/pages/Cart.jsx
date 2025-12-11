import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const items = await base44.entities.CartItem.filter({ 
        user_email: currentUser.email 
      });
      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await base44.entities.CartItem.update(item.id, { quantity: newQuantity });
      loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await base44.entities.CartItem.delete(itemId);
      loadCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

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
    <div className="min-h-screen bg-white pb-32 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-6 max-w-md mx-auto">
        <Link to={createPageUrl("Shop")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Shopping Cart</h1>
        <div className="w-10"></div>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 max-w-md mx-auto">
          <ShoppingBag className="w-20 h-20 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mb-6 text-center">
            Add some products to get started
          </p>
          <Link to={createPageUrl("Shop")}>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8">
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="px-4 space-y-6 max-w-md mx-auto">
          {/* Cart Items */}
          <div className="space-y-3">
            {cartItems.map((item) => (
              <Card key={item.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.product_image || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100&h=100&fit=crop"}
                      alt={item.product_name}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                        {item.product_name}
                      </h3>
                      <p className="text-lg font-bold text-gray-900 mb-2">
                        £{item.product_price.toFixed(2)}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
                          <button
                            onClick={() => updateQuantity(item, item.quantity - 1)}
                            className="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-gray-200"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item, item.quantity + 1)}
                            className="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-gray-200"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <Card className="bg-gray-50 border-0 rounded-2xl">
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-gray-900">
                  {shipping === 0 ? 'FREE' : `£${shipping.toFixed(2)}`}
                </span>
              </div>
              {subtotal < 50 && subtotal > 0 && (
                <p className="text-xs text-gray-500">
                  Add £{(50 - subtotal).toFixed(2)} more for free shipping
                </p>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-xl text-gray-900">£{total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-md mx-auto">
            <Link to={createPageUrl('Checkout')}>
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 rounded-full text-base font-semibold">
                Proceed to Checkout • £{total.toFixed(2)}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}