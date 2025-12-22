import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
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

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold mb-2">
          {isEFT ? 'Order Placed!' : 'Payment Successful!'}
        </h1>

        {orderNumber && (
          <p className="text-gray-600 mb-6">
            Order number: <span className="font-mono font-medium">{orderNumber}</span>
          </p>
        )}

        {isEFT ? (
          <div className="bg-primary-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold mb-3">Bank Transfer Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-600">Bank:</span> FNB</p>
              <p><span className="text-gray-600">Account Name:</span> Jeffy Commerce</p>
              <p><span className="text-gray-600">Account Number:</span> 62123456789</p>
              <p><span className="text-gray-600">Branch Code:</span> 250655</p>
              <p><span className="text-gray-600">Reference:</span> {orderNumber}</p>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Please use your order number as payment reference. Your order will be processed once we receive payment.
            </p>
          </div>
        ) : (
          <p className="text-gray-600 mb-8">
            Thank you for your order! We&apos;ll send you an email confirmation shortly.
          </p>
        )}

        <div className="space-y-3">
          <Link href="/products">
            <Button size="lg" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
