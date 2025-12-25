'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Truck, User, Phone, Mail, MapPin, Building, Loader2, CheckCircle, MapIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

type FormStep = 'personal' | 'zone' | 'insurance' | 'review';

export default function PartnerApplyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>('personal');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [zones, setZones] = useState<any[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [uploadingInsurance, setUploadingInsurance] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    idNumber: '',
    address: '',
    bankName: '',
    bankAccount: '',
    branchCode: '',
    zoneId: '',
    zoneName: '',
    vehicleReg: '',
    insuranceCertUrl: '',
    insuranceFileName: '',
    zonePartnerInterest: 'yes' as 'yes' | 'no' | 'maybe',
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user?.email) {
          setFormData(prev => ({ ...prev, email: user.email || '' }));
        }
        setCheckingAuth(false);
      } catch (err) {
        setCheckingAuth(false);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    const loadZones = async () => {
      try {
        const supabase = createClient();
        console.log('Loading zones...');
        const { data, error: zoneError } = await supabase
          .from('zones')
          .select('*')
          .order('name');

        console.log('Zone response:', { data, error: zoneError });
        console.log('Zone error details:', JSON.stringify(zoneError, null, 2));
        console.log('Zone data:', JSON.stringify(data, null, 2));
        
        if (!zoneError && data) {
          console.log('Setting zones:', data);
          setZones(data);
        } else if (zoneError) {
          console.error('Zone error:', zoneError);
          console.error('Zone error message:', zoneError?.message);
          console.error('Zone error code:', zoneError?.code);
          console.error('Zone error details:', zoneError?.details);
        }
      } catch (err) {
        console.error('Error loading zones:', err);
      } finally {
        setLoadingZones(false);
      }
    };
    loadZones();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleZoneSelect = (zoneId: string, zoneName: string) => {
    setFormData(prev => ({ ...prev, zoneId, zoneName }));
  };

  const handleInsuranceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF, JPG, or PNG file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploadingInsurance(true);
    setError(null);

    try {
      const supabase = createClient();
      const fileName = `insurance/${user.id}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('zone-partner-documents')
        .upload(fileName, file);

      if (uploadError) {
        setError('Failed to upload insurance certificate');
        setUploadingInsurance(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('zone-partner-documents')
        .getPublicUrl(fileName);

      setFormData(prev => ({
        ...prev,
        insuranceCertUrl: publicUrl,
        insuranceFileName: file.name,
      }));
      setError(null);
    } catch (err) {
      setError('Error uploading file. Please try again.');
    } finally {
      setUploadingInsurance(false);
    }
  };

  const validateStep = (step: FormStep): boolean => {
    switch (step) {
      case 'personal':
        return !!(formData.fullName && formData.phone && formData.email && formData.idNumber && formData.address);
      case 'zone':
        return !!(formData.zoneId && formData.vehicleReg);
      case 'insurance':
        return !!formData.insuranceCertUrl;
      case 'review':
        return !!(formData.bankName && formData.bankAccount && formData.branchCode);
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, current step:', currentStep);
    console.log('Form data:', formData);
    console.log('Validation result:', validateStep(currentStep));

    if (!validateStep(currentStep)) {
      console.log('Validation failed');
      setError('Please fill in all required fields');
      return;
    }

    if (currentStep === 'personal') {
      console.log('Navigating to zone step');
      setCurrentStep('zone');
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (currentStep === 'zone') {
      setCurrentStep('insurance');
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (currentStep === 'insurance') {
      setCurrentStep('review');
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const applicationData = {
        user_id: user.id,
        full_legal_name: formData.fullName,
        mobile: formData.phone,
        email: formData.email,
        id_number: formData.idNumber,
        physical_address: formData.address,
        bank_name: formData.bankName,
        bank_account_number: formData.bankAccount,
        bank_branch_code: formData.branchCode,
        zone_id: formData.zoneId,
        vehicle_registration_number: formData.vehicleReg,
        insurance_certificate_url: formData.insuranceCertUrl,
        zone_partner_interest: formData.zonePartnerInterest,
        application_status: 'pending',
        application_submitted_at: new Date().toISOString(),
      };

      const { data: insertedData, error: insertError } = await supabase
        .from('zone_partners')
        .upsert(applicationData, { onConflict: 'user_id' })
        .select()
        .single();

      if (insertError) throw insertError;

      setSuccess(true);

      setTimeout(() => {
        router.push(`/partner/agreement/${insertedData.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application. Please try again.');
      setLoading(false);
    }
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
          <p className="text-gray-600 mb-6">Create an account or login to apply for Zone Partner.</p>
          <div className="space-y-3">
            <Link href="/auth/login">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" className="w-full">Create Account</Button>
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
          <p className="text-gray-600 mb-2">Loading your Zone Partner agreement...</p>
          <Loader2 className="h-6 w-6 animate-spin text-orange-500 mx-auto" />
        </div>
      </div>
    );
  }

  const steps: FormStep[] = ['personal', 'zone', 'insurance', 'review'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />Back to Store
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-8 py-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Truck className="h-8 w-8" />
              Become a Zone Partner
            </h1>
            <p className="text-white/90 mt-2">Earn 50% commission on every delivery in your zone</p>
          </div>

          <div className="h-2 bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              {steps.map((step, idx) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 ${
                      idx < currentStepIndex
                        ? 'bg-green-500 text-white'
                        : idx === currentStepIndex
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {idx < currentStepIndex ? '✓' : idx + 1}
                  </div>
                  <p className="text-xs text-gray-600 text-center">
                    {step === 'personal' && 'Details'}
                    {step === 'zone' && 'Zone'}
                    {step === 'insurance' && 'Insurance'}
                    {step === 'review' && 'Review'}
                  </p>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStep === 'personal' && 'Your Details'}
              {currentStep === 'zone' && 'Choose Your Zone'}
              {currentStep === 'insurance' && 'Insurance Certificate'}
              {currentStep === 'review' && 'Review & Submit'}
            </h2>
            <p className="text-gray-600 mb-6">Step {currentStepIndex + 1} of {steps.length}</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 'personal' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Legal Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="072 123 4567"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SA ID Number *</label>
                    <Input
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleInputChange}
                      placeholder="8801015800088"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Physical Address *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="123 Main Road, Suburb, City"
                        className="w-full pl-10 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        rows={2}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'zone' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Select Your Delivery Zone *</label>
                    {loadingZones ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                      </div>
                    ) : zones.length === 0 ? (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
                        No zones available at this time. Check back soon!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {zones.map(zone => (
                          <button
                            key={zone.id}
                            type="button"
                            onClick={() => handleZoneSelect(zone.id, zone.name)}
                            className={`p-4 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                              formData.zoneId === zone.id
                                ? 'border-orange-500 bg-orange-50 shadow-md'
                                : 'border-gray-300 hover:border-orange-300'
                            }`}
                          >
                            <MapIcon className="h-5 w-5 text-orange-500 mb-2" />
                            <div className="font-semibold text-gray-900">{zone.name}</div>
                            <div className="text-xs text-gray-600">{zone.radius_km}km radius</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Registration *</label>
                    <Input
                      name="vehicleReg"
                      value={formData.vehicleReg}
                      onChange={handleInputChange}
                      placeholder="ABC 123 GP"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Are you interested in the Zone Partner opportunity? *
                    </label>
                    <select
                      name="zonePartnerInterest"
                      value={formData.zonePartnerInterest}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="yes">Yes, I'm interested</option>
                      <option value="maybe">Maybe, tell me more later</option>
                      <option value="no">Not interested</option>
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 'insurance' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      <strong>Required:</strong> You must have Public Liability Insurance (R1-5 million minimum) before becoming a Zone Partner.
                      Upload your certificate here.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Public Liability Insurance Certificate *</label>
                    <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 hover:border-orange-400 bg-gray-50 hover:bg-orange-50 transition-colors">
                      <div className="flex flex-col items-center">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        {formData.insuranceFileName ? (
                          <span className="text-sm font-medium text-green-600">✓ {formData.insuranceFileName}</span>
                        ) : (
                          <>
                            <span className="text-sm font-medium text-gray-700">Click to upload</span>
                            <span className="text-xs text-gray-500">PDF, JPG, or PNG (max 5MB)</span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleInsuranceUpload}
                        disabled={uploadingInsurance}
                        className="hidden"
                        required
                      />
                    </label>
                  </div>
                </div>
              )}

              {currentStep === 'review' && (
                <div className="space-y-4">
                  <div className="bg-orange-50 rounded-lg p-4 space-y-3 text-sm border border-orange-200">
                    <h3 className="font-semibold text-orange-900">Your Application Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Zone</p>
                        <p className="font-semibold text-gray-900">{formData.zoneName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Name</p>
                        <p className="font-semibold text-gray-900">{formData.fullName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-semibold text-gray-900 text-xs break-all">{formData.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="font-semibold text-gray-900">{formData.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Bank Details (for weekly payouts)</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleInputChange}
                          placeholder="FNB / Capitec / Standard Bank"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
                        <Input
                          name="bankAccount"
                          value={formData.bankAccount}
                          onChange={handleInputChange}
                          placeholder="62012345678"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Branch Code *</label>
                        <Input
                          name="branchCode"
                          value={formData.branchCode}
                          onChange={handleInputChange}
                          placeholder="250655"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t">
                {currentStepIndex > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(steps[currentStepIndex - 1])}
                    className="flex-1"
                  >
                    ← Back
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={loading || uploadingInsurance || !validateStep(currentStep)}
                  onClick={(e) => {
                    console.log('Button clicked!', {
                      loading,
                      uploadingInsurance,
                      validateStep: validateStep(currentStep),
                      currentStep,
                      formData
                    });
                  }}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : uploadingInsurance ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : currentStep === 'review' ? (
                    'Submit Application →'
                  ) : (
                    'Continue →'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
