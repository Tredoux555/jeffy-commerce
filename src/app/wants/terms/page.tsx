import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Jeffy Wants - Terms & Conditions',
  description: 'Terms and Conditions for the Jeffy Wants Program',
};

export default function JeffyWantsTermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/wants/create" className="inline-flex items-center text-[#ff6b35] hover:underline mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Create Want
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Jeffy Wants Program</h1>
          <h2 className="text-xl text-gray-600 mb-8">Terms and Conditions</h2>
          
          <p className="text-sm text-gray-500 mb-8">
            Last Updated: December 2024 | Effective Date: December 2024
          </p>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
            
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3">1. ACCEPTANCE OF TERMS</h3>
              <p className="text-sm leading-relaxed">
                By participating in the Jeffy Wants Program ("Program"), operated by Jeffy Commerce (Pty) Ltd 
                ("Company", "we", "us", or "our"), you ("Participant", "you", or "your") acknowledge that you 
                have read, understood, and agree to be bound by these Terms and Conditions ("Terms"). Your 
                participation in the Program constitutes your acceptance of these Terms in their entirety. If 
                you do not agree to these Terms, you must not participate in the Program. We reserve the right 
                to modify, amend, or update these Terms at any time without prior notice. Your continued 
                participation in the Program following any such modifications constitutes your acceptance of 
                the modified Terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3">2. PROGRAM DESCRIPTION</h3>
              <p className="text-sm leading-relaxed mb-3">
                The Jeffy Wants Program is a demand-aggregation initiative wherein Participants may submit 
                product requests ("Wants") and, upon achieving a predetermined threshold of confirmations 
                ("Agrees") from other users within a specified timeframe, may become eligible to receive 
                said product at no monetary cost to the Participant, subject to the terms and conditions 
                set forth herein.
              </p>
              <p className="text-sm leading-relaxed">
                <strong>2.1</strong> The Program operates on a "first-come, first-served" basis. Priority 
                for any given product request shall be determined by the chronological order in which the 
                Want was submitted to our system.<br/><br/>
                <strong>2.2</strong> Each Want is subject to a seven (7) calendar day period ("Qualifying Period") 
                during which the Participant must obtain the requisite number of Agrees.<br/><br/>
                <strong>2.3</strong> Only Agrees submitted through the official sharing mechanism, wherein 
                the agreeing party provides valid contact information including a telephone number, shall 
                be counted toward the threshold requirement.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3">3. ELIGIBILITY AND PARTICIPATION</h3>
              <p className="text-sm leading-relaxed">
                <strong>3.1</strong> Participation in the Program is open to individuals who are at least 
                eighteen (18) years of age and are legal residents of the Republic of South Africa.<br/><br/>
                <strong>3.2</strong> Participants must provide accurate, current, and complete information 
                when creating a Want, including but not limited to their legal name and valid telephone number.<br/><br/>
                <strong>3.3</strong> Each Participant may have multiple active Wants at any given time, 
                subject to our discretion and system limitations.<br/><br/>
                <strong>3.4</strong> We reserve the right to refuse participation or revoke eligibility 
                at our sole discretion without providing reasons therefor.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3">4. PRODUCT FULFILLMENT AND LIMITATIONS</h3>
              <p className="text-sm leading-relaxed">
                <strong>4.1 Best Efforts Commitment:</strong> The Company undertakes to use commercially 
                reasonable efforts to source and deliver products for Wants that successfully meet the 
                threshold requirements. However, Participants expressly acknowledge and agree that the 
                Company's obligation is limited to making best efforts and does not constitute a guarantee 
                of product delivery.<br/><br/>
                <strong>4.2 Price Thresholds:</strong><br/>
                (a) For Wants with a maximum price of One Thousand South African Rand (R1,000.00) or less, 
                the Company commits to prioritized fulfillment efforts, subject to product availability 
                and sourcing constraints.<br/>
                (b) For Wants exceeding One Thousand South African Rand (R1,000.00), fulfillment shall be 
                at the Company's sole discretion and subject to additional review and approval processes.<br/><br/>
                <strong>4.3 Product Variations:</strong> The actual product delivered may vary from the 
                original request in terms of brand, model, specifications, color, or other attributes, 
                provided that the delivered product is of substantially similar functionality and value. 
                The Company shall not be liable for any such variations.<br/><br/>
                <strong>4.4 Sourcing Limitations:</strong> All products are sourced from third-party 
                suppliers, primarily international vendors. Availability, shipping times, customs delays, 
                and other factors beyond our control may affect fulfillment timelines and outcomes.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3">5. EXPIRATION AND RETRY PROVISIONS</h3>
              <p className="text-sm leading-relaxed">
                <strong>5.1</strong> A Want that fails to achieve the requisite number of Agrees within 
                the Qualifying Period shall be deemed "Expired" and shall no longer be eligible for 
                fulfillment under its original submission.<br/><br/>
                <strong>5.2</strong> Upon expiration of a Want, the Participant may elect to resubmit 
                a new Want for the same or similar product, which shall be treated as a new submission 
                and subject to a new Qualifying Period.<br/><br/>
                <strong>5.3</strong> Priority for the resubmitted Want shall be determined based on the 
                new submission date, and the Participant shall not retain any priority from the original 
                expired Want.<br/><br/>
                <strong>5.4</strong> The Company reserves the right to limit the number of times a 
                Participant may retry a Want for the same product.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3">6. DISCLAIMER OF WARRANTIES</h3>
              <p className="text-sm leading-relaxed uppercase font-medium">
                THE PROGRAM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. TO THE FULLEST EXTENT 
                PERMITTED BY APPLICABLE LAW, THE COMPANY EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, 
                WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO ANY 
                WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
              </p>
              <p className="text-sm leading-relaxed mt-3">
                The Company does not warrant that: (a) the Program will meet your requirements or 
                expectations; (b) any product will be available, delivered, or of satisfactory quality; 
                (c) the Program will be uninterrupted, timely, secure, or error-free; or (d) any errors 
                in the Program will be corrected.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3">7. LIMITATION OF LIABILITY</h3>
              <p className="text-sm leading-relaxed uppercase font-medium">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE COMPANY, ITS 
                DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, AFFILIATES, OR LICENSORS BE LIABLE FOR ANY 
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING 
                BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE 
                LOSSES, REGARDLESS OF WHETHER SUCH DAMAGES WERE FORESEEABLE OR WHETHER THE COMPANY WAS 
                ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
              <p className="text-sm leading-relaxed mt-3">
                <strong>7.1</strong> The Company's total cumulative liability arising out of or related 
                to your participation in the Program shall not exceed the sum of Zero South African Rand 
                (R0.00), as participation in the Program is provided at no cost to the Participant.<br/><br/>
                <strong>7.2</strong> The Company shall not be liable for any failure to fulfill a Want, 
                regardless of whether the threshold requirements were met, and regardless of the reason 
                for such failure, including but not limited to product unavailability, supplier issues, 
                shipping complications, customs seizure, force majeure events, or any other circumstance.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3">8. INDEMNIFICATION</h3>
              <p className="text-sm leading-relaxed">
                You agree to indemnify, defend, and hold harmless the Company and its officers, directors, 
                employees, agents, affiliates, successors, and assigns from and against any and all claims, 
                damages, obligations, losses, liabilities, costs, and expenses (including but not limited 
                to attorney's fees) arising from: (a) your participation in the Program; (b) your violation 
                of these Terms; (c) your violation of any third-party right, including without limitation 
                any intellectual property right, publicity, confidentiality, property, or privacy right; 
                or (d) any claim that your participation caused damage to a third party.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3">9. INTELLECTUAL PROPERTY</h3>
              <p className="text-sm leading-relaxed">
                <strong>9.1</strong> All content, features, and functionality of the Program, including 
                but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, 
                and software, are the exclusive property of the Company or its licensors and are protected 
                by South African and international copyright, trademark, patent, trade secret, and other 
                intellectual property laws.<br/><br/>
                <strong>9.2</strong> By submitting a Want, you grant the Company a non-exclusive, worldwide, 
                royalty-free license to use, reproduce, modify, and display the content of your Want for 
                purposes of operating and promoting the Program.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3">10. PRIVACY AND DATA PROTECTION</h3>
              <p className="text-sm leading-relaxed">
                <strong>10.1</strong> Your participation in the Program is subject to our Privacy Policy, 
                which is incorporated herein by reference.<br/><br/>
                <strong>10.2</strong> By participating, you consent to the collection, processing, and 
                storage of your personal information, including your name, telephone number, and Want 
                preferences, in accordance with applicable data protection legislation, including the 
                Protection of Personal Information Act 4 of 2013 (POPIA).<br/><br/>
                <strong>10.3</strong> Your telephone number and personal details may be shared with 
                delivery partners and service providers for the purpose of fulfilling successful Wants.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3">11. TERMINATION</h3>
              <p className="text-sm leading-relaxed">
                <strong>11.1</strong> The Company may terminate or suspend the Program, or your 
                participation therein, at any time and for any reason, with or without cause, and 
                with or without notice.<br/><br/>
                <strong>11.2</strong> Upon termination, all outstanding Wants shall be deemed cancelled, 
                and you shall have no claim against the Company for any unfulfilled Wants, regardless 
                of their status at the time of termination.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3">12. GOVERNING LAW AND JURISDICTION</h3>
              <p className="text-sm leading-relaxed">
                <strong>12.1</strong> These Terms shall be governed by and construed in accordance with 
                the laws of the Republic of South Africa, without regard to its conflict of law provisions.<br/><br/>
                <strong>12.2</strong> Any dispute arising out of or relating to these Terms or the Program 
                shall be subject to the exclusive jurisdiction of the courts of the Republic of South Africa, 
                and you hereby consent to the personal jurisdiction of such courts.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3">13. FORCE MAJEURE</h3>
              <p className="text-sm leading-relaxed">
                The Company shall not be liable for any failure or delay in performance of its obligations 
                under these Terms resulting from causes beyond its reasonable control, including but not 
                limited to acts of God, war, terrorism, riots, embargoes, acts of civil or military authorities, 
                fire, floods, earthquakes, accidents, strikes, shortages of transportation, facilities, fuel, 
                energy, labor, or materials, pandemic, epidemic, or any other event or circumstance of like 
                or different character beyond the Company's reasonable control.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3">14. SEVERABILITY</h3>
              <p className="text-sm leading-relaxed">
                If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court 
                of competent jurisdiction, such invalidity, illegality, or unenforceability shall not affect 
                any other provision of these Terms, and these Terms shall be construed as if such invalid, 
                illegal, or unenforceable provision had never been contained herein.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3">15. ENTIRE AGREEMENT</h3>
              <p className="text-sm leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you 
                and the Company concerning the Program and supersede all prior or contemporaneous agreements, 
                communications, and proposals, whether oral or written, between you and the Company with 
                respect to the Program.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3">16. WAIVER</h3>
              <p className="text-sm leading-relaxed">
                The failure of the Company to exercise or enforce any right or provision of these Terms 
                shall not constitute a waiver of such right or provision. Any waiver of any provision of 
                these Terms will be effective only if in writing and signed by the Company.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-3">17. CONTACT INFORMATION</h3>
              <p className="text-sm leading-relaxed">
                If you have any questions about these Terms or the Program, please contact us at:<br/><br/>
                <strong>Jeffy Commerce (Pty) Ltd</strong><br/>
                Email: support@jeffy.co.za<br/>
                Website: www.jeffy.co.za
              </p>
            </section>

            <section className="border-t pt-8 mt-8">
              <p className="text-sm text-gray-600 italic">
                BY CHECKING THE ACCEPTANCE BOX AND PARTICIPATING IN THE JEFFY WANTS PROGRAM, YOU ACKNOWLEDGE 
                THAT YOU HAVE READ THESE TERMS AND CONDITIONS, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM. 
                YOU FURTHER ACKNOWLEDGE THAT THESE TERMS CONSTITUTE A BINDING LEGAL AGREEMENT BETWEEN YOU AND 
                JEFFY COMMERCE (PTY) LTD.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
