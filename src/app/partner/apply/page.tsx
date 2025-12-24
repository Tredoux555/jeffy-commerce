'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Truck, User, Phone, Mail, MapPin, Building, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

export default function PartnerApplyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setCheckingAuth(false);
    };
    checkUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to apply');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const applicationData = {
      user_id: user.id,
      full_legal_name: formData.get('fullName') as string,
      mobile: formData.get('phone') as string,
      email: formData.get('email') as string,
      id_number: formData.get('idNumber') as string,
      physical_address: formData.get('address') as string,
      bank_name: formData.get('bankName') as string,
      bank_account_number: formData.get('bankAccount') as string,
      bank_branch_code: formData.get('branchCode') as string,
      application_status: 'pending',
      application_submitted_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from('zone_partners')
      .insert(applicationData);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
          <p className="text-gray-600 mb-6">
            You need to create an account or login before applying to become a Zone Partner.
          </p>
          <div className="space-y-3">
            <Link href="/auth/login">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500">
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" className="w-full">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for applying to become a Jeffy Zone Partner. We'll review your application and get back to you within 2-3 business days.
          </p>
          <Link href="/">
            <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500">
              Back to Store
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to store
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Become a Zone Partner</h1>
            <p className="text-gray-600 mt-2">Earn 50% commission on every delivery in your zone</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-orange-800 mb-2">How it works:</h3>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Get assigned a delivery zone in your area</li>
              <li>• Purchase stock at wholesale prices</li>
              <li>• Deliver to customers and keep 50% profit</li>
              <li>• Weekly payouts to your bank account</li>
            </ul>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Personal Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Legal Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input name="fullName" required placeholder="John Doe" className="pl-10" disabled={loading} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input name="phone" type="tel" required placeholder="072 123 4567" className="pl-10" disabled={loading} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input name="email" type="email" required placeholder="you@example.com" className="pl-10" disabled={loading} defaultValue={user?.email || ''} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SA ID Number</label>
                <Input name="idNumber" required placeholder="8801015800088" disabled={loading} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Physical Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    name="address"
                    required
                    placeholder="123 Main Road, Suburb, City"
                    className="w-full pl-10 p-3 border rounded-lg resize-none"
                    rows={2}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Bank Details (for payouts)</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input name="bankName" required placeholder="FNB / Capitec / Standard Bank" className="pl-10" disabled={loading} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                  <Input name="bankAccount" required placeholder="62012345678" disabled={loading} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch Code</label>
                  <Input name="branchCode" required placeholder="250655" disabled={loading} />
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <input type="checkbox" id="terms" required className="h-4 w-4 mt-0.5 rounded border-gray-300 text-orange-500" />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/partner-terms" className="text-orange-600 hover:underline">Partner Terms</Link>
                {' '}and confirm all information is accurate
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
