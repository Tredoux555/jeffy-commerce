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
  Plus,
  Rocket,
  ChevronRight,
  ExternalLink,
  MapPin,
  Users,
  Gift,
  Send
} from 'lucide-react';
import Link from 'next/link';

// Import mission control data
import missionControl from '@/data/life-os/mission-control.json';

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

const projectIcons: Record<string, any> = {
  'township-strategy': MapPin,
  'zone-partner-system': Users,
  'wants-system': Gift,
  'influencer-outreach': Send,
};

const statusColors: Record<string, string> = {
  'active': 'bg-green-100 text-green-800',
  'waiting': 'bg-yellow-100 text-yellow-800',
  'planning': 'bg-blue-100 text-blue-800',
  'locked': 'bg-gray-100 text-gray-800',
};

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

  // Get urgent actions
  const urgentActions = missionControl.actionQueue.filter(a => a.status === 'urgent' || a.priority === 1);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="h-8 w-8 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">Mission Control</h1>
        </div>
        <p className="text-gray-500">{today}</p>
      </div>

      {/* Urgent Actions Banner */}
      {urgentActions.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-bold text-red-800">Urgent Actions</h3>
          </div>
          {urgentActions.map(action => (
            <div key={action.id} className="flex items-center gap-2 text-red-700">
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium">{action.task}</span>
              {action.notes && <span className="text-red-500 text-sm">— {action.notes}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Projects Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Rocket className="h-5 w-5 text-orange-500" />
          Active Projects
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {missionControl.projects.map(project => {
            const Icon = projectIcons[project.id] || Target;
            const totalTasks = project.phases?.reduce((sum, p) => sum + (p.tasks?.length || 0), 0) || 0;
            const completedTasks = project.phases?.reduce((sum, p) => sum + (p.tasks?.filter(t => t.done).length || 0), 0) || 0;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            return (
              <Link 
                key={project.id} 
                href={project.dashboardUrl || '#'}
                className="block bg-white rounded-lg border hover:border-orange-300 hover:shadow-md transition-all p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Icon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500">{project.description}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[project.status]}`}>
                    {project.status}
                  </span>
                </div>
                
                {project.phases && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{completedTasks}/{totalTasks} tasks</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {project.targetMarket && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                      {project.targetMarket.economy} economy
                    </span>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {project.targetMarket.stokvelMembers} stokvel members
                    </span>
                  </div>
                )}

                <div className="mt-3 flex items-center text-orange-600 text-sm font-medium">
                  View Dashboard <ExternalLink className="h-4 w-4 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
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

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Quick Add */}
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-500" />
              Quick Log
            </h2>
            <QuickAddForm goals={goals} onSuccess={handleLogSuccess} />
          </div>

          {/* Today's Log */}
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
              Today's Log
            </h2>
            <TodayLogs refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Right Column - Goals */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Goal Progress
          </h2>
          <GoalProgress />
        </div>
      </div>

      {/* Action Queue */}
      <div className="mt-6 bg-white rounded-lg border p-4">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-500" />
          Action Queue
        </h2>
        <div className="space-y-2">
          {missionControl.actionQueue.slice(0, 5).map(action => (
            <div 
              key={action.id} 
              className={`flex items-center justify-between p-3 rounded-lg border ${
                action.status === 'urgent' ? 'bg-red-50 border-red-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${
                  action.status === 'urgent' ? 'bg-red-500' :
                  action.status === 'waiting' ? 'bg-yellow-500' :
                  action.status === 'ongoing' ? 'bg-green-500' :
                  'bg-gray-400'
                }`} />
                <span className={action.status === 'urgent' ? 'font-medium text-red-800' : ''}>
                  {action.task}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {action.deadline && (
                  <span className="text-xs text-gray-500">{action.deadline}</span>
                )}
                <span className={`text-xs px-2 py-1 rounded ${
                  action.category === 'jeffy' ? 'bg-orange-100 text-orange-700' :
                  action.category === 'family' ? 'bg-pink-100 text-pink-700' :
                  action.category === 'career' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {action.category}
                </span>
              </div>
            </div>
          ))}
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