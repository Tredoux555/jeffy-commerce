import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { WantDetailClient } from './want-detail-client';

interface WantPageProps {
  params: Promise<{ shareCode: string }>;
}

export async function generateMetadata({ params }: WantPageProps): Promise<Metadata> {
  const { shareCode } = await params;
  const supabase = await createClient();

  const { data: want } = await supabase
    .from('wants')
    .select('title, description')
    .eq('share_code', shareCode)
    .single();

  if (!want) {
    return { title: 'Want Not Found' };
  }

  return {
    title: `${want.title} - Help me get this FREE!`,
    description: want.description || `Help me get "${want.title}" FREE on Jeffy! Only need 10 friends to agree.`,
    openGraph: {
      title: `${want.title} - Help me get this FREE!`,
      description: want.description || `Only need 10 friends to agree!`,
    },
  };
}

export default async function WantPage({ params }: WantPageProps) {
  const { shareCode } = await params;
  const supabase = await createClient();

  const { data: want } = await supabase
    .from('wants')
    .select('*')
    .eq('share_code', shareCode)
    .single();

  if (!want) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <WantDetailClient want={want} />
    </div>
  );
}
