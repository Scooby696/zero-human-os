/**
 * Async Job Queue - Manages long-running tasks to prevent timeouts
 */

export function createAsyncJobQueue() {
  const jobs = new Map();
  let jobIdCounter = 0;

  const enqueue = (task, priority = 'normal') => {
    const jobId = `job_${jobIdCounter++}`;
    const job = {
      id: jobId,
      task,
      priority,
      status: 'queued',
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null,
      result: null,
      error: null,
    };

    jobs.set(jobId, job);
    executeIfReady(jobId);

    return jobId;
  };

  const executeIfReady = async (jobId) => {
    const job = jobs.get(jobId);
    if (!job || job.status !== 'queued') return;

    job.status = 'running';
    job.startedAt = Date.now();

    try {
      job.result = await job.task();
      job.status = 'completed';
    } catch (error) {
      job.error = error.message;
      job.status = 'failed';
    } finally {
      job.completedAt = Date.now();
    }
  };

  const getJob = (jobId) => jobs.get(jobId);

  const getStatus = (jobId) => {
    const job = jobs.get(jobId);
    if (!job) return null;
    return {
      id: job.id,
      status: job.status,
      progress: job.status === 'running' ? 50 : job.status === 'completed' ? 100 : 0,
      duration: job.completedAt ? job.completedAt - job.startedAt : Date.now() - job.startedAt,
      result: job.result,
      error: job.error,
    };
  };

  const getAll = () => Array.from(jobs.values());

  return { enqueue, getJob, getStatus, getAll };
}

export const jobQueue = createAsyncJobQueue();