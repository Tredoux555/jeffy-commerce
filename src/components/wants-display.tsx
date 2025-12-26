'use client';

import { useEffect, useState } from 'react';
import { getTrendingWants, addSurveyVote } from '@/lib/wants-service';
import Link from 'next/link';
import { Check } from 'lucide-react';

interface Want {
  id: string;
  title: string;
  share_code: string;
  threshold: number;
  current_agrees: number;
  survey_votes: number;
  created_at: string;
  creator_name: string;
}

export default function WantsDisplay() {
  const [wants, setWants] = useState<Want[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [voting, setVoting] = useState<string | null>(null);

  useEffect(() => {
    loadWants();
    // Load voted IDs from localStorage
    const stored = localStorage.getItem('jeffy_survey_votes');
    if (stored) {
      setVotedIds(new Set(JSON.parse(stored)));
    }
  }, []);

  const loadWants = async () => {
    const res = await getTrendingWants(12);
    if (res.success) {
      setWants(res.wants);
    }
    setLoading(false);
  };

  const handleVote = async (wantId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (votedIds.has(wantId) || voting) return;
    
    setVoting(wantId);
    const res = await addSurveyVote(wantId);
    
    if (res.success) {
      // Update local state
      const newVotedIds = new Set(votedIds);
      newVotedIds.add(wantId);
      setVotedIds(newVotedIds);
      localStorage.setItem('jeffy_survey_votes', JSON.stringify([...newVotedIds]));
      
      // Update survey_votes count in UI
      setWants(prev => prev.map(w => 
        w.id === wantId ? { ...w, survey_votes: res.newCount } : w
      ));
    }
    setVoting(null);
  };

  if (loading) {
    return <div className="text-center text-gray-400 py-12">Loading wants...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#ff6b35] mb-2">🔥 What Do People Want?</h2>
        <p className="text-gray-400">Click to vote - help us understand what products to source!</p>
      </div>

      {/* Wants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wants.map(want => {
          const hasVoted = votedIds.has(want.id);
          const isVoting = voting === want.id;
          
          return (
            <div key={want.id} className="bg-white rounded-lg p-6 hover:shadow-xl transition h-full">
              {/* Title & Count */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#0f172a]">{want.title}</span>
                  <span className="text-xs bg-[#ff6b35] text-white px-2 py-1 rounded-full font-bold">
                    {want.survey_votes || 0} votes
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-[#ff6b35] h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(((want.survey_votes || 0) / 10) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p className="text-xs text-gray-500">
                  Suggested by {want.creator_name} • {new Date(want.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Vote Button */}
              <div className="pt-4 border-t">
                <button 
                  onClick={(e) => handleVote(want.id, e)}
                  disabled={hasVoted || isVoting}
                  className={`w-full py-3 rounded-lg font-bold transition text-sm flex items-center justify-center gap-2 ${
                    hasVoted 
                      ? 'bg-green-500 text-white cursor-default' 
                      : 'bg-[#ff6b35] text-white hover:bg-orange-600'
                  }`}
                >
                  {isVoting ? (
                    '⏳ Voting...'
                  ) : hasVoted ? (
                    <>
                      <Check className="h-5 w-5" />
                      Voted!
                    </>
                  ) : (
                    '👍 I Want This!'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {wants.length === 0 && (
        <div className="text-center py-12 bg-white/5 rounded-lg border border-gray-600 p-8">
          <p className="text-gray-400 mb-4">No survey items yet.</p>
          <Link href="/wants/create">
            <button className="bg-[#ff6b35] text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition">
              Suggest a Product
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
