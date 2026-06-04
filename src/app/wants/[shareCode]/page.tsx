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
    .select('title, description, creator_name')
    .eq('share_code', shareCode)
    .single();

  if (!want) {
    return { title: 'Wish Not Found' };
  }

  const creatorName = want.creator_name || 'Someone';

  return {
    title: `Back ${creatorName}'s wish: "${want.title}"`,
    description: `${creatorName} added this to the Jeffy Wish List. Back it to help prove demand — popular wishes get sourced, and one is granted free every month.`,
    openGraph: {
      title: `Back ${creatorName}'s Jeffy wish 🎁`,
      description: `Tap to back it, then add your own wish and enter the monthly draw.`,
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

  return <WantDetailClient want={want} />;
}

