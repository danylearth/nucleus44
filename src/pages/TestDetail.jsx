import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Heart,
  Share2,
  Clock,
  TestTube,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function TestDetailPage() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const testId = urlParams.get('id');
  
  const [test, setTest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    whatYouGet: false,
    coverage: false,
    biomarkers: false
  });

  useEffect(() => {
    loadTest();
  }, [testId]);

  const loadTest = async () => {
    try {
      setIsLoading(true);
      const testData = await base44.entities.HealthTest.get(testId);
      setTest(testData);
    } catch (error) {
      console.error('Error loading test:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrder = async () => {
    try {
      setIsOrdering(true);
      const user = await base44.auth.me();
      await base44.entities.TestOrder.create({
        test_id: test.id,
        test_name: test.test_name,
        price_paid: test.price,
        status: 'pending',
        order_date: new Date().toISOString().split('T')[0],
        expected_results_date: new Date(Date.now() + test.duration_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      window.location.href = createPageUrl('Tests');
    } catch (error) {
      console.error('Error ordering test:', error);
      alert('Failed to order test');
    } finally {
      setIsOrdering(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto">
        <div className="p-4 pt-12 space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex items-center justify-center">
        <p className="text-gray-500">Test not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-32">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4 sticky top-0 bg-white z-10">
        <Link to={createPageUrl("Tests")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <div className="flex items-center gap-2">
          <button className="p-2">
            <Heart className="w-6 h-6 text-gray-900" />
          </button>
          <button className="p-2">
            <Share2 className="w-6 h-6 text-gray-900" />
          </button>
        </div>
      </div>

      {/* Product Image */}
      <div className="px-4 mb-6">
        <div className="relative bg-gray-100 aspect-[4/3] rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=450&fit=crop"
            alt={test.test_name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Test Info */}
      <div className="px-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{test.test_name}</h1>
          {test.description && (
            <p className="text-gray-600 text-sm leading-relaxed">
              {test.description}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">£{test.price.toFixed(2)}</span>
          <span className="text-gray-400 line-through">£{(test.price * 1.2).toFixed(2)}</span>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gray-50 border-0">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-gray-900 mx-auto mb-2" />
              <p className="text-xs text-gray-600 mb-1">Test Results</p>
              <p className="text-sm font-semibold text-gray-900">{test.duration_days} days</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 border-0">
            <CardContent className="p-4 text-center">
              <TestTube className="w-6 h-6 text-gray-900 mx-auto mb-2" />
              <p className="text-xs text-gray-600 mb-1">Sample type</p>
              <p className="text-sm font-semibold text-gray-900 capitalize">{test.sample_type}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 border-0">
            <CardContent className="p-4 text-center">
              <div className="w-6 h-6 bg-gray-900 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold">
                {test.category?.charAt(0).toUpperCase()}
              </div>
              <p className="text-xs text-gray-600 mb-1">Category</p>
              <p className="text-sm font-semibold text-gray-900 capitalize">{test.category}</p>
            </CardContent>
          </Card>
        </div>

        {/* What you get */}
        <Card className="border border-gray-200 rounded-2xl overflow-hidden">
          <button 
            onClick={() => toggleSection('whatYouGet')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <h3 className="font-semibold text-gray-900">What you get</h3>
            {expandedSections.whatYouGet ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {expandedSections.whatYouGet && (
            <div className="px-4 pb-4">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Easy-to-use at-home test kit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Comprehensive analysis by certified labs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Detailed results and insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Personalized recommendations</span>
                </li>
              </ul>
            </div>
          )}
        </Card>

        {/* Coverage */}
        <Card className="border border-gray-200 rounded-2xl overflow-hidden">
          <button 
            onClick={() => toggleSection('coverage')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <h3 className="font-semibold text-gray-900">What we cover in this biomarker test</h3>
            {expandedSections.coverage ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {expandedSections.coverage && (
            <div className="px-4 pb-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                This comprehensive test analyzes key biomarkers to give you insights into your overall health, 
                including hormone levels, vitamin deficiencies, metabolic function, and more.
              </p>
            </div>
          )}
        </Card>

        {/* How it Works */}
        <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 text-lg">How it Works</h3>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-gray-900">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Do your test</h4>
                <p className="text-sm text-gray-600">
                  Use our easy-to-follow instructions to collect your sample at home in just minutes.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-gray-900">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Post sample, results</h4>
                <p className="text-sm text-gray-600">
                  Mail your sample using the prepaid envelope. Get results in {test.duration_days} days.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-gray-900">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">In-app view results</h4>
                <p className="text-sm text-gray-600">
                  Access your detailed results and personalized recommendations in the app.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Want to know more */}
        <Card className="border border-gray-200 rounded-2xl overflow-hidden">
          <button 
            onClick={() => toggleSection('biomarkers')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <h3 className="font-semibold text-gray-900">Want to know more?</h3>
            {expandedSections.biomarkers ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {expandedSections.biomarkers && (
            <div className="px-4 pb-4">
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Get detailed information about all biomarkers included in this test and what they mean for your health.
              </p>
              <Button variant="outline" className="w-full">
                View Full Details
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto">
        <Button
          onClick={handleOrder}
          disabled={isOrdering}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 rounded-full text-base font-semibold"
        >
          {isOrdering ? 'Processing...' : 'Proceed to checkout'}
        </Button>
      </div>
    </div>
  );
}