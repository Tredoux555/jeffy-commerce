import Link from 'next/link';
import { CheckCircle, Package, MessageCircle, Copy, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuccessPageProps {
  searchParams: Promise<{
    order?: string;
    method?: string;
  }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const orderNumber = params.order;
  const isEFT = params.method === 'eft';

  const whatsappMessage = `Hi! I just placed an order on Jeffy Commerce.\n\nOrder: ${orderNumber}\nPayment: ${isEFT ? 'EFT (pending transfer)' : 'Card/Online'}\n\nPlease confirm receipt!`;
  const whatsappLink = `https://wa.me/27000000000?text=${encodeURIComponent(whatsappMessage)}`;
  const trackLink = `/track?order=${orderNumber}`;

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
              <CheckCircle className="h-14 w-14 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {isEFT ? 'Order Placed!' : 'Payment Successful!'} 🎉
            </h1>
            <p className="text-gray-600">
              {isEFT ? 'Complete your payment to confirm' : 'Your order is being processed'}
            </p>
          </div>

          {/* Order Number Card */}
          {orderNumber && (
            <div className="bg-white rounded-2xl shadow-lg border p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Order Number</span>
                <button className="text-[#ff6b35] text-sm hover:underline flex items-center gap-1">
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              </div>
              <p className="font-mono text-2xl font-bold text-center py-3 bg-gray-50 rounded-xl">
                {orderNumber}
              </p>
            </div>
          )}

          {/* EFT Payment Details */}
          {isEFT && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 mb-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">🏦</span>
                Bank Transfer Details
              </h3>
              <div className="space-y-3 text-sm bg-white rounded-xl p-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank</span>
                  <span className="font-medium">FNB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Name</span>
                  <span className="font-medium">Jeffy Commerce</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Number</span>
                  <span className="font-mono font-medium">62123456789</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Branch Code</span>
                  <span className="font-mono font-medium">250655</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-600">Reference</span>
                  <span className="font-mono font-bold text-[#ff6b35]">{orderNumber}</span>
                </div>
              </div>
              <p className="text-sm text-orange-700 mt-4 flex items-start gap-2">
                <span>⚠️</span>
                Use your order number as the payment reference. We'll process your order once payment is confirmed.
              </p>
            </div>
          )}

          {/* WhatsApp Confirmation */}
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block mb-6">
            <div className="bg-green-500 hover:bg-green-600 text-white rounded-xl p-4 flex items-center justify-center gap-3 transition shadow-lg">
              <MessageCircle className="h-6 w-6" />
              <span className="font-bold">Send Order to WhatsApp</span>
            </div>
          </a>

          {/* Next Steps */}
          <div className="bg-white rounded-2xl shadow border p-6 mb-6">
            <h3 className="font-bold mb-4">What happens next?</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#ff6b35]">1</span>
                </div>
                <div>
                  <p className="font-medium">Order Confirmation</p>
                  <p className="text-sm text-gray-500">You'll receive a WhatsApp message confirming your order</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#ff6b35]">2</span>
                </div>
                <div>
                  <p className="font-medium">Processing</p>
                  <p className="text-sm text-gray-500">We'll pack and prepare your items for delivery</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#ff6b35]">3</span>
                </div>
                <div>
                  <p className="font-medium">Delivery</p>
                  <p className="text-sm text-gray-500">A Zone Partner will deliver to your door</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href={trackLink}>
              <Button size="lg" className="w-full bg-[#ff6b35] hover:bg-orange-600">
                <MapPin className="h-5 w-5 mr-2" />
                Track My Order
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="w-full">
                Continue Shopping
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
