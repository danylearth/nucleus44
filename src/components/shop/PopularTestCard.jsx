import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function PopularTestCard({ product }) {
  return (
    <Card className="bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <Link to={`${createPageUrl('ProductDetail')}?id=${product.id}`} className="block">
          {/* Product Image */}
          <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
            <img
              src={product.image_url || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price and CTA */}
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-900">
                £{product.price.toFixed(2)}
              </span>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 h-12 text-base font-semibold">
                Order Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}