import WantsDisplay from '@/components/wants-display';
import Link from 'next/link';

export default function WantsPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-[#ff6b35] mb-4">🔥 Jeffy Wants</h1>
          <p className="text-lg text-gray-400 mb-6">
            Demand-driven shopping. When enough people want it, we source it and ship to everyone!
          </p>
          <Link href="/wants/create">
            <button className="bg-[#ff6b35] text-white px-8 py-4 rounded-lg font-bold hover:bg-orange-600 transition text-lg">
              ➕ Create a Want
            </button>
          </Link>
        </div>

        {/* Wants Display */}
        <WantsDisplay />
      </div>
    </div>
  );
}
