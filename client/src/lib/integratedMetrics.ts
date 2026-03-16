// Tipos integrados: DORA + Gestão de Devs e Projetos

export type MonthlyDevCost = {
  month: string; // "2026-03" format
  onCallHours: number; // Horas de sobreaviso
  overtimeHours: number; // Horas extras
};

export type Developer = {
  id: string;
  name: string;
  baseSalary: number; // R$ salário base
  monthlyCosts: MonthlyDevCost[]; // Histórico mensal
  products: string[]; // IDs de produtos
};

// Função para calcular valor da hora de sobreaviso
export function calculateOnCallHourValue(baseSalary: number): number {
  return (baseSalary / 200) / 3;
}

// Função para calcular valor da hora extra
export function calculateOvertimeHourValue(baseSalary: number): number {
  return (baseSalary / 200) * 1.75;
}

// Função para calcular custo real do dev com encargos CLT (mês atual)
export function calculateRealDevCost(dev: Developer, month?: string): number {
  const baseCost = dev.baseSalary;
  
  // Se mês não especificado, usa mês atual
  const targetMonth = month || new Date().toISOString().slice(0, 7);
  const monthlyCost = dev.monthlyCosts.find((mc) => mc.month === targetMonth);
  
  const onCallCost = monthlyCost
    ? calculateOnCallHourValue(dev.baseSalary) * monthlyCost.onCallHours
    : 0;
  
  const overtimeCost = monthlyCost
    ? calculateOvertimeHourValue(dev.baseSalary) * monthlyCost.overtimeHours
    : 0;
  
  const totalCost = baseCost + onCallCost + overtimeCost;
  return totalCost * 1.7; // Encargos CLT (1.7x)
}

// Função para calcular custo por hora do desenvolvedor
export function calculateDevCostPerHour(dev: Developer, month?: string): number {
  const monthlyCost = calculateRealDevCost(dev, month);
  // Considerando 200 horas de trabalho por mês
  return monthlyCost / 200;
}

// Função para calcular ROI de um projeto
export function calculateProjectROI(projectValue: number, hoursSpent: number, costPerHour: number): number {
  const totalCost = hoursSpent * costPerHour;
  const profit = projectValue - totalCost;
  if (totalCost === 0) return 0;
  return (profit / totalCost) * 100;
}

// Função para calcular impacto financeiro de um bug
export function calculateBugFinancialImpact(hoursSpent: number, costPerHour: number): number {
  return hoursSpent * costPerHour;
}

export type Product = {
  id: string;
  name: string;
};

export type Project = {
  id: string;
  title: string;
  developerId: string;
  productId: string;
  type: "project" | "sustentation";
  status: "backlog" | "dev" | "review" | "deploy" | "done";
  hoursPlanned: number;
  hoursActual?: number;
  valuePerHour: number; // R$ por hora
  createdAt: Date;
  devStartedAt?: Date;
  reviewStartedAt?: Date;
  deployedAt?: Date;
  completedAt?: Date;
  reopened?: number;
};

export type Bug = {
  id: string;
  title: string;
  developerId: string;
  productId: string;
  foundAt: Date;
  fixedAt?: Date;
  environment: "production" | "staging" | "development";
  severity: "critical" | "high" | "medium" | "low";
  hoursSpent?: number;
};

export type Deployment = {
  id: string;
  date: Date;
  success: boolean;
  rollback?: boolean;
  environment: "staging" | "production";
  projectId?: string;
};

export type Incident = {
  id: string;
  title: string;
  openedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  severity: "critical" | "high" | "medium" | "low";
  recurring?: boolean;
  slaTargetHours: number;
};

// Storage functions

export function saveDevelopers(developers: Developer[]): void {
  localStorage.setItem("dev_metrics_developers", JSON.stringify(developers));
}

export function loadDevelopers(): Developer[] {
  const data = localStorage.getItem("dev_metrics_developers");
  if (!data) return [];
  
  const developers = JSON.parse(data);
  // Normalizar baseSalary para número
  return developers.map((d: any) => ({
    ...d,
    baseSalary: Number(d.baseSalary ?? 0) || 0,
    monthlyCosts: Array.isArray(d.monthlyCosts) ? d.monthlyCosts.map((mc: any) => ({
      month: mc.month || new Date().toISOString().slice(0, 7),
      onCallHours: Number(mc.onCallHours ?? 0) || 0,
      overtimeHours: Number(mc.overtimeHours ?? 0) || 0,
    })) : [],
    products: Array.isArray(d.products) ? d.products : [],
  }));
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem("dev_metrics_products", JSON.stringify(products));
}

