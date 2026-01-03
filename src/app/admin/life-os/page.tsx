'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { QuickAddForm } from '@/components/life-os/QuickAddForm';
import { TodayLogs } from '@/components/life-os/TodayLogs';
import { GoalProgress } from '@/components/life-os/GoalProgress';
import { 
  Brain, 
  Target, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Calendar,
  FileText,
  Plus
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  logs_today: number;
  pending_tasks: number;
  due_today: number;
  overdue: number;
  active_goals: number;
}

interface Goal {
  id: string;
  name: string;
  category: string;
}

export default function LifeOSDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch stats from view
      const { data: statsData } = await supabase
        .from('v_today')
        .select('*')
        .single();

      // Fetch goals for quick-add linking
      const { data: goalsData } = await supabase
        .from('life_goals')
        .select('id, name, category')
        .eq('status', 'active');

      setStats(statsData);
      setGoals(goalsData || []);
      setLoading(false);
    };

    fetchData();
  }, [refreshTrigger]);

  const handleLogSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="h-8 w-8 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">Life OS</h1>
        </div>
        <p className="text-gray-500">{today}</p>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <StatCard
            icon={<FileText className="h-5 w-5" />}
            label="Logged Today"
            value={stats.logs_today}
            color="blue"
          />
          <StatCard
            icon={<Target className="h-5 w-5" />}
            label="Active Goals"
            value={stats.active_goals}
            color="orange"
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="Pending Tasks"
            value={stats.pending_tasks}
            color="purple"
          />
          <StatCard
            icon={<Calendar className="h-5 w-5" />}
            label="Due Today"
            value={stats.due_today}
            color="green"
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Overdue"
            value={stats.overdue}
            color={stats.overdue > 0 ? 'red' : 'gray'}
          />
        </div>
      )}

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Quick Add */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Quick Add</h2>
            <QuickAddForm onSuccess={handleLogSuccess} goals={goals} />
          </div>

          {/* Today's Log */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Activity</h2>
            <TodayLogs refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Goals */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase">Goals</h2>
              <Link 
                href="/admin/life-os/goals" 
                className="text-sm text-orange-500 hover:text-orange-600"
              >
                Manage →
              </Link>
            </div>
            <GoalProgress />
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <QuickActionButton
                href="/admin/life-os/goals/new"
                icon={<Target className="h-5 w-5" />}
                label="Add Goal"
              />
              <QuickActionButton
                href="/admin/life-os/tasks"
                icon={<CheckCircle2 className="h-5 w-5" />}
                label="View Tasks"
              />
              <QuickActionButton
                href="/admin/life-os/knowledge"
                icon={<Brain className="h-5 w-5" />}
                label="Research"
              />
              <QuickActionButton
                href="/admin/life-os/export"
                icon={<FileText className="h-5 w-5" />}
                label="Export Context"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-50 text-gray-400',
  };

  return (
    <div className={`rounded-lg p-3 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-xs opacity-75">{label}</p>
    </div>
  );
}

function QuickActionButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 p-3 bg-white rounded-lg border hover:border-orange-300 hover:bg-orange-50 transition-colors"
    >
      <span className="text-gray-500">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </Link>
  );
}
