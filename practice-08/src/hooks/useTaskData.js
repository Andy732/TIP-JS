import { useState, useEffect, useRef } from 'react';

// Основное задание ПР8. Реализовать эффекты и операции по контракту методички.
// api передаётся зависимостью, поэтому хук проверяется без настоящей сети.
export function useTaskData({ api, filters }) {
  const [snapshot, setSnapshot] = useState({ tasks: [], categories: [], meta: { total: 0 } });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [mutationError, setMutationError] = useState(null);
  const [pending, setPending] = useState(false);
  const [revision, setRevision] = useState(0);
  const mounted = useRef(false);
  const mutation = useRef(null);
  const { q, completed, priority, categoryId } = filters;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      mutation.current?.abort();
      mutation.current = null;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setStatus('loading');
    setError(null);
    async function load() {
      try {
        const result = await api.loadInitialData({ q, completed, priority, categoryId }, { signal: controller.signal });
        if (!active) return;
        setSnapshot(result);
        setStatus('ready');
      } catch (cause) {
        if (!active || controller.signal.aborted) return;
        setError(cause);
        setStatus('error');
      }
    }
    load();
    return () => { active = false; controller.abort(); };
  }, [api, q, completed, priority, categoryId, revision]);

  async function mutate(operation) {
    if (!mounted.current || mutation.current) return false;
    const controller = new AbortController();
    mutation.current = controller;
    setPending(true);
    setMutationError(null);
    try {
      await operation(controller.signal);
      if (!mounted.current || controller.signal.aborted) return false;
      setRevision(previous => previous + 1);
      return true;
    } catch (cause) {
      if (mounted.current && !controller.signal.aborted) setMutationError(cause);
      return false;
    } finally {
      if (mutation.current === controller) mutation.current = null;
      if (mounted.current) setPending(false);
    }
  }
  return {
    snapshot, status, error, mutationError, pending,
    refresh() { if (mounted.current) setRevision(previous => previous + 1); },
    saveTask(id, value) { return mutate(signal => id === null ? api.createTask(value, { signal }) : api.updateTask(id, value, { signal })); },
    toggleTask(task) { return mutate(signal => api.setTaskCompleted(task.id, !task.completed, { signal })); },
    deleteTask(id) { return mutate(signal => api.deleteTask(id, { signal })); },
    resetData() { return mutate(signal => api.resetDemoData({ signal })); },
  };
}