export function loadProducts(): Product[] {
  const data = localStorage.getItem("dev_metrics_products");
  return data ? JSON.parse(data) : [];
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem("dev_metrics_projects", JSON.stringify(projects));
}

export function loadProjects(): Project[] {
  const data = localStorage.getItem("dev_metrics_projects");
  if (!data) return [];
  
  const projects = JSON.parse(data);
  // Converter strings de data para Date objects e normalizar números
  return projects.map((p: any) => ({
    ...p,
    hoursPlanned: Number(p.hoursPlanned ?? 0) || 0,
    hoursActual: p.hoursActual ? Number(p.hoursActual) || 0 : undefined,
    valuePerHour: Number(p.valuePerHour ?? 0) || 0,
    createdAt: new Date(p.createdAt),
    devStartedAt: p.devStartedAt ? new Date(p.devStartedAt) : undefined,
    reviewStartedAt: p.reviewStartedAt ? new Date(p.reviewStartedAt) : undefined,
    deployedAt: p.deployedAt ? new Date(p.deployedAt) : undefined,
    completedAt: p.completedAt ? new Date(p.completedAt) : undefined,
  }));
}

export function saveBugs(bugs: Bug[]): void {
  localStorage.setItem("dev_metrics_bugs", JSON.stringify(bugs));
}

export function loadBugs(): Bug[] {
  const data = localStorage.getItem("dev_metrics_bugs");
  if (!data) return [];
  
  const bugs = JSON.parse(data);
  return bugs.map((b: any) => {
    // Normalizar datas com fallback seguro
    let foundAt: Date;
    try {
      foundAt = new Date(b.foundAt || new Date());
      // Validar que é uma data válida
      if (!Number.isFinite(foundAt.getTime())) {
        foundAt = new Date();
      }
    } catch (e) {
      foundAt = new Date();
    }
    
    let fixedAt: Date | undefined;
    if (b.fixedAt) {
      try {
        fixedAt = new Date(b.fixedAt);
        if (!Number.isFinite(fixedAt.getTime())) {
          fixedAt = undefined;
        }
      } catch (e) {
        fixedAt = undefined;
      }
    }
    
    return {
      ...b,
      foundAt,
      fixedAt,
    };
  });
}

export function saveDeployments(deployments: Deployment[]): void {
  localStorage.setItem("dev_metrics_deployments", JSON.stringify(deployments));
}

export function loadDeployments(): Deployment[] {
  const data = localStorage.getItem("dev_metrics_deployments");
  if (!data) return [];
  
  const deployments = JSON.parse(data);
  return deployments.map((d: any) => ({
    ...d,
    date: new Date(d.date),
  }));
}

export function saveIncidents(incidents: Incident[]): void {
  localStorage.setItem("dev_metrics_incidents", JSON.stringify(incidents));
}

export function loadIncidents(): Incident[] {
  const data = localStorage.getItem("dev_metrics_incidents");
  if (!data) return [];
  
  const incidents = JSON.parse(data);
  return incidents.map((i: any) => ({
    ...i,
    openedAt: new Date(i.openedAt),
    acknowledgedAt: i.acknowledgedAt ? new Date(i.acknowledgedAt) : undefined,
    resolvedAt: i.resolvedAt ? new Date(i.resolvedAt) : undefined,
  }));
}

// Helper functions

export function addDeveloper(name: string, baseSalary: number): Developer {
  const developers = loadDevelopers();
  const newDev: Developer = {
    id: Date.now().toString(),
    name,
    baseSalary,
    monthlyCosts: [],
    products: [],
  };
  developers.push(newDev);
  saveDevelopers(developers);
  return newDev;
}

export function updateDeveloper(devId: string, baseSalary?: number): void {
  const developers = loadDevelopers();
  const dev = developers.find((d) => d.id === devId);
  if (dev && baseSalary !== undefined) {
    dev.baseSalary = baseSalary;
    saveDevelopers(developers);
  }
}

