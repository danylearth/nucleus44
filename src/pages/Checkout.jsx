import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    postcode: '',
    country: 'UK'
  });

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const items = await base44.entities.CartItem.filter({ 
        user_email: currentUser.email 
      });
      setCartItems(items);
    } catch (error) {
      console.error('Error loading checkout data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const orderNum = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const total = cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
      
      await base44.entities.Order.create({
        order_number: orderNum,
        user_email: user.email,
        items: cartItems.map(item => ({
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.product_price
        })),
        total_amount: total,
        status: 'pending',
        shipping_address: formData
      });

      // Clear cart
      for (const item of cartItems) {
        await base44.entities.CartItem.delete(item.id);
      }

      setOrderNumber(orderNum);
      setOrderComplete(true);
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Failed to process order');
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Complete!</h1>
          <p className="text-gray-600 mb-6">
            Your order has been placed successfully.
          </p>
          <Card className="bg-gray-50 border-0 rounded-2xl mb-6">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-2">Order Number</p>
              <p className="text-lg font-bold text-gray-900">{orderNumber}</p>
            </CardContent>
          </Card>
          <Link to={createPageUrl('Shop')}>
            <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 rounded-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-6 max-w-md mx-auto">
        <Link to={createPageUrl("Cart")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Checkout</h1>
        <div className="w-10"></div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 space-y-6 max-w-md mx-auto">
        {/* Shipping Address */}
        <Card className="border border-gray-200 rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Shipping Address</h2>
            
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                required
                value={formData.street}
                onChange={(e) => setFormData({...formData, street: e.target.value})}
                className="rounded-xl"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="rounded-xl"
                  placeholder="London"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  required
                  value={formData.postcode}
                  onChange={(e) => setFormData({...formData, postcode: e.target.value})}
                  className="rounded-xl"
                  placeholder="SW1A 1AA"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                required
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="bg-gray-50 border-0 rounded-2xl">
          <CardContent className="p-6 space-y-3">
            <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
            
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.product_name} x{item.quantity}
                </span>
                <span className="font-medium text-gray-900">
                  £{(item.product_price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            <div className="border-t border-gray-200 pt-3 space-y-2">
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
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-xl text-gray-900">£{total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 rounded-full text-base font-semibold"
          >
            {isProcessing ? 'Processing...' : `Place Order • £${total.toFixed(2)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}