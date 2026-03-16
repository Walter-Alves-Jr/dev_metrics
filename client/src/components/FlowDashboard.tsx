import { useMemo } from "react";
import { TaskRecord, calculateFlowMetrics } from "@/lib/doraMetrics";

type FlowDashboardProps = {
  tasks: TaskRecord[];
};

export default function FlowDashboard({ tasks }: FlowDashboardProps) {
  const flowMetrics = useMemo(() => calculateFlowMetrics(tasks), [tasks]);

  const stages = [
    {
      name: "Backlog",
      time: flowMetrics.backlogTime,
      unit: "dias",
      description: "Tempo até começar desenvolvimento",
    },
    {
      name: "Desenvolvimento",
      time: flowMetrics.devTime,
      unit: "dias",
      description: "Tempo em desenvolvimento",
    },
    {
      name: "Code Review",
      time: flowMetrics.reviewTime,
      unit: "dias",
      description: "Tempo em revisão de código",
    },
    {
      name: "Deploy",
      time: flowMetrics.deployTime,
      unit: "horas",
      description: "Tempo até produção",
    },
  ];

  const maxTime = Math.max(...stages.map((s) => s.time));
  const totalTime =
    flowMetrics.backlogTime +
    flowMetrics.devTime +
    flowMetrics.reviewTime +
    flowMetrics.deployTime / 24;

  return (
    <div className="space-y-6">
      {/* Gargalos por Etapa */}
      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const percentage = maxTime > 0 ? (stage.time / maxTime) * 100 : 0;
          const isBottleneck = percentage > 60;

          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{stage.name}</p>
                  <p className="text-xs text-gray-600">{stage.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {stage.time.toFixed(1)} {stage.unit}
                  </p>
                  {isBottleneck && (
                    <p className="text-xs text-red-600 font-semibold">
                      ⚠️ Gargalo
                    </p>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded h-2">
                <div
                  className={`h-2 rounded transition-all ${
                    isBottleneck ? "bg-red-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo Total */}
      <div className="p-4 bg-gray-50 rounded border border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Tempo Total Médio</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalTime.toFixed(1)}d
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Etapa Mais Lenta</p>
            <p className="text-2xl font-bold text-gray-900">
              {stages.reduce((prev, curr) =>
                curr.time > prev.time ? curr : prev
              ).name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tarefas Analisadas</p>
            <p className="text-2xl font-bold text-gray-900">
              {tasks.filter((t) => t.completedAt).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Taxa de Conclusão</p>
            <p className="text-2xl font-bold text-gray-900">
              {tasks.length > 0
                ? (
                    ((tasks.filter((t) => t.completedAt).length / tasks.length) *
                      100)
                  ).toFixed(0)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Recomendações */}
      <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
        <h3 className="font-semibold text-yellow-900 mb-2">Recomendações</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          {flowMetrics.backlogTime > 3 && (
            <li>
              • Backlog alto ({flowMetrics.backlogTime.toFixed(1)}d): Priorizar
              tarefas
            </li>
          )}
          {flowMetrics.devTime > 5 && (
            <li>
              • Dev lento ({flowMetrics.devTime.toFixed(1)}d): Considerar pair
              programming
            </li>
          )}
          {flowMetrics.reviewTime > 2 && (
            <li>
              • Review lento ({flowMetrics.reviewTime.toFixed(1)}d): Aumentar
              reviewers
            </li>
          )}
          {flowMetrics.deployTime > 4 && (
            <li>
              • Deploy lento ({flowMetrics.deployTime.toFixed(1)}h): Automatizar
              processo
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
