import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, TestTube, Pill } from "lucide-react";

export default function ProductCard({ product, onAddToCart }) {
  return (
    <Link to={createPageUrl(`ProductDetail?id=${product.id}`)}>
      <Card className="bg-white border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative bg-gray-100 aspect-square flex items-center justify-center">
          <img
            src={product.image_url || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.popular && (
            <Badge className="absolute top-3 left-3 bg-red-600 text-white">
              Popular
            </Badge>
          )}
          {!product.in_stock && (
            <Badge className="absolute top-3 right-3 bg-gray-600 text-white">
              Out of Stock
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-2">
            {product.type === 'test' ? (
              <TestTube className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
            ) : (
              <Pill className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
              <p className="text-xs text-gray-500 mt-1 capitalize">{product.category}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              £{product.price.toFixed(2)}
            </span>
            
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(product);
              }}
              disabled={!product.in_stock}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-4 h-8"
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}