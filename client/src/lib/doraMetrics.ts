// Tipos para Métricas DORA + Performance de Engenharia

export type DeploymentRecord = {
  id: string;
  date: Date;
  success: boolean;
  rollback?: boolean;
  environment: "staging" | "production";
};

export type IncidentRecord = {
  id: string;
  title: string;
  openedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  severity: "critical" | "high" | "medium" | "low";
  recurring?: boolean;
  slaTarget: number; // em horas
};

export type TaskRecord = {
  id: string;
  title: string;
  status: "backlog" | "dev" | "review" | "deploy" | "done";
  createdAt: Date;
  devStartedAt?: Date;
  reviewStartedAt?: Date;
  deployedAt?: Date;
  completedAt?: Date;
  reopened?: number; // quantas vezes foi reabertas
  type: "project" | "sustentation";
};

export type BugRecord = {
  id: string;
  title: string;
  foundAt: Date;
  fixedAt?: Date;
  environment: "production" | "staging" | "development";
  severity: "critical" | "high" | "medium" | "low";
};

export type TestCoverageRecord = {
  id: string;
  date: Date;
  totalLines: number;
  testedLines: number;
  coverage: number; // percentual
};

// Cálculos DORA

export type DoraMetrics = {
  deploymentFrequency: number; // deploys por semana
  leadTimeForChanges: number; // dias médios
  changeFailureRate: number; // percentual
  mttr: number; // horas
};

export type SustentationMetrics = {
  volumeIncidents: number;
  slaCompliance: number; // percentual
  mtta: number; // horas
  recurringIncidents: number;
  mttr: number; // horas
};

export type QualityMetrics = {
  bugRate: number; // bugs por funcionalidade
  reworkPercentage: number; // tarefas reabertas
  testCoverage: number; // percentual
};

export type FlowMetrics = {
  backlogTime: number; // dias médios
  devTime: number; // dias médios
  reviewTime: number; // dias médios
  deployTime: number; // horas médias
};

// Funções de cálculo

export function calculateDeploymentFrequency(
  deployments: DeploymentRecord[],
  days: number = 7
): number {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  const recentDeployments = deployments.filter(
    (d) => d.date >= startDate && d.success
  );
  
  return (recentDeployments.length / days) * 7; // por semana
}

export function calculateLeadTime(tasks: TaskRecord[]): number {
  const completedTasks = tasks.filter((t) => t.completedAt);
  
  if (completedTasks.length === 0) return 0;
  
  const totalTime = completedTasks.reduce((sum, task) => {
    const leadTime =
      (task.completedAt!.getTime() - task.createdAt.getTime()) /
      (1000 * 60 * 60 * 24);
    return sum + leadTime;
  }, 0);
  
  return totalTime / completedTasks.length;
}

export function calculateChangeFailureRate(
  deployments: DeploymentRecord[]
): number {
  if (deployments.length === 0) return 0;
  
  const failures = deployments.filter((d) => d.rollback).length;
  return (failures / deployments.length) * 100;
}

export function calculateMTTR(incidents: IncidentRecord[]): number {
  const resolvedIncidents = incidents.filter((i) => i.resolvedAt);
  
  if (resolvedIncidents.length === 0) return 0;
  
  const totalTime = resolvedIncidents.reduce((sum, incident) => {
    const time =
      (incident.resolvedAt!.getTime() - incident.openedAt.getTime()) /
      (1000 * 60 * 60);
    return sum + time;
  }, 0);
  
  return totalTime / resolvedIncidents.length;
}

export function calculateSLACompliance(incidents: IncidentRecord[]): number {
  if (incidents.length === 0) return 0;
  
  const compliant = incidents.filter((i) => {
    if (!i.resolvedAt) return false;
    const timeToResolve =
      (i.resolvedAt.getTime() - i.openedAt.getTime()) / (1000 * 60 * 60);
    return timeToResolve <= i.slaTarget;
  }).length;
  
  return (compliant / incidents.length) * 100;
}

export function calculateMTTA(incidents: IncidentRecord[]): number {
  const acknowledgedIncidents = incidents.filter((i) => i.acknowledgedAt);
  
  if (acknowledgedIncidents.length === 0) return 0;
  
  const totalTime = acknowledgedIncidents.reduce((sum, incident) => {
    const time =
      (incident.acknowledgedAt!.getTime() - incident.openedAt.getTime()) /
      (1000 * 60 * 60);
    return sum + time;
  }, 0);
  
  return totalTime / acknowledgedIncidents.length;
}

export function calculateReworkPercentage(tasks: TaskRecord[]): number {
  if (tasks.length === 0) return 0;
  
  const reworkTasks = tasks.filter((t) => (t.reopened || 0) > 0).length;
  return (reworkTasks / tasks.length) * 100;
}

export function calculateFlowMetrics(tasks: TaskRecord[]): FlowMetrics {
  const calculateAverageTime = (
    startField: keyof TaskRecord,
    endField: keyof TaskRecord
  ): number => {
    const validTasks = tasks.filter(
      (t) => t[startField] && t[endField]
    );
    
    if (validTasks.length === 0) return 0;
    
    const totalTime = validTasks.reduce((sum, task) => {
      const start = task[startField] as Date;
      const end = task[endField] as Date;
      const time = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      return sum + time;
    }, 0);
    
    return totalTime / validTasks.length;
  };
  
  return {
    backlogTime: calculateAverageTime("createdAt", "devStartedAt"),
    devTime: calculateAverageTime("devStartedAt", "reviewStartedAt"),
    reviewTime: calculateAverageTime("reviewStartedAt", "deployedAt"),
    deployTime: calculateAverageTime("deployedAt", "completedAt") * 24, // converter para horas
  };
}
