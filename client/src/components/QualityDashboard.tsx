import { useMemo } from "react";
import { TaskRecord, BugRecord, calculateReworkPercentage } from "@/lib/doraMetrics";

type QualityDashboardProps = {
  tasks: TaskRecord[];
  bugs: BugRecord[];
  testCoverage?: number;
};

export default function QualityDashboard({
  tasks,
  bugs,
  testCoverage = 0,
}: QualityDashboardProps) {
  const metrics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completedAt).length;
    const reworkPercentage = calculateReworkPercentage(tasks);

    const bugsByEnvironment = {
      production: bugs.filter((b) => b.environment === "production").length,
      staging: bugs.filter((b) => b.environment === "staging").length,
      development: bugs.filter((b) => b.environment === "development").length,
    };

    const bugsBySeverity = {
      critical: bugs.filter((b) => b.severity === "critical").length,
      high: bugs.filter((b) => b.severity === "high").length,
      medium: bugs.filter((b) => b.severity === "medium").length,
      low: bugs.filter((b) => b.severity === "low").length,
    };

    const bugRate =
      completedTasks > 0
        ? ((bugsByEnvironment.production / completedTasks) * 100).toFixed(2)
        : 0;

    return {
      totalTasks,
      completedTasks,
      reworkPercentage,
      bugsByEnvironment,
      bugsBySeverity,
      bugRate,
      totalBugs: bugs.length,
    };
  }, [tasks, bugs]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 border-red-200 text-red-900";
      case "high":
        return "bg-orange-50 border-orange-200 text-orange-900";
      case "medium":
        return "bg-yellow-50 border-yellow-200 text-yellow-900";
      case "low":
        return "bg-green-50 border-green-200 text-green-900";
      default:
        return "bg-gray-50 border-gray-200 text-gray-900";
    }
  };

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Bugs em Produção</div>
          <div className="text-3xl font-bold text-gray-900">
            {metrics.bugsByEnvironment.production}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Taxa: {metrics.bugRate} por entrega
          </div>
        </div>

        <div className="p-4 bg-white rounded border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Retrabalho</div>
          <div className="text-3xl font-bold text-gray-900">
            {metrics.reworkPercentage.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {tasks.filter((t) => (t.reopened || 0) > 0).length} tarefas reabertas
          </div>
        </div>

        <div className="p-4 bg-white rounded border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Cobertura de Testes</div>
          <div className="text-3xl font-bold text-gray-900">
            {testCoverage.toFixed(0)}%
          </div>
          <div
            className={`text-xs font-semibold mt-1 ${
              testCoverage >= 80
                ? "text-green-700"
                : testCoverage >= 60
                  ? "text-yellow-700"
                  : "text-red-700"
            }`}
          >
            {testCoverage >= 80 ? "✓ Bom" : testCoverage >= 60 ? "⚠ Médio" : "✗ Baixo"}
          </div>
        </div>

        <div className="p-4 bg-white rounded border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Total de Bugs</div>
          <div className="text-3xl font-bold text-gray-900">
            {metrics.totalBugs}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Todos os ambientes
          </div>
        </div>
      </div>

      {/* Bugs por Ambiente */}
      <div className="p-4 bg-gray-50 rounded border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Bugs por Ambiente</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-red-50 rounded border border-red-200">
            <p className="text-sm font-semibold text-red-900">Produção</p>
            <p className="text-2xl font-bold text-red-900">
              {metrics.bugsByEnvironment.production}
            </p>
          </div>
          <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
            <p className="text-sm font-semibold text-yellow-900">Staging</p>
            <p className="text-2xl font-bold text-yellow-900">
              {metrics.bugsByEnvironment.staging}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm font-semibold text-blue-900">Desenvolvimento</p>
            <p className="text-2xl font-bold text-blue-900">
              {metrics.bugsByEnvironment.development}
            </p>
          </div>
        </div>
      </div>

      {/* Bugs por Severidade */}
      <div className="p-4 bg-gray-50 rounded border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Bugs por Severidade</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Crítico",
              value: metrics.bugsBySeverity.critical,
              color: "red",
            },
            {
              label: "Alto",
              value: metrics.bugsBySeverity.high,
              color: "orange",
            },
            {
              label: "Médio",
              value: metrics.bugsBySeverity.medium,
              color: "yellow",
            },
            { label: "Baixo", value: metrics.bugsBySeverity.low, color: "green" },
          ].map((item) => (
            <div
              key={item.label}
              className={`p-3 rounded border ${getSeverityColor(item.color)}`}
            >
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-2xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Análise de Retrabalho */}
      {metrics.reworkPercentage > 10 && (
        <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
          <h3 className="font-semibold text-yellow-900 mb-2">
            ⚠️ Retrabalho Elevado
          </h3>
          <p className="text-sm text-yellow-800 mb-2">
            {metrics.reworkPercentage.toFixed(1)}% das tarefas foram reabertas.
            Possíveis causas:
          </p>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Falta de clareza nos requisitos</li>
            <li>• Testes insuficientes antes da entrega</li>
            <li>• Comunicação inadequada com stakeholders</li>
            <li>• Pressão por velocidade</li>
          </ul>
        </div>
      )}

      {/* Recomendações */}
      <div className="p-4 bg-blue-50 rounded border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Recomendações</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          {metrics.bugsByEnvironment.production > 5 && (
            <li>• Bugs em produção acima do esperado: Revisar QA</li>
          )}
          {testCoverage < 60 && (
            <li>• Cobertura de testes baixa: Aumentar testes unitários</li>
          )}
          {metrics.reworkPercentage > 15 && (
            <li>• Retrabalho alto: Melhorar processo de revisão</li>
          )}
          {metrics.bugsBySeverity.critical > 0 && (
            <li>• Bugs críticos em aberto: Priorizar correção</li>
          )}
        </ul>
      </div>
    </div>
  );
}
