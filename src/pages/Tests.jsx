import { useState, useEffect } from "react";
import { HealthTest, TestOrder, User } from "@/entities/all";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TestTube, 
  Search, 
  Star,
  Droplets,
  Dna,
  Heart,
  Brain,
  Shield
} from "lucide-react";

import TestCard from "../components/tests/TestCard";
import MyOrdersTab from "../components/tests/MyOrdersTab";

export default function TestsPage() {
  const [tests, setTests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTestsData();
  }, []);

  const loadTestsData = async () => {
    try {
      const [availableTests, userOrders] = await Promise.all([
        HealthTest.list('-created_date'),
        TestOrder.filter({ created_by: (await User.me().catch(() => ({ email: '' }))).email }, '-created_date')
      ]);
      setTests(availableTests);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading tests data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderTest = async (test) => {
    try {
      await TestOrder.create({
        test_id: test.id,
        test_name: test.test_name,
        price_paid: test.price,
        status: 'pending',
        order_date: new Date().toISOString().split('T')[0],
        expected_results_date: new Date(Date.now() + test.duration_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      loadTestsData();
    } catch (error) {
      console.error('Error ordering test:', error);
    }
  };

  const categories = [
    { id: 'all', label: 'All', icon: TestTube },
    { id: 'blood', label: 'Blood', icon: Droplets },
    { id: 'dna', label: 'DNA', icon: Dna },
    { id: 'hormone', label: 'Hormone', icon: Heart },
    { id: 'vitamin', label: 'Vitamin', icon: Shield },
    { id: 'allergy', label: 'Allergy', icon: Brain }
  ];

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.test_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || test.test_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="p-4 pt-8 max-w-full overflow-hidden">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-8 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Health Tests</h1>
        <p className="text-gray-600 text-sm mt-1">
          Order tests to get deeper insights into your health
        </p>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
          <TabsTrigger value="browse" className="text-sm">Browse Tests</TabsTrigger>
          <TabsTrigger value="orders" className="text-sm">My Orders ({orders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-6 space-y-6">
          {/* Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-0 shadow-md w-full"
            />
          </div>

          {/* Categories - Horizontal scroll on mobile */}
          <div className="w-full overflow-x-auto">
            <div className="flex gap-2 pb-2 min-w-max">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                >
                  <category.icon className="w-4 h-4" />
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Popular Tests */}
          {selectedCategory === 'all' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Popular Tests
              </h2>
              <div className="space-y-4">
                {tests.filter(test => test.popular).slice(0, 3).map((test) => (
                  <TestCard key={test.id} test={test} onOrder={handleOrderTest} />
                ))}
              </div>
            </div>
          )}

          {/* All Tests */}
          <div className="space-y-4">
            {selectedCategory !== 'all' && (
              <h2 className="text-lg font-semibold text-gray-900">
                {categories.find(c => c.id === selectedCategory)?.label} Tests
              </h2>
            )}
            <div className="space-y-4">
              {filteredTests
                .filter(test => selectedCategory === 'all' ? !test.popular : true)
                .map((test) => (
                  <TestCard key={test.id} test={test} onOrder={handleOrderTest} />
                ))}
            </div>
            {filteredTests.length === 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <TestTube className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No tests found
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Try adjusting your search or browse different categories
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <MyOrdersTab orders={orders} onUpdate={loadTestsData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}