// Storage utilities for managing developers and tasks with localStorage

export interface Developer {
  id: string;
  name: string;
  monthlyCost: number;
  createdAt: string;
}

export interface Task {
  id: string;
  developerId: string;
  description: string;
  value: number; // Valor agregado (retorno)
  completedAt: string;
  createdAt: string;
}

const DEVELOPERS_KEY = "dev_metrics_developers";
const TASKS_KEY = "dev_metrics_tasks";

// Developers
export function getDevelopers(): Developer[] {
  const data = localStorage.getItem(DEVELOPERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function addDeveloper(name: string, monthlyCost: number): Developer {
  const developers = getDevelopers();
  const newDeveloper: Developer = {
    id: Date.now().toString(),
    name,
    monthlyCost,
    createdAt: new Date().toISOString(),
  };
  developers.push(newDeveloper);
  localStorage.setItem(DEVELOPERS_KEY, JSON.stringify(developers));
  return newDeveloper;
}

export function updateDeveloper(
  id: string,
  name: string,
  monthlyCost: number
): Developer | null {
  const developers = getDevelopers();
  const index = developers.findIndex((d) => d.id === id);
  if (index === -1) return null;
  developers[index] = { ...developers[index], name, monthlyCost };
  localStorage.setItem(DEVELOPERS_KEY, JSON.stringify(developers));
  return developers[index];
}

export function deleteDeveloper(id: string): boolean {
  const developers = getDevelopers();
  const filtered = developers.filter((d) => d.id !== id);
  if (filtered.length === developers.length) return false;
  localStorage.setItem(DEVELOPERS_KEY, JSON.stringify(filtered));
  // Also delete tasks for this developer
  const tasks = getTasks();
  const filteredTasks = tasks.filter((t) => t.developerId !== id);
  localStorage.setItem(TASKS_KEY, JSON.stringify(filteredTasks));
  return true;
}

// Tasks
export function getTasks(): Task[] {
  const data = localStorage.getItem(TASKS_KEY);
  return data ? JSON.parse(data) : [];
}

export function addTask(
  developerId: string,
  description: string,
  value: number
): Task {
  const tasks = getTasks();
  const newTask: Task = {
    id: Date.now().toString(),
    developerId,
    description,
    value,
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  return newTask;
}

export function deleteTask(id: string): boolean {
  const tasks = getTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) return false;
  localStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
  return true;
}

// Metrics
export function getMetrics() {
  const developers = getDevelopers();
  const tasks = getTasks();

  const metrics = developers.map((dev) => {
    const devTasks = tasks.filter((t) => t.developerId === dev.id);
    const totalValue = devTasks.reduce((sum, t) => sum + t.value, 0);
    const taskCount = devTasks.length;
    const roi = dev.monthlyCost > 0 ? (totalValue / dev.monthlyCost) * 100 : 0;

    return {
      developerId: dev.id,
      developerName: dev.name,
      monthlyCost: dev.monthlyCost,
      taskCount,
      totalValue,
      roi: parseFloat(roi.toFixed(2)),
      avgValuePerTask: taskCount > 0 ? parseFloat((totalValue / taskCount).toFixed(2)) : 0,
    };
  });

  return metrics;
}

export function getTotalMetrics() {
  const developers = getDevelopers();
  const tasks = getTasks();

  const totalCost = developers.reduce((sum, d) => sum + d.monthlyCost, 0);
  const totalValue = tasks.reduce((sum, t) => sum + t.value, 0);
  const totalTasks = tasks.length;
  const roi = totalCost > 0 ? (totalValue / totalCost) * 100 : 0;

  return {
    totalDevelopers: developers.length,
    totalCost,
    totalValue,
    totalTasks,
    roi: parseFloat(roi.toFixed(2)),
    avgValuePerTask: totalTasks > 0 ? parseFloat((totalValue / totalTasks).toFixed(2)) : 0,
  };
}
