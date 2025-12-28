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
    return { title: 'Want Not Found' };
  }

  const creatorName = want.creator_name || 'Someone';

  return {
    title: `Help ${creatorName} get "${want.title}" FREE!`,
    description: `${creatorName} wants this FREE on Jeffy! Agree to help them get it, then create your own want!`,
    openGraph: {
      title: `Help ${creatorName} get this FREE! 🎁`,
      description: `Agree to help, then get YOUR free stuff too!`,
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

