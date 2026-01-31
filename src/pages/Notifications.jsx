import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, TrendingUp, AlertTriangle, Target, Award, Heart, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import BellIcon from "../components/icons/BellIcon";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const user = await base44.auth.me();
      const insights = await base44.entities.AIInsight.filter(
        { created_by: user.email },
        '-created_date',
        50
      );
      setNotifications(insights);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notification) => {
    try {
      await base44.entities.AIInsight.update(notification.id, { is_read: true });
      setNotifications(notifications.map(n => 
        n.id === notification.id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getIcon = (type, category) => {
    if (type === 'alert') return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (type === 'achievement') return <Award className="w-5 h-5 text-yellow-500" />;
    if (type === 'trend') return <TrendingUp className="w-5 h-5 text-blue-500" />;
    if (type === 'goal_progress') return <Target className="w-5 h-5 text-green-500" />;
    if (category === 'heart_health') return <Heart className="w-5 h-5 text-red-500" />;
    return <Activity className="w-5 h-5 text-teal-500" />;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 border-red-200';
      case 'high': return 'bg-orange-50 border-orange-200';
      case 'medium': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent': return <Badge className="bg-red-100 text-red-700 border-red-200">Urgent</Badge>;
      case 'high': return <Badge className="bg-orange-100 text-orange-700 border-orange-200">High</Badge>;
      case 'medium': return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Medium</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Low</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="px-4 pt-12 pb-6">
          <div className="flex items-center justify-between mb-6">
            <Link to={createPageUrl("Dashboard")} className="p-2 -ml-2">
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Notifications</h1>
            <div className="w-10"></div>
          </div>
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <Link to={createPageUrl("Dashboard")} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Notifications</h1>
          <div className="w-10"></div>
        </div>

        {notifications.length === 0 ? (
          <Card className="bg-white rounded-2xl border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <BellIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications</h3>
              <p className="text-gray-500 text-sm">
                You're all caught up! Check back later for updates.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => !notification.is_read && handleMarkAsRead(notification)}
                className="w-full text-left"
              >
                <Card className={`bg-white rounded-2xl border shadow-sm transition-all hover:shadow-md ${
                  !notification.is_read ? getPriorityColor(notification.priority) : 'border-gray-100'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        !notification.is_read ? 'bg-teal-100' : 'bg-gray-100'
                      }`}>
                        {getIcon(notification.insight_type, notification.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`font-semibold ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1.5"></div>
                          )}
                        </div>
                        <p className={`text-sm mb-2 ${
                          !notification.is_read ? 'text-gray-600' : 'text-gray-500'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(notification.priority)}
                          <span className="text-xs text-gray-400">
                            {new Date(notification.created_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}