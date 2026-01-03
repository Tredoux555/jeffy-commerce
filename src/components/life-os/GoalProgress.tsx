'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  category: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string;
  priority: number;
  status: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; bar: string }> = {
  jeffy: { bg: 'bg-orange-50', bar: 'bg-orange-500' },
  family: { bg: 'bg-pink-50', bar: 'bg-pink-500' },
  career: { bg: 'bg-blue-50', bar: 'bg-blue-500' },
  personal: { bg: 'bg-green-50', bar: 'bg-green-500' },
};

export function GoalProgress() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('life_goals')
        .select('*')
        .eq('status', 'active')
        .order('priority')
        .order('deadline');

      if (error) {
        console.error('Error fetching goals:', error);
      } else {
        setGoals(data || []);
      }
      setLoading(false);
    };

    fetchGoals();
  }, []);

  const getProgress = (goal: Goal) => {
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  // Group by category
  const grouped = goals.reduce((acc, goal) => {
    if (!acc[goal.category]) acc[goal.category] = [];
    acc[goal.category].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);

  const categoryOrder = ['jeffy', 'family', 'career', 'personal'];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Target className="h-4 w-4" />
          Active Goals
          <span className="text-sm font-normal text-gray-500">({goals.length})</span>
        </h3>
      </div>

      {goals.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>No active goals yet.</p>
          <p className="text-sm mt-1">Add your first goal to start tracking!</p>
        </div>
      ) : (
        <div className="divide-y">
          {categoryOrder.map((cat) => {
            const catGoals = grouped[cat];
            if (!catGoals || catGoals.length === 0) return null;

            const colors = CATEGORY_COLORS[cat];
            
            return (
              <div key={cat} className={`p-4 ${colors.bg}`}>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                  {cat}
                </h4>
                <div className="space-y-3">
                  {catGoals.map((goal) => {
                    const progress = getProgress(goal);
                    const daysLeft = getDaysRemaining(goal.deadline);
                    const isOverdue = daysLeft < 0;
                    const isUrgent = daysLeft <= 7 && daysLeft >= 0;

                    return (
                      <div key={goal.id} className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 text-sm">{goal.name}</h5>
                            <p className="text-xs text-gray-500">
                              {goal.current_value} / {goal.target_value} {goal.unit}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-900">
                              {Math.round(progress)}%
                            </span>
                            <p className={`text-xs ${isOverdue ? 'text-red-500' : isUrgent ? 'text-orange-500' : 'text-gray-400'}`}>
                              {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                            </p>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${colors.bar}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
