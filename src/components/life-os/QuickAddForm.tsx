'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORIES = [
  { value: 'jeffy', label: '🏢 Jeffy', color: 'bg-orange-500' },
  { value: 'family', label: '👨‍👩‍👧 Family', color: 'bg-pink-500' },
  { value: 'career', label: '💼 Career', color: 'bg-blue-500' },
  { value: 'personal', label: '🧘 Personal', color: 'bg-green-500' },
];

const IMPACTS = [
  { value: 'high', label: 'High', color: 'bg-red-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'low', label: 'Low', color: 'bg-gray-400' },
];

interface QuickAddFormProps {
  onSuccess?: () => void;
  goals?: { id: string; name: string; category: string }[];
}

export function QuickAddForm({ onSuccess, goals = [] }: QuickAddFormProps) {
  const [action, setAction] = useState('');
  const [category, setCategory] = useState('jeffy');
  const [showMore, setShowMore] = useState(false);
  const [impact, setImpact] = useState('medium');
  const [goalId, setGoalId] = useState('');
  const [notes, setNotes] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action.trim()) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from('life_logs').insert({
      action: action.trim(),
      category,
      impact,
      goal_id: goalId || null,
      notes: notes.trim() || null,
      time_spent_minutes: timeSpent ? parseInt(timeSpent) : null,
      source: 'quick-add',
    });

    setLoading(false);

    if (error) {
      console.error('Error logging action:', error);
      alert('Failed to log action');
    } else {
      setSuccess(true);
      setAction('');
      setNotes('');
      setTimeSpent('');
      setGoalId('');
      setShowMore(false);
      setTimeout(() => setSuccess(false), 2000);
      onSuccess?.();
    }
  };

  const filteredGoals = goals.filter(g => g.category === category);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-4">
      {/* Action Input */}
      <div className="mb-3">
        <input
          type="text"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="What did you do?"
          className="w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          autoFocus
        />
      </div>

      {/* Category Selector */}
      <div className="flex gap-2 mb-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setCategory(cat.value)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              category === cat.value
                ? `${cat.color} text-white`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* More Details Toggle */}
      <button
        type="button"
        onClick={() => setShowMore(!showMore)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
      >
        {showMore ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {showMore ? 'Less details' : 'More details'}
      </button>

      {/* Expanded Details */}
      {showMore && (
        <div className="space-y-3 mb-3 p-3 bg-gray-50 rounded-lg">
          {/* Impact */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Impact</label>
            <div className="flex gap-2">
              {IMPACTS.map((imp) => (
                <button
                  key={imp.value}
                  type="button"
                  onClick={() => setImpact(imp.value)}
                  className={`flex-1 py-1.5 px-3 rounded text-sm font-medium transition-all ${
                    impact === imp.value
                      ? `${imp.color} text-white`
                      : 'bg-white border text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {imp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goal Link */}
          {filteredGoals.length > 0 && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Link to Goal</label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">No goal</option>
                {filteredGoals.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Time Spent */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Time Spent (minutes)</label>
            <input
              type="number"
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value)}
              placeholder="30"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context..."
              rows={2}
              className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!action.trim() || loading}
        className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
          success
            ? 'bg-green-500 text-white'
            : loading
            ? 'bg-gray-300 text-gray-500'
            : 'bg-orange-500 text-white hover:bg-orange-600'
        }`}
      >
        {success ? (
          '✓ Logged!'
        ) : loading ? (
          'Logging...'
        ) : (
          <>
            <Plus className="h-5 w-5" />
            Log It
          </>
        )}
      </button>
    </form>
  );
}
