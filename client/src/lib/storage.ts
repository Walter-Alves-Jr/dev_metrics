// Storage utilities for managing developers, products, and tasks with localStorage

export interface Product {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Developer {
  id: string;
  name: string;
  monthlyCost: number;
  productIds: string[]; // Produtos aos quais o dev está alocado
  createdAt: string;
}

export type TaskType = "projeto" | "sustentacao";
export type TaskStatus = "planejado" | "em_progresso" | "concluido" | "atrasado";

export interface Task {
  id: string;
  developerId: string;
  productId: string;
  description: string;
  type: TaskType; // "projeto" ou "sustentacao"
  status: TaskStatus;
  value: number; // Valor agregado (retorno)
  horasOrcadas: number; // Horas planejadas
  horasReais: number; // Horas realmente gastas
  dataInicio: string; // ISO date
  dataFim: string; // ISO date
  dataFimPlanejada: string; // ISO date (para detectar atrasos)
  completedAt?: string;
  createdAt: string;
}

const PRODUCTS_KEY = "dev_metrics_products";
const DEVELOPERS_KEY = "dev_metrics_developers";
const TASKS_KEY = "dev_metrics_tasks";

// ===== PRODUCTS =====
export function getProducts(): Product[] {
  try {
    const data = localStorage.getItem(PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading products from storage:", error);
    return [];
  }
}

export function addProduct(name: string, description?: string): Product {
  const products = getProducts();
  const newProduct: Product = {
    id: Date.now().toString(),
    name,
    description,
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  return newProduct;
}

export function updateProduct(
  id: string,
  name: string,
  description?: string
): Product | null {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  products[index] = { ...products[index], name, description };
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  return products[index];
}

export function deleteProduct(id: string): boolean {
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
  // Remove product from developers
  const developers = getDevelopers();
  const updatedDevs = developers.map((d) => ({
    ...d,
    productIds: d.productIds.filter((pId) => pId !== id),
  }));
  localStorage.setItem(DEVELOPERS_KEY, JSON.stringify(updatedDevs));
  // Delete tasks for this product
  const tasks = getTasks();
  const filteredTasks = tasks.filter((t) => t.productId !== id);
  localStorage.setItem(TASKS_KEY, JSON.stringify(filteredTasks));
  return true;
}

// ===== DEVELOPERS =====
export function getDevelopers(): Developer[] {
  try {
    const data = localStorage.getItem(DEVELOPERS_KEY);
    if (!data) return [];
    const developers = JSON.parse(data);
    // Normalize productIds to ensure it's always an array
    return developers.map((d: any) => ({
      ...d,
      productIds: Array.isArray(d.productIds) ? d.productIds : [],
    }));
  } catch (error) {
    console.error("Error reading developers from storage:", error);
    return [];
  }
}

export function addDeveloper(
  name: string,
  monthlyCost: number,
  productIds: string[] = []
): Developer {
  const developers = getDevelopers();
  const newDeveloper: Developer = {
    id: Date.now().toString(),
    name,
    monthlyCost,
    productIds,
    createdAt: new Date().toISOString(),
  };
  developers.push(newDeveloper);
  localStorage.setItem(DEVELOPERS_KEY, JSON.stringify(developers));
  return newDeveloper;
}

export function updateDeveloper(
  id: string,
  name: string,
  monthlyCost: number,
  productIds?: string[]
): Developer | null {
  const developers = getDevelopers();
  const index = developers.findIndex((d) => d.id === id);
  if (index === -1) return null;
  developers[index] = {
    ...developers[index],
    name,
    monthlyCost,
    ...(productIds && { productIds }),
  };
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

// ===== TASKS =====
export function getTasks(): Task[] {
  try {
    const data = localStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading tasks from storage:", error);
    return [];
  }
}

export function addTask(
  developerId: string,
  productId: string,
  description: string,
  type: TaskType,
  value: number,
  horasOrcadas: number,
  dataInicio: string,
  dataFimPlanejada: string
): Task {
  const tasks = getTasks();
  const newTask: Task = {
    id: Date.now().toString(),
    developerId,
    productId,
    description,
    type,
    status: "planejado",
    value,
    horasOrcadas,
    horasReais: 0,
    dataInicio,
    dataFim: "",
    dataFimPlanejada,
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  return newTask;
}

export function updateTask(
  id: string,
  updates: Partial<Task>
): Task | null {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;
  tasks[index] = { ...tasks[index], ...updates };
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  return tasks[index];
}

export function updateTaskStatus(
  id: string,
  status: TaskStatus,
  horasReais?: number,
  dataFim?: string
): Task | null {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const updates: Partial<Task> = { status };
  if (horasReais !== undefined) updates.horasReais = horasReais;
  if (dataFim !== undefined) updates.dataFim = dataFim;

  tasks[index] = { ...tasks[index], ...updates };
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  return tasks[index];
}

export function deleteTask(id: string): boolean {
  const tasks = getTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) return false;
  localStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
  return true;
}

// ===== METRICS =====
export function getTasksAtrasadas(): Task[] {
  const tasks = getTasks();
  const hoje = new Date();
  return tasks.filter((t) => {
    if (t.status === "concluido") return false;
    const dataFimPlanejada = new Date(t.dataFimPlanejada);
    return dataFimPlanejada < hoje;
  });
}

export function getMetricas() {
  const developers = getDevelopers();
  const tasks = getTasks();
  const products = getProducts();

  const metricas = developers.map((dev) => {
    const devTasks = tasks.filter((t) => t.developerId === dev.id);
    const devProjects = devTasks.filter((t) => t.type === "projeto");
    const devMaintenance = devTasks.filter((t) => t.type === "sustentacao");

    const totalValue = devTasks.reduce((sum, t) => sum + t.value, 0);
    const totalHorasOrcadas = devTasks.reduce((sum, t) => sum + t.horasOrcadas, 0);
    const totalHorasReais = devTasks.reduce((sum, t) => sum + t.horasReais, 0);
    const taskCount = devTasks.length;
    const roi = dev.monthlyCost > 0 ? (totalValue / dev.monthlyCost) * 100 : 0;
    const produtividade =
      totalHorasReais > 0 ? (totalValue / totalHorasReais).toFixed(2) : "0";
    const eficiencia =
      totalHorasOrcadas > 0
        ? ((totalHorasReais / totalHorasOrcadas) * 100).toFixed(2)
        : "0";

    return {
      developerId: dev.id,
      developerName: dev.name,
      monthlyCost: dev.monthlyCost,
      productIds: dev.productIds,
      taskCount,
      projectCount: devProjects.length,
      maintenanceCount: devMaintenance.length,
      totalValue,
      totalHorasOrcadas,
      totalHorasReais,
      roi: parseFloat(roi.toFixed(2)),
      produtividade: parseFloat(produtividade as string),
      eficiencia: parseFloat(eficiencia as string),
      avgValuePerTask:
        taskCount > 0 ? parseFloat((totalValue / taskCount).toFixed(2)) : 0,
    };
  });

  return metricas;
}

export function getMetricasPorProduto() {
  const products = getProducts();
  const tasks = getTasks();
  const developers = getDevelopers();

  return products.map((product) => {
    const productTasks = tasks.filter((t) => t.productId === product.id);
    const productDevs = developers.filter((d) =>
      d.productIds.includes(product.id)
    );

    const totalValue = productTasks.reduce((sum, t) => sum + t.value, 0);
    const totalHorasOrcadas = productTasks.reduce(
      (sum, t) => sum + t.horasOrcadas,
      0
    );
    const totalHorasReais = productTasks.reduce((sum, t) => sum + t.horasReais, 0);
    const totalCost = productDevs.reduce((sum, d) => sum + d.monthlyCost, 0);
    const taskCount = productTasks.length;
    const roi = totalCost > 0 ? (totalValue / totalCost) * 100 : 0;

    return {
      productId: product.id,
      productName: product.name,
      devCount: productDevs.length,
      taskCount,
      totalValue,
      totalHorasOrcadas,
      totalHorasReais,
      totalCost,
      roi: parseFloat(roi.toFixed(2)),
      avgValuePerTask:
        taskCount > 0 ? parseFloat((totalValue / taskCount).toFixed(2)) : 0,
    };
  });
}

export function getTotalMetricas() {
  const developers = getDevelopers();
  const tasks = getTasks();

  const totalCost = developers.reduce((sum, d) => sum + d.monthlyCost, 0);
  const totalValue = tasks.reduce((sum, t) => sum + t.value, 0);
  const totalTasks = tasks.length;
  const totalHorasOrcadas = tasks.reduce((sum, t) => sum + t.horasOrcadas, 0);
  const totalHorasReais = tasks.reduce((sum, t) => sum + t.horasReais, 0);
  const roi = totalCost > 0 ? (totalValue / totalCost) * 100 : 0;
  const tasksAtrasadas = getTasksAtrasadas().length;

  return {
    totalDevelopers: developers.length,
    totalProducts: getProducts().length,
    totalCost,
    totalValue,
    totalTasks,
    totalHorasOrcadas,
    totalHorasReais,
    roi: parseFloat(roi.toFixed(2)),
    tasksAtrasadas,
    avgValuePerTask:
      totalTasks > 0 ? parseFloat((totalValue / totalTasks).toFixed(2)) : 0,
  };
}
