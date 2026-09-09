import { useCallback, useEffect, useState } from "react";

export type Priority = "High" | "Medium" | "Low";
export type Status = "To Do" | "In Progress" | "Done";

export type Task = {
  id: string;
  title: string;
  priority: Priority;
  deadline: string;
  status: Status;
};

const TASKS_KEY = "flowassist.tasks";
const ACTIONS_KEY = "flowassist.actionItems";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(read<T>(key, fallback));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      write(key, next);
    },
    [key],
  );

  return { value, update, hydrated };
}

export function useTasks() {
  const { value, update, hydrated } = useStored<Task[]>(TASKS_KEY, []);
  return { tasks: value, setTasks: update, hydrated };
}

export function useSavedActionItems() {
  const { value, update, hydrated } = useStored<string[]>(ACTIONS_KEY, []);
  return { actionItems: value, setActionItems: update, hydrated };
}

export function newId() {
  return Math.random().toString(36).slice(2, 10);
}
