import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  TestTube,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

export default function MyOrdersTab({ orders }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'shipped': return Truck;
      case 'sample_received': return Package;
      case 'processing': return TestTube;
      case 'completed': return CheckCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'sample_received': return 'bg-purple-100 text-purple-800';
      case 'processing': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressValue = (status) => {
    switch (status) {
      case 'pending': return 20;
      case 'shipped': return 40;
      case 'sample_received': return 60;
      case 'processing': return 80;
      case 'completed': return 100;
      default: return 0;
    }
  };

  if (orders.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="text-center py-12">
          <TestTube className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-500 text-sm">
            Order your first test to start tracking your health journey
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const StatusIcon = getStatusIcon(order.status);
        return (
          <Card key={order.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg w-full">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-lg truncate">{order.test_name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Ordered on {format(new Date(order.created_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <Badge className={`${getStatusColor(order.status)} self-start flex-shrink-0`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {order.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">
                    {getProgressValue(order.status)}%
                  </span>
                </div>
                <Progress value={getProgressValue(order.status)} className="h-2" />
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-gray-500">Expected Results</p>
                    <p className="font-medium text-gray-900 truncate">
                      {order.expected_results_date 
                        ? format(new Date(order.expected_results_date), 'MMM d, yyyy')
                        : 'TBD'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <TestTube className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500">Amount Paid</p>
                    <p className="font-medium text-gray-900">${order.price_paid}</p>
                  </div>
                </div>
              </div>

              {order.tracking_number && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 break-all">
                    <strong>Tracking:</strong> {order.tracking_number}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}