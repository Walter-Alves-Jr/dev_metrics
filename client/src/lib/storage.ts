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
  
  // Evitar duplicação por nome se já existir recentemente
  const existing = developers.find(d => d.name === name);
  if (existing) return existing;

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
  // Tentar encontrar por ID primeiro
  let index = developers.findIndex((d) => d.id === id);
  
  // Se não encontrar por ID (pode acontecer se os IDs estiverem dessincronizados entre as storages), tentar por nome
  if (index === -1) {
    index = developers.findIndex((d) => d.name === name);
  }

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
  
  // Auto-allocate developer to product if not already allocated
  const developers = getDevelopers();
  const devIndex = developers.findIndex((d) => d.id === developerId);
  if (devIndex !== -1 && !developers[devIndex].productIds.includes(productId)) {
    developers[devIndex].productIds.push(productId);
    localStorage.setItem(DEVELOPERS_KEY, JSON.stringify(developers));
  }
  
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

    // Project metrics
    const projectValue = devProjects.reduce((sum, t) => sum + t.value, 0);
    
    // Maintenance metrics
    const maintenanceHorasReais = devMaintenance.reduce((sum, t) => sum + t.horasReais, 0);
    const maintenanceCostPerHour = maintenanceHorasReais > 0 ? (dev.monthlyCost / maintenanceHorasReais).toFixed(2) : "0";
    const maintenanceAvgTime = devMaintenance.length > 0 ? (maintenanceHorasReais / devMaintenance.length).toFixed(2) : "0";
    const maintenanceTicketsResolved = devMaintenance.filter((t) => t.status === "concluido").length;

    const totalValue = devTasks.reduce((sum, t) => sum + t.value, 0);
    const totalHorasOrcadas = devTasks.reduce((sum, t) => sum + t.horasOrcadas, 0);
    const totalHorasReais = devTasks.reduce((sum, t) => sum + t.horasReais, 0);
    const taskCount = devTasks.length;
    const roi = dev.monthlyCost > 0 ? (projectValue / dev.monthlyCost) * 100 : 0;
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
      maintenanceCostPerHour: parseFloat(maintenanceCostPerHour as string),
      maintenanceAvgTime: parseFloat(maintenanceAvgTime as string),
      maintenanceTicketsResolved,
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
    const projectTasks = productTasks.filter((t) => t.type === "projeto");
    const maintenanceTasks = productTasks.filter((t) => t.type === "sustentacao");
    const productDevs = developers.filter((d) =>
      d.productIds.includes(product.id)
    );

    // Projeto metrics
    const projectValue = projectTasks.reduce((sum, t) => sum + t.value, 0);
    const projectHorasOrcadas = projectTasks.reduce(
      (sum, t) => sum + t.horasOrcadas,
      0
    );
    const projectHorasReais = projectTasks.reduce((sum, t) => sum + t.horasReais, 0);

    // Sustentacao metrics
    const maintenanceHorasReais = maintenanceTasks.reduce((sum, t) => sum + t.horasReais, 0);
    const maintenanceCount = maintenanceTasks.length;
    const maintenanceAvgTime = maintenanceCount > 0 ? (maintenanceHorasReais / maintenanceCount).toFixed(2) : "0";

    const totalValue = projectValue + maintenanceTasks.reduce((sum, t) => sum + t.value, 0);
    const totalHorasOrcadas = projectHorasOrcadas + maintenanceTasks.reduce((sum, t) => sum + t.horasOrcadas, 0);
    const totalHorasReais = projectHorasReais + maintenanceHorasReais;
    const totalCost = productDevs.reduce((sum, d) => sum + d.monthlyCost, 0);
    const taskCount = productTasks.length;

    // ROI only for projects
    const projectROI = totalCost > 0 ? (projectValue / totalCost) * 100 : 0;
    
    // Maintenance cost per hour
    const maintenanceCostPerHour = maintenanceHorasReais > 0 ? (totalCost / maintenanceHorasReais).toFixed(2) : "0";

    return {
      productId: product.id,
      productName: product.name,
      devCount: productDevs.length,
      taskCount,
      projectCount: projectTasks.length,
      maintenanceCount,
      totalValue,
      totalHorasOrcadas,
      totalHorasReais,
      totalCost,
      projectROI: parseFloat(projectROI.toFixed(2)),
      maintenanceCostPerHour: parseFloat(maintenanceCostPerHour as string),
      maintenanceAvgTime: parseFloat(maintenanceAvgTime as string),
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
