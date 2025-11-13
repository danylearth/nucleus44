import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TestTube, Package, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function RecentActivity({ orders }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'processing': return Clock;
      case 'shipped': return Package;
      default: return TestTube;
    }
  };

  if (orders.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TestTube className="w-5 h-5 text-green-600" />
            Recent Test Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <TestTube className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No test orders yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TestTube className="w-5 h-5 text-green-600" />
          Recent Test Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {orders.map((order) => {
          const StatusIcon = getStatusIcon(order.status);
          return (
            <div
              key={order.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="p-2 bg-green-100 rounded-full">
                <StatusIcon className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">
                  {order.test_name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Ordered {format(new Date(order.created_date), 'MMM d, yyyy')}
                </p>
              </div>
              <Badge className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}