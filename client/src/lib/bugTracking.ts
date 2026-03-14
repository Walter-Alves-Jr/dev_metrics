export type BugTrackingItem = {
  id: string;
  title: string;
  type: "bug" | "projeto";
  dataBug?: string; // Data do BUG (apenas para bugs)
  dataInicio: string; // Data Início Projeto
  targetHML: string; // Target Data HML
  targetPRD: string; // Target Data PRD
  status: "planejado" | "em_progresso" | "hml" | "prd" | "concluido";
  developerId: string;
  productId: string;
  createdAt: string;
};

export type ResourceMaximization = {
  developerId: string;
  developerName: string;
  monthlyCost: number;
  scenarios: ScenarioResult[];
};

export type ScenarioResult = {
  days: number;
  hoursPerDay: number;
  totalHours: number;
  totalRevenue: number; // 100 horas por 250 reais = 2.5 reais por hora
  totalCost: number; // custo do dev
  roi: number; // percentual
  efficiency: number; // percentual
};

const BUG_TRACKING_KEY = "dev_metrics_bug_tracking";

export function getBugTracking(): BugTrackingItem[] {
  try {
    const data = localStorage.getItem(BUG_TRACKING_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading bug tracking from storage:", error);
    return [];
  }
}

export function addBugTracking(
  title: string,
  type: "bug" | "projeto",
  dataBug: string | undefined,
  dataInicio: string,
  targetHML: string,
  targetPRD: string,
  developerId: string,
  productId: string
): BugTrackingItem {
  const items = getBugTracking();
  const newItem: BugTrackingItem = {
    id: Date.now().toString(),
    title,
    type,
    dataBug,
    dataInicio,
    targetHML,
    targetPRD,
    status: "planejado",
    developerId,
    productId,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  localStorage.setItem(BUG_TRACKING_KEY, JSON.stringify(items));
  return newItem;
}

export function updateBugTracking(
  id: string,
  updates: Partial<BugTrackingItem>
): BugTrackingItem | null {
  const items = getBugTracking();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates };
  localStorage.setItem(BUG_TRACKING_KEY, JSON.stringify(items));
  return items[index];
}

export function deleteBugTracking(id: string): boolean {
  const items = getBugTracking();
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  localStorage.setItem(BUG_TRACKING_KEY, JSON.stringify(filtered));
  return true;
}

export function calculateResourceMaximization(
  developerId: string,
  developerName: string,
  monthlyCost: number
): ResourceMaximization {
  // 100 horas por 250 reais = 2.5 reais por hora
  const revenuePerHour = 2.5;
  const costPerDay = monthlyCost / 22; // assumindo 22 dias úteis por mês

  const scenarios: ScenarioResult[] = [];

  // Gerar cenários de 1 a 30 dias
  for (let days = 1; days <= 30; days++) {
    const hoursPerDay = 8; // 8 horas por dia
    const totalHours = days * hoursPerDay;
    const totalRevenue = totalHours * revenuePerHour;
    const totalCost = costPerDay * days;
    const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
    const efficiency = totalCost > 0 ? (totalRevenue / totalCost) * 100 : 0;

    scenarios.push({
      days,
      hoursPerDay,
      totalHours,
      totalRevenue,
      totalCost,
      roi: parseFloat(roi.toFixed(2)),
      efficiency: parseFloat(efficiency.toFixed(2)),
    });
  }

  return {
    developerId,
    developerName,
    monthlyCost,
    scenarios,
  };
}
