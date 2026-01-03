'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Clock, Zap, Target } from 'lucide-react';

interface Log {
  id: string;
  action: string;
  category: string;
  impact: string;
  log_time: string | null;
  time_spent_minutes: number | null;
  goal_id: string | null;
  notes: string | null;
  created_at: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  jeffy: 'bg-orange-100 text-orange-700 border-orange-200',
  family: 'bg-pink-100 text-pink-700 border-pink-200',
  career: 'bg-blue-100 text-blue-700 border-blue-200',
  personal: 'bg-green-100 text-green-700 border-green-200',
  system: 'bg-purple-100 text-purple-700 border-purple-200',
};

const IMPACT_ICONS: Record<string, string> = {
  high: '🔥',
  medium: '⚡',
  low: '·',
};

interface TodayLogsProps {
  refreshTrigger?: number;
}

export function TodayLogs({ refreshTrigger }: TodayLogsProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('life_logs')
      .select('*')
      .eq('log_date', today)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error);
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [refreshTrigger]);

  const formatTime = (createdAt: string) => {
    return new Date(createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-100 rounded"></div>
          <div className="h-10 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Today's Log
          <span className="text-sm font-normal text-gray-500">({logs.length} entries)</span>
        </h3>
      </div>

      {logs.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>No entries yet today.</p>
          <p className="text-sm mt-1">Use the form above to log your first action!</p>
        </div>
      ) : (
        <div className="divide-y">
          {logs.map((log) => (
            <div key={log.id} className="p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                {/* Time */}
                <div className="text-xs text-gray-400 font-mono w-12 pt-0.5">
                  {formatTime(log.created_at)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{IMPACT_ICONS[log.impact]}</span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${CATEGORY_COLORS[log.category]}`}>
                      {log.category}
                    </span>
                  </div>
                  <p className="text-gray-900">{log.action}</p>
                  {log.notes && (
                    <p className="text-sm text-gray-500 mt-1">{log.notes}</p>
                  )}
                  {log.time_spent_minutes && (
                    <p className="text-xs text-gray-400 mt-1">
                      ⏱️ {log.time_spent_minutes} min
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
