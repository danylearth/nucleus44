import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, FileText } from "lucide-react";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to={createPageUrl("Profile")} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-700" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Terms and Conditions</h1>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-6">
                By accessing and using Nucleus ("the App"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily use the App for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained in the App</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Health Information and Medical Disclaimer</h2>
              <p className="text-gray-700 mb-4">
                The App provides health and wellness information and tracking features. However, you should be aware that:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>The App is not a substitute for professional medical advice, diagnosis, or treatment</li>
                <li>Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition</li>
                <li>Never disregard professional medical advice or delay in seeking it because of something you have read in the App</li>
                <li>The health metrics and insights provided are for informational purposes only</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Data and Privacy</h2>
              <p className="text-gray-700 mb-6">
                Your use of the App is also governed by our Privacy Policy. By using the App, you consent to the collection, use, and sharing of your information as described in our Privacy Policy.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Wearable Device Integration</h2>
              <p className="text-gray-700 mb-6">
                When you connect wearable devices or health apps to Nucleus, you grant us permission to access and sync your health data from these sources. You can disconnect these integrations at any time from your profile settings.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Lab Test Results</h2>
              <p className="text-gray-700 mb-4">
                If you access lab test results through the App:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Results are provided for informational purposes only</li>
                <li>You should consult with a healthcare professional to interpret results</li>
                <li>We do not guarantee the accuracy or completeness of third-party lab results</li>
                <li>You are responsible for maintaining the confidentiality of your test results</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Safeguarding your password and any other credentials used to access the App</li>
                <li>Any activities or actions under your account</li>
                <li>Notifying us immediately of any unauthorized access or security breach</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">
                You may not use the App:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>In any way that violates any applicable national or international law or regulation</li>
                <li>To transmit any unsolicited or unauthorized advertising or promotional material</li>
                <li>To impersonate or attempt to impersonate another user or person</li>
                <li>To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the App</li>
                <li>To introduce any viruses, trojan horses, worms, logic bombs, or other material that is malicious or technologically harmful</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Intellectual Property</h2>
              <p className="text-gray-700 mb-6">
                The App and its original content, features, and functionality are owned by Nucleus and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-700 mb-6">
                We may terminate or suspend your account and access to the App immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 mb-6">
                In no event shall Nucleus, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the App.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="text-gray-700 mb-6">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law</h2>
              <p className="text-gray-700 mb-6">
                These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which Nucleus operates, without regard to its conflict of law provisions.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="bg-gray-50 rounded-xl p-4 mt-4">
                <p className="text-gray-700 font-medium">support@nucleushealth.com</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}