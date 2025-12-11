import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Droplets, 
  Dna, 
  Heart, 
  Shield, 
  TestTube,
  ArrowRight
} from "lucide-react";

export default function TestCard({ test, onOrder }) {
  const [isOrdering, setIsOrdering] = useState(false);

  const getTestIcon = (type) => {
    switch (type) {
      case 'blood': return Droplets;
      case 'dna': return Dna;
      case 'hormone': return Heart;
      case 'vitamin': return Shield;
      default: return TestTube;
    }
  };

  const handleOrder = async () => {
    setIsOrdering(true);
    await onOrder(test);
    setIsOrdering(false);
  };

  const TestIcon = getTestIcon(test.test_type);

  return (
    <Card className="bg-white border-0 shadow-sm rounded-2xl overflow-hidden">
      <div className="relative bg-gray-100 aspect-[4/3] flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop"
          alt={test.test_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-3 right-3 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
          <TestIcon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-base mb-1">{test.test_name}</h3>
          {test.description && (
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
              {test.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            £{test.price.toFixed(2)}
          </span>
          
          <Button
            onClick={handleOrder}
            disabled={isOrdering}
            size="sm"
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-5 h-9"
          >
            {isOrdering ? 'Ordering...' : (
              <>
                Order Now
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}