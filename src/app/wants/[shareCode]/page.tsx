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
    title: `${creatorName} wishes for: "${want.title}"`,
    description: `${creatorName} added this to the Jeffy Wish List. Want it too? Add it to your wishes — every week Jeffy draws winners at random and grants their wish free.`,
    openGraph: {
      title: `${creatorName}'s Jeffy wish 🎁`,
      description: `Want this too? Add your own wish and enter this week's draw — winners get their wish free.`,
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

