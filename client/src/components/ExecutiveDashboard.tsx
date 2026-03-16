import { useState, useEffect } from "react";
import {
  calculateDeploymentFrequency,
  calculateLeadTime,
  calculateChangeFailureRate,
  calculateMTTR,
  DeploymentRecord,
  IncidentRecord,
  TaskRecord,
} from "@/lib/doraMetrics";

type ExecutiveDashboardProps = {
  deployments: DeploymentRecord[];
  incidents: IncidentRecord[];
  tasks: TaskRecord[];
  bugs: number;
};

export default function ExecutiveDashboard({
  deployments,
  incidents,
  tasks,
  bugs,
}: ExecutiveDashboardProps) {
  const [metrics, setMetrics] = useState({
    deployFrequency: 0,
    leadTime: 0,
    failureRate: 0,
    mttr: 0,
  });

  useEffect(() => {
    setMetrics({
      deployFrequency: calculateDeploymentFrequency(deployments),
      leadTime: calculateLeadTime(tasks),
      failureRate: calculateChangeFailureRate(deployments),
      mttr: calculateMTTR(incidents),
    });
  }, [deployments, incidents, tasks]);

  const getPerformanceLevel = (metric: string, value: number) => {
    switch (metric) {
      case "deployFrequency":
        if (value >= 1) return { level: "Elite", color: "text-green-700" };
        if (value >= 0.5) return { level: "Alta", color: "text-blue-700" };
        if (value >= 0.2) return { level: "Média", color: "text-yellow-700" };
        return { level: "Baixa", color: "text-red-700" };
      case "leadTime":
        if (value < 1) return { level: "Elite", color: "text-green-700" };
        if (value < 7) return { level: "Alta", color: "text-blue-700" };
        if (value < 30) return { level: "Média", color: "text-yellow-700" };
        return { level: "Baixa", color: "text-red-700" };
      case "failureRate":
        if (value < 15) return { level: "Elite", color: "text-green-700" };
        if (value < 30) return { level: "Alta", color: "text-blue-700" };
        if (value < 50) return { level: "Média", color: "text-yellow-700" };
        return { level: "Baixa", color: "text-red-700" };
      default:
        return { level: "N/A", color: "text-gray-700" };
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Deployment Frequency */}
        <div className="p-4 bg-white rounded border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Deploy por Semana</div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {metrics.deployFrequency.toFixed(1)}
          </div>
          <div
            className={`text-xs font-semibold ${
              getPerformanceLevel("deployFrequency", metrics.deployFrequency)
                .color
            }`}
          >
            {
              getPerformanceLevel("deployFrequency", metrics.deployFrequency)
                .level
            }
          </div>
        </div>

        {/* Lead Time */}
        <div className="p-4 bg-white rounded border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Lead Time Médio</div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {metrics.leadTime.toFixed(1)}d
          </div>
          <div
            className={`text-xs font-semibold ${
              getPerformanceLevel("leadTime", metrics.leadTime).color
            }`}
          >
            {getPerformanceLevel("leadTime", metrics.leadTime).level}
          </div>
        </div>

        {/* Failure Rate */}
        <div className="p-4 bg-white rounded border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Taxa de Falha</div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {metrics.failureRate.toFixed(1)}%
          </div>
          <div
            className={`text-xs font-semibold ${
              getPerformanceLevel("failureRate", metrics.failureRate).color
            }`}
          >
            {getPerformanceLevel("failureRate", metrics.failureRate).level}
          </div>
        </div>

        {/* MTTR */}
        <div className="p-4 bg-white rounded border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">MTTR</div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {metrics.mttr.toFixed(1)}h
          </div>
          <div className="text-xs font-semibold text-gray-700">
            Tempo médio de recuperação
          </div>
        </div>
      </div>

      {/* Bugs em Produção */}
      <div className="p-4 bg-red-50 rounded border border-red-200">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-red-700 font-semibold">
              Bugs em Produção
            </div>
            <div className="text-2xl font-bold text-red-900 mt-1">{bugs}</div>
          </div>
          <div className="text-4xl text-red-200">🐛</div>
        </div>
      </div>

      {/* Benchmarks */}
      <div className="p-4 bg-blue-50 rounded border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">Benchmarks DORA</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-blue-700">Elite</p>
            <p className="font-semibold text-blue-900">&gt; 1/dia</p>
          </div>
          <div>
            <p className="text-blue-700">Alta</p>
            <p className="font-semibold text-blue-900">1-7 dias</p>
          </div>
          <div>
            <p className="text-blue-700">Média</p>
            <p className="font-semibold text-blue-900">7-30 dias</p>
          </div>
          <div>
            <p className="text-blue-700">Baixa</p>
            <p className="font-semibold text-blue-900">&gt; 30 dias</p>
          </div>
        </div>
      </div>
    </div>
  );
}