export function updateMonthlyCost(
  devId: string,
  month: string,
  onCallHours: number,
  overtimeHours: number
): void {
  const developers = loadDevelopers();
  const dev = developers.find((d) => d.id === devId);
  if (dev) {
    const existingMonth = dev.monthlyCosts.find((mc) => mc.month === month);
    if (existingMonth) {
      existingMonth.onCallHours = onCallHours;
      existingMonth.overtimeHours = overtimeHours;
    } else {
      dev.monthlyCosts.push({ month, onCallHours, overtimeHours });
    }
    saveDevelopers(developers);
  }
}

export function addProduct(name: string): Product {
  const products = loadProducts();
  const newProduct: Product = {
    id: Date.now().toString(),
    name,
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

export function addProject(
  title: string,
  developerId: string,
  productId: string,
  type: "project" | "sustentation",
  hoursPlanned: number,
  valuePerHour: number
): Project {
  const projects = loadProjects();
  const newProject: Project = {
    id: Date.now().toString(),
    title,
    developerId,
    productId,
    type,
    status: "backlog",
    hoursPlanned,
    valuePerHour,
    createdAt: new Date(),
  };
  projects.push(newProject);
  saveProjects(projects);
  return newProject;
}

export function updateProjectStatus(
  projectId: string,
  status: Project["status"],
  timestamp?: Date
): void {
  const projects = loadProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) return;

  project.status = status;
  const now = timestamp || new Date();

  switch (status) {
    case "dev":
      if (!project.devStartedAt) project.devStartedAt = now;
      break;
    case "review":
      if (!project.reviewStartedAt) project.reviewStartedAt = now;
      break;
    case "deploy":
      if (!project.deployedAt) project.deployedAt = now;
      break;
    case "done":
      if (!project.completedAt) project.completedAt = now;
      break;
  }

  saveProjects(projects);
}

export function updateProjectHours(
  projectId: string,
  hoursActual: number
): void {
  const projects = loadProjects();
  const project = projects.find((p) => p.id === projectId);
  if (project) {
    project.hoursActual = hoursActual;
    saveProjects(projects);
  }
}

export function addBug(
  title: string,
  developerId: string,
  productId: string,
  environment: "production" | "staging" | "development",
  severity: "critical" | "high" | "medium" | "low"
): Bug {
  const bugs = loadBugs();
  const newBug: Bug = {
    id: Date.now().toString(),
    title,
    developerId,
    productId,
    foundAt: new Date(),
    environment,
    severity,
  };
  bugs.push(newBug);
  saveBugs(bugs);
  return newBug;
}

export function fixBug(bugId: string, hoursSpent?: number): void {
  const bugs = loadBugs();
  const bug = bugs.find((b) => b.id === bugId);
  if (bug) {
    bug.fixedAt = new Date();
    if (hoursSpent) bug.hoursSpent = hoursSpent;
    saveBugs(bugs);
  }
}

export function addDeployment(
  success: boolean,
  environment: "staging" | "production",
  projectId?: string,
  rollback?: boolean
): Deployment {
  const deployments = loadDeployments();
  const newDeployment: Deployment = {
    id: Date.now().toString(),
    date: new Date(),
    success,
    rollback,
    environment,
    projectId,
  };
  deployments.push(newDeployment);
  saveDeployments(deployments);
  return newDeployment;
}

export function addIncident(
  title: string,
  severity: "critical" | "high" | "medium" | "low",
  slaTargetHours: number
): Incident {
  const incidents = loadIncidents();
  const newIncident: Incident = {
    id: Date.now().toString(),
    title,
    openedAt: new Date(),
    severity,
    slaTargetHours,
  };
  incidents.push(newIncident);
  saveIncidents(incidents);
  return newIncident;
}

export function acknowledgeIncident(incidentId: string): void {
  const incidents = loadIncidents();
  const incident = incidents.find((i) => i.id === incidentId);
  if (incident && !incident.acknowledgedAt) {
    incident.acknowledgedAt = new Date();
    saveIncidents(incidents);
  }
}

export function resolveIncident(incidentId: string, recurring?: boolean): void {
  const incidents = loadIncidents();
  const incident = incidents.find((i) => i.id === incidentId);
  if (incident) {
    incident.resolvedAt = new Date();
    if (recurring !== undefined) incident.recurring = recurring;
    saveIncidents(incidents);
  }
}
