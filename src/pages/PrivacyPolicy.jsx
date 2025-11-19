import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to={createPageUrl("Profile")} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-700" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <Card className="bg-white rounded-2xl border-0 shadow-sm">
          <CardContent className="p-8 space-y-6">
            <div className="text-sm text-gray-500">
              Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>

            <div className="prose prose-gray max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 mb-6">
                Nucleus ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and health tracking services.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.1 Personal Information</h3>
              <p className="text-gray-700 mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Name, email address, and phone number</li>
                <li>Date of birth and gender</li>
                <li>Profile picture</li>
                <li>Physical characteristics (height, weight)</li>
                <li>Activity level and health goals</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.2 Health Data</h3>
              <p className="text-gray-700 mb-4">
                With your explicit consent, we collect health-related information including:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Heart rate, steps, calories burned, and other activity metrics</li>
                <li>Sleep patterns and quality</li>
                <li>Blood pressure, glucose levels, and other biometric data</li>
                <li>Lab test results (blood work, genetic tests, hormones)</li>
                <li>Supplement and medication tracking</li>
                <li>Data from connected wearable devices and health apps</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.3 Device and Usage Information</h3>
              <p className="text-gray-700 mb-4">
                We automatically collect certain information about your device and how you interact with the App:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Device type, operating system, and unique device identifiers</li>
                <li>IP address and browser type</li>
                <li>App usage patterns and feature interactions</li>
                <li>Crash reports and performance data</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Provide, maintain, and improve our health tracking services</li>
                <li>Generate personalized health insights and recommendations</li>
                <li>Sync data from your connected wearable devices</li>
                <li>Display your lab test results and health metrics</li>
                <li>Send you notifications about your health goals and progress</li>
                <li>Respond to your comments, questions, and customer service requests</li>
                <li>Monitor and analyze usage patterns to improve the App</li>
                <li>Detect, prevent, and address technical issues and security threats</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Share Your Information</h2>
              <p className="text-gray-700 mb-4">
                We do not sell your personal or health information. We may share your information in the following circumstances:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 With Your Consent</h3>
              <p className="text-gray-700 mb-6">
                We may share your information when you give us explicit permission to do so, such as when you connect third-party health apps or share results with healthcare providers.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Service Providers</h3>
              <p className="text-gray-700 mb-6">
                We may share your information with third-party service providers who perform services on our behalf, such as cloud hosting, data analysis, and customer support. These providers are contractually obligated to protect your information.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Health Data Partners</h3>
              <p className="text-gray-700 mb-6">
                When you connect wearable devices (Apple Health, Google Fit, Garmin, Fitbit, etc.), we access your health data through their APIs to sync and display in the App. This data exchange is governed by their respective privacy policies and your consent.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.4 Legal Requirements</h3>
              <p className="text-gray-700 mb-6">
                We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Secure cloud infrastructure</li>
              </ul>
              <p className="text-gray-700 mb-6">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee its absolute security.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Privacy Rights</h2>
              <p className="text-gray-700 mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request that we correct any inaccurate information</li>
                <li><strong>Deletion:</strong> Request that we delete your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a machine-readable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Disconnect:</strong> Disconnect wearable devices and stop data syncing</li>
              </ul>
              <p className="text-gray-700 mb-6">
                To exercise these rights, please contact us at the email address provided below.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-700 mb-6">
                We retain your information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will delete or anonymize your personal information, though some information may be retained for legal or operational purposes.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Children's Privacy</h2>
              <p className="text-gray-700 mb-6">
                Our App is not intended for children under the age of 13 (or 16 in some jurisdictions). We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-700 mb-6">
                Your information may be transferred to and processed in countries other than your own. We ensure that appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Integrations</h2>
              <p className="text-gray-700 mb-4">
                The App integrates with third-party services including:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Apple Health</li>
                <li>Google Fit</li>
                <li>Garmin</li>
                <li>Fitbit</li>
                <li>Oura Ring</li>
                <li>WHOOP</li>
              </ul>
              <p className="text-gray-700 mb-6">
                These third-party services have their own privacy policies. We encourage you to review their policies before connecting these services to Nucleus.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. HIPAA Compliance</h2>
              <p className="text-gray-700 mb-6">
                While Nucleus processes health information, the App is designed for personal health tracking and wellness purposes. If you are a healthcare provider using the App, additional HIPAA-compliant features may be available. Please contact us for more information.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-6">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-blue-50 rounded-xl p-4 mt-4">
                <p className="text-gray-700 font-medium mb-1">Email: privacy@nucleushealth.com</p>
                <p className="text-gray-700 font-medium">Support: support@nucleushealth.com</p>
              </div>

              <div className="bg-green-50 rounded-xl p-4 mt-6 border border-green-200">
                <p className="text-green-900 font-semibold mb-2">Your Health Data is Protected</p>
                <p className="text-green-800 text-sm">
                  We take your privacy seriously and are committed to transparency in how we handle your health information. You have full control over your data and can disconnect integrations or delete your account at any time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}