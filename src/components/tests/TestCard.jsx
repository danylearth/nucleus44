import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Clock, 
  Droplets, 
  Dna, 
  Heart, 
  Shield, 
  TestTube,
  Star
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

  const getCategoryColor = (category) => {
    switch (category) {
      case 'essential': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'specialty': return 'bg-orange-100 text-orange-800';
      case 'premium': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOrder = async () => {
    setIsOrdering(true);
    await onOrder(test);
    setIsOrdering(false);
  };

  const TestIcon = getTestIcon(test.test_type);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <TestIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate">{test.test_name}</h3>
                  {test.popular && <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />}
                </div>
                <Badge className={`${getCategoryColor(test.category)} flex-shrink-0 text-xs`}>
                  {test.category}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1 capitalize">
                {test.test_type.replace('_', ' ')} • {test.sample_type} sample
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {test.description && (
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {test.description}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-gray-900">${test.price}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{test.duration_days} days</span>
            </div>
          </div>
          
          <Button
            onClick={handleOrder}
            disabled={isOrdering}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            {isOrdering ? 'Ordering...' : 'Order Test'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}