'use client';

/**
 * useTranslationJobs Hook
 * 
 * Manages translation job state with automatic polling for updates.
 * Stops polling once all jobs are complete or failed.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface TranslationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  originalUrl: string;
  originalFilename?: string;
  translatedUrl?: string;
  detectedText?: Array<{ original: string; translated: string }>;
  processingTimeMs?: number;
  error?: string;
  createdAt?: string;
}

interface UseTranslationJobsOptions {
  pollIntervalMs?: number;
  onJobComplete?: (job: TranslationJob) => void;
  onAllComplete?: (jobs: TranslationJob[]) => void;
  onError?: (error: string) => void;
}

export function useTranslationJobs(options: UseTranslationJobsOptions = {}) {
  const {
    pollIntervalMs = 2000,
    onJobComplete,
    onAllComplete,
    onError,
  } = options;

  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousJobsRef = useRef<Map<string, TranslationJob>>(new Map());

  // Add new jobs to track
  const addJobs = useCallback((newJobs: Array<{ id: string; filename: string; status: string }>) => {
    const jobsToAdd: TranslationJob[] = newJobs.map(j => ({
      id: j.id,
      status: j.status as TranslationJob['status'],
      progress: 0,
      originalUrl: '', // Will be filled by polling
      originalFilename: j.filename,
    }));

    setJobs(prev => [...prev, ...jobsToAdd]);
    setIsPolling(true);
  }, []);

  // Remove a job
  const removeJob = useCallback((jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
  }, []);

  // Clear all jobs
  const clearJobs = useCallback(() => {
    setJobs([]);
    setIsPolling(false);
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
    }
  }, []);

  // Poll for updates
  const pollForUpdates = useCallback(async () => {
    const pendingJobIds = jobs
      .filter(j => j.status === 'pending' || j.status === 'processing')
      .map(j => j.id);

    if (pendingJobIds.length === 0) {
      setIsPolling(false);
      // Check if all jobs are now complete
      const allComplete = jobs.every(j => j.status === 'completed' || j.status === 'failed');
      if (allComplete && jobs.length > 0) {
        onAllComplete?.(jobs);
      }
      return;
    }

    try {
      const response = await fetch('/api/translate-images/status-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobIds: pendingJobIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch job status');
      }

      const data = await response.json();
      
      // Update jobs with new data
      setJobs(prev => {
        const updatedJobs = prev.map(job => {
          const update = data.jobs.find((j: TranslationJob) => j.id === job.id);
          if (update) {
            // Check if job just completed
            const previousJob = previousJobsRef.current.get(job.id);
            if (previousJob?.status !== 'completed' && update.status === 'completed') {
              onJobComplete?.(update);
            }
            previousJobsRef.current.set(job.id, update);
            return { ...job, ...update };
          }
          return job;
        });
        return updatedJobs;
      });

      // Continue polling if there are still pending jobs
      if (data.summary && !data.summary.allComplete) {
        pollTimeoutRef.current = setTimeout(pollForUpdates, pollIntervalMs);
      } else {
        setIsPolling(false);
        if (data.summary?.allComplete) {
          // Fetch final state and trigger callback
          setJobs(prev => {
            onAllComplete?.(prev);
            return prev;
          });
        }
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Polling failed');
      // Continue polling despite error
      pollTimeoutRef.current = setTimeout(pollForUpdates, pollIntervalMs * 2);
    }
  }, [jobs, pollIntervalMs, onJobComplete, onAllComplete, onError]);

  // Start polling when jobs are added
  useEffect(() => {
    if (isPolling) {
      pollForUpdates();
    }
    
    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [isPolling]); // Only trigger on isPolling change

  // Re-poll when jobs change and we're supposed to be polling
  useEffect(() => {
    if (isPolling && jobs.some(j => j.status === 'pending' || j.status === 'processing')) {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
      pollTimeoutRef.current = setTimeout(pollForUpdates, pollIntervalMs);
    }
  }, [jobs.length]);

  // Stats
  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'pending').length,
    processing: jobs.filter(j => j.status === 'processing').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    isComplete: jobs.length > 0 && jobs.every(j => j.status === 'completed' || j.status === 'failed'),
  };

  return {
    jobs,
    stats,
    isPolling,
    addJobs,
    removeJob,
    clearJobs,
  };
}

