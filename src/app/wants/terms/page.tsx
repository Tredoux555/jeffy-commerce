'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function WantsTermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/wants" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
        <p className="text-gray-500 mb-2">Jeffy Wish List - Last updated: January 2026</p>
        <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm mb-8">
          These terms reflect the current Wish List model: submit a wish (no purchase, no catch), and every week Jeffy draws winners at random and grants their wish free. For the full draw rules, see <a href="/wish-list-rules" className="underline font-medium">the Wish List draw rules</a>. Participation is discretionary, promotional, and non-binding as stated below.
        </p>

        <div className="bg-white rounded-xl border p-8 prose prose-gray max-w-none text-sm leading-relaxed">
          
          <h2 className="text-lg font-bold mt-0">1. DEFINITIONS AND INTERPRETATION</h2>
          <p>
            1.1. In these Terms and Conditions ("Terms"), unless the context indicates otherwise, the following words and expressions shall have the meanings assigned to them hereunder:
          </p>
          <p>
            1.1.1. "Platform" refers to the Jeffy website, mobile applications, and all associated digital properties operated by Jeffy (Pty) Ltd, including but not limited to jeffy.co.za and any subdomains thereof;
          </p>
          <p>
            1.1.2. "Want" or "Want Request" means a product request submitted by a User through the Platform's Wants Program functionality, which may or may not result in the procurement and/or fulfilment of such requested product at the sole and absolute discretion of Jeffy;
          </p>
          <p>
            1.1.3. "Entry" means each validly submitted Want Request, which constitutes one (1) entry into the Draw. No purchase or payment of any kind is required to submit a Want Request or to enter the Draw;
          </p>
          <p>
            1.1.4. "Draw" means the random selection, conducted by Jeffy on a weekly basis, of one or more winning Want Requests from all eligible Entries, the winner(s) of which shall have their wish sourced and delivered at no cost. The conduct, timing, and rules of the Draw are published at /wish-list-rules and may be amended at Jeffy's sole discretion;
          </p>
          <p>
            1.1.5. "Eligible Product" means a product with an estimated retail value not exceeding One Thousand South African Rand (R1,000.00) as determined by Jeffy in its sole and absolute discretion;
          </p>
          <p>
            1.1.6. "User" means any individual who accesses, uses, or interacts with the Platform and/or the Wants Program.
          </p>

          <h2 className="text-lg font-bold">2. ACCEPTANCE OF TERMS</h2>
          <p>
            2.1. By submitting a Want Request or otherwise participating in the Wants Program, you acknowledge that you have read, understood, and agree to be bound by these Terms in their entirety.
          </p>
          <p>
            2.2. If you do not agree with any provision of these Terms, you must immediately cease all use of the Wants Program and refrain from submitting Want Requests.
          </p>
          <p>
            2.3. Jeffy reserves the right to modify, amend, supplement, or replace these Terms at any time without prior notice. Your continued use of the Wants Program following any such modifications shall constitute your acceptance of the modified Terms.
          </p>

          <h2 className="text-lg font-bold">3. PRODUCT VALUE LIMITATIONS AND ELIGIBILITY CRITERIA</h2>
          <p>
            3.1. <strong>MAXIMUM PRODUCT VALUE:</strong> The Wants Program is strictly limited to products with an estimated retail value not exceeding One Thousand South African Rand (R1,000.00). Want Requests for products exceeding this value threshold shall be automatically ineligible for fulfilment and may be removed from the Platform without notice.
          </p>
          <p>
            3.2. The determination of a product's value shall be made by Jeffy in its sole and absolute discretion, taking into account factors including but not limited to: current market prices, supplier costs, shipping and importation expenses, customs duties, and any other relevant considerations.
          </p>
          <p>
            3.3. Jeffy reserves the right to reject, decline, or refuse to fulfil any Want Request for any reason whatsoever, including but not limited to:
          </p>
          <p>
            3.3.1. Products deemed to exceed the maximum value threshold;<br/>
            3.3.2. Products that are illegal, restricted, or prohibited under South African law;<br/>
            3.3.3. Products that are unavailable, discontinued, or cannot be reasonably sourced;<br/>
            3.3.4. Products that pose health, safety, or security risks;<br/>
            3.3.5. Products that infringe upon intellectual property rights;<br/>
            3.3.6. Products that Jeffy determines, in its sole discretion, to be inappropriate, impractical, or contrary to the spirit of the Wants Program.
          </p>

          <h2 className="text-lg font-bold">4. NO GUARANTEE OF FULFILMENT</h2>
          <p>
            4.1. <strong>IMPORTANT NOTICE:</strong> THE SUBMISSION OF A WANT REQUEST, ENTRY INTO THE DRAW, OR EVEN SELECTION IN THE DRAW DOES NOT CONSTITUTE A BINDING AGREEMENT, CONTRACT, OR OBLIGATION ON THE PART OF JEFFY TO PROCURE, SOURCE, PROVIDE, DELIVER, OR OTHERWISE FULFIL THE REQUESTED PRODUCT, SAVE AS REQUIRED BY APPLICABLE LAW.
          </p>
          <p>
            4.2. Users expressly acknowledge and agree that:
          </p>
          <p>
            4.2.1. The Wants Program operates on a discretionary, promotional basis and does not create any legally enforceable rights or entitlements;
          </p>
          <p>
            4.2.2. Submitting a Want Request or being entered into the Draw indicates potential interest only and does not guarantee product availability, sourcing feasibility, or fulfilment;
          </p>
          <p>
            4.2.3. Jeffy may, at any time and for any reason, discontinue, suspend, modify, or terminate the Wants Program or any individual Want Request without liability;
          </p>
          <p>
            4.2.4. No representation, warranty, or guarantee of any kind, whether express, implied, or statutory, is made regarding the fulfilment of Want Requests;
          </p>
          <p>
            4.2.5. Jeffy shall not be liable for any disappointment, inconvenience, loss, or damage arising from the non-fulfilment of Want Requests.
          </p>

          <h2 className="text-lg font-bold">5. LIMITATION OF LIABILITY</h2>
          <p>
            5.1. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, JEFFY, ITS DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, AFFILIATES, AND PARTNERS SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES ARISING OUT OF OR IN CONNECTION WITH THE WANTS PROGRAM.
          </p>
          <p>
            5.2. Without limiting the generality of the foregoing, Jeffy shall not be liable for:
          </p>
          <p>
            5.2.1. Any failure to fulfil, delay in fulfilling, or partial fulfilment of Want Requests;<br/>
            5.2.2. Any discrepancy between requested products and products actually provided;<br/>
            5.2.3. Product quality, fitness for purpose, merchantability, or conformity with description;<br/>
            5.2.4. Any loss of data, corruption of Want Requests, or technical failures;<br/>
            5.2.5. Any actions, omissions, or conduct of third-party Users;<br/>
            5.2.6. Any reliance placed on the Wants Program or expectations regarding fulfilment.
          </p>
          <p>
            5.3. In jurisdictions that do not allow the exclusion or limitation of liability for certain damages, Jeffy's liability shall be limited to the maximum extent permitted by law.
          </p>

          <h2 className="text-lg font-bold">6. USER REPRESENTATIONS AND WARRANTIES</h2>
          <p>
            6.1. By participating in the Wants Program, you represent and warrant that:
          </p>
          <p>
            6.1.1. You are at least eighteen (18) years of age or have obtained parental or guardian consent;<br/>
            6.1.2. All information provided in connection with Want Requests is accurate, complete, and not misleading;<br/>
            6.1.3. You will not submit Want Requests for products exceeding the R1,000.00 value threshold;<br/>
            6.1.4. You will not attempt to manipulate, game, or abuse the Draw;<br/>
            6.1.5. You understand and accept that Want Request fulfilment is not guaranteed;<br/>
            6.1.6. You will not hold Jeffy liable for non-fulfilment of Want Requests.
          </p>

          <h2 className="text-lg font-bold">7. DRAW INTEGRITY</h2>
          <p>
            7.1. Users shall not engage in any conduct intended to gain an unfair advantage in the Draw or to artificially inflate the number of Entries, including but not limited to:
          </p>
          <p>
            7.1.1. Creating multiple accounts in order to submit duplicate Entries;<br/>
            7.1.2. Using automated systems, bots, or scripts to generate Entries;<br/>
            7.1.3. Submitting Entries on behalf of other persons without their consent; <br/>
            7.1.4. Coordinating any fraudulent scheme to manipulate the Draw.
          </p>
          <p>
            7.2. Jeffy reserves the right to invalidate Entries, reject Want Requests, and suspend or terminate User access in cases of suspected manipulation or abuse.
          </p>

          <h2 className="text-lg font-bold">8. INTELLECTUAL PROPERTY</h2>
          <p>
            8.1. All content, materials, and intellectual property associated with the Platform and Wants Program remain the exclusive property of Jeffy or its licensors.
          </p>
          <p>
            8.2. Users grant Jeffy a non-exclusive, royalty-free, worldwide license to use, display, and reproduce any content submitted in connection with Want Requests for Platform operation and promotional purposes.
          </p>

          <h2 className="text-lg font-bold">9. PRIVACY AND DATA PROTECTION</h2>
          <p>
            9.1. The collection, use, and processing of personal information in connection with the Wants Program is governed by Jeffy's Privacy Policy, which is incorporated herein by reference.
          </p>
          <p>
            9.2. By participating in the Wants Program, you consent to the collection and processing of your personal information as described in the Privacy Policy.
          </p>

          <h2 className="text-lg font-bold">10. INDEMNIFICATION</h2>
          <p>
            10.1. You agree to indemnify, defend, and hold harmless Jeffy, its directors, officers, employees, agents, and affiliates from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or in connection with:
          </p>
          <p>
            10.1.1. Your use of the Wants Program;<br/>
            10.1.2. Your breach of these Terms;<br/>
            10.1.3. Your violation of any applicable law or regulation;<br/>
            10.1.4. Any content or information you submit through the Platform.
          </p>

          <h2 className="text-lg font-bold">11. GOVERNING LAW AND JURISDICTION</h2>
          <p>
            11.1. These Terms shall be governed by and construed in accordance with the laws of the Republic of South Africa.
          </p>
          <p>
            11.2. Any disputes arising out of or in connection with these Terms or the Wants Program shall be subject to the exclusive jurisdiction of the courts of the Republic of South Africa.
          </p>

          <h2 className="text-lg font-bold">12. SEVERABILITY</h2>
          <p>
            12.1. If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.
          </p>

          <h2 className="text-lg font-bold">13. ENTIRE AGREEMENT</h2>
          <p>
            13.1. These Terms, together with the Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and Jeffy regarding the Wants Program and supersede all prior agreements and understandings.
          </p>

          <h2 className="text-lg font-bold">14. CONTACT INFORMATION</h2>
          <p>
            14.1. For questions or concerns regarding these Terms or the Wants Program, please contact us at support@jeffy.co.za.
          </p>

          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <p className="font-bold text-gray-700 mb-2">ACKNOWLEDGMENT</p>
            <p className="text-gray-600">
              BY USING THE WANTS PROGRAM, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS AND CONDITIONS, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM. YOU FURTHER ACKNOWLEDGE THAT THESE TERMS CONSTITUTE THE COMPLETE AND EXCLUSIVE STATEMENT OF THE AGREEMENT BETWEEN YOU AND JEFFY, AND THAT THEY SUPERSEDE ANY PROPOSAL OR PRIOR AGREEMENT, ORAL OR WRITTEN, AND ANY OTHER COMMUNICATIONS BETWEEN YOU AND JEFFY RELATING TO THE SUBJECT MATTER OF THESE TERMS.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}