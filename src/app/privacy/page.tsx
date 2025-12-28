import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Jeffy Commerce',
  description: 'Privacy Policy for Jeffy Commerce',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center text-[#ff6b35] hover:underline mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last Updated: December 2024</p>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
              <p className="text-sm leading-relaxed">
                Jeffy Commerce (Pty) Ltd ("we", "us", "our") is committed to protecting your privacy and ensuring 
                that your personal information is handled in accordance with the Protection of Personal Information 
                Act 4 of 2013 ("POPIA") and other applicable South African legislation. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
              <p className="text-sm leading-relaxed mb-3">We may collect the following types of personal information:</p>
              <ul className="list-disc pl-6 text-sm space-y-2">
                <li><strong>Identity Information:</strong> Name, surname</li>
                <li><strong>Contact Information:</strong> Phone number, email address, physical address</li>
                <li><strong>Transaction Information:</strong> Products purchased, order history, payment details</li>
                <li><strong>Technical Information:</strong> IP address, browser type, device information</li>
                <li><strong>Usage Information:</strong> How you interact with our website and services</li>
                <li><strong>Preferences:</strong> Product interests, wants created, survey responses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <p className="text-sm leading-relaxed mb-3">We use your personal information to:</p>
              <ul className="list-disc pl-6 text-sm space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Operate the Jeffy Wants program</li>
                <li>Communicate with you about your orders and wants</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
                <li>Prevent fraud and ensure security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Sharing Your Information</h2>
              <p className="text-sm leading-relaxed mb-3">We may share your personal information with:</p>
              <ul className="list-disc pl-6 text-sm space-y-2">
                <li><strong>Delivery Partners:</strong> To fulfill and deliver your orders</li>
                <li><strong>Payment Processors:</strong> To process your payments securely</li>
                <li><strong>Zone Partners:</strong> Local delivery partners in your area</li>
                <li><strong>Service Providers:</strong> Third parties who assist us in operating our business</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
              </ul>
              <p className="text-sm leading-relaxed mt-3">
                We do not sell your personal information to third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Your Rights Under POPIA</h2>
              <p className="text-sm leading-relaxed mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 text-sm space-y-2">
                <li>Access your personal information held by us</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to the processing of your information</li>
                <li>Withdraw consent for marketing communications</li>
                <li>Lodge a complaint with the Information Regulator</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Data Security</h2>
              <p className="text-sm leading-relaxed">
                We implement appropriate technical and organisational measures to protect your personal information 
                against unauthorised access, alteration, disclosure, or destruction. However, no method of transmission 
                over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Data Retention</h2>
              <p className="text-sm leading-relaxed">
                We retain your personal information only for as long as necessary to fulfill the purposes for which 
                it was collected, including to satisfy legal, accounting, or reporting requirements. When your 
                information is no longer required, we will securely delete or anonymise it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Cookies</h2>
              <p className="text-sm leading-relaxed">
                Our website uses cookies and similar technologies to enhance your browsing experience. Cookies are 
                small text files stored on your device. You can control cookies through your browser settings, 
                but disabling them may affect website functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Changes to This Policy</h2>
              <p className="text-sm leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the new policy on our website. Your continued use of our services after changes 
                constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact Us</h2>
              <p className="text-sm leading-relaxed">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:<br/><br/>
                <strong>Jeffy Commerce (Pty) Ltd</strong><br/>
                Email: privacy@jeffy.co.za<br/>
                Website: www.jeffy.co.za
              </p>
            </section>

            <section className="border-t pt-6 mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Information Regulator Contact</h2>
              <p className="text-sm leading-relaxed text-gray-600">
                If you are not satisfied with how we handle your personal information, you may lodge a complaint with:<br/><br/>
                <strong>The Information Regulator (South Africa)</strong><br/>
                Website: www.justice.gov.za/inforeg
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
