import { useMemo } from "react";
import {
  IncidentRecord,
  calculateMTTR,
  calculateSLACompliance,
  calculateMTTA,
} from "@/lib/doraMetrics";

type SustentationDashboardProps = {
  incidents: IncidentRecord[];
};

export default function SustentationDashboard({
  incidents,
}: SustentationDashboardProps) {
  const metrics = useMemo(
    () => ({
      mttr: calculateMTTR(incidents),
      sla: calculateSLACompliance(incidents),
      mtta: calculateMTTA(incidents),
      volume: incidents.length,
      recurring: incidents.filter((i) => i.recurring).length,
    }),
    [incidents]
  );

  const bySeverity = useMemo(() => {
    const severity = {
      critical: incidents.filter((i) => i.severity === "critical").length,
      high: incidents.filter((i) => i.severity === "high").length,
      medium: incidents.filter((i) => i.severity === "medium").length,
      low: incidents.filter((i) => i.severity === "low").length,
    };
    return severity;
  }, [incidents]);

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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="p-4 bg-white rounded border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Chamados/Mês</div>
          <div className="text-3xl font-bold text-gray-900">
            {metrics.volume}
          </div>
        </div>

        <div className="p-4 bg-white rounded border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">SLA Cumprido</div>
          <div className="text-3xl font-bold text-gray-900">
            {metrics.sla.toFixed(0)}%
          </div>
          <div
            className={`text-xs font-semibold mt-1 ${
              metrics.sla >= 95
                ? "text-green-700"
                : metrics.sla >= 80
                  ? "text-yellow-700"
                  : "text-red-700"
            }`}
          >
            {metrics.sla >= 95 ? "✓ Bom" : metrics.sla >= 80 ? "⚠ Atenção" : "✗ Crítico"}
          </div>
        </div>

        <div className="p-4 bg-white rounded border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">MTTR</div>
          <div className="text-3xl font-bold text-gray-900">
            {metrics.mttr.toFixed(1)}h
          </div>
          <div className="text-xs text-gray-600 mt-1">Tempo médio resolução</div>
        </div>

        <div className="p-4 bg-white rounded border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">MTTA</div>
          <div className="text-3xl font-bold text-gray-900">
            {metrics.mtta.toFixed(1)}h
          </div>
          <div className="text-xs text-gray-600 mt-1">Tempo até assumir</div>
        </div>

        <div className="p-4 bg-white rounded border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Recorrentes</div>
          <div className="text-3xl font-bold text-gray-900">
            {metrics.recurring}
          </div>
          <div className="text-xs text-red-600 font-semibold mt-1">
            {metrics.volume > 0
              ? ((metrics.recurring / metrics.volume) * 100).toFixed(0)
              : 0}
            % do total
          </div>
        </div>
      </div>

      {/* Distribuição por Severidade */}
      <div className="p-4 bg-gray-50 rounded border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Por Severidade</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Crítico", value: bySeverity.critical, color: "red" },
            { label: "Alto", value: bySeverity.high, color: "orange" },
            { label: "Médio", value: bySeverity.medium, color: "yellow" },
            { label: "Baixo", value: bySeverity.low, color: "green" },
          ].map((item) => (
            <div
              key={item.label}
              className={`p-3 rounded border ${getSeverityColor(item.color.toLowerCase())}`}
            >
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-2xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Incidentes Recorrentes */}
      {metrics.recurring > 0 && (
        <div className="p-4 bg-red-50 rounded border border-red-200">
          <h3 className="font-semibold text-red-900 mb-3">
            ⚠️ Incidentes Recorrentes ({metrics.recurring})
          </h3>
          <div className="space-y-2">
            {incidents
              .filter((i) => i.recurring)
              .slice(0, 5)
              .map((incident) => (
                <div
                  key={incident.id}
                  className="p-2 bg-white rounded border border-red-200"
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {incident.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    Última ocorrência:{" "}
                    {incident.resolvedAt?.toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recomendações */}
      <div className="p-4 bg-blue-50 rounded border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Insights</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          {metrics.sla < 80 && (
            <li>• SLA crítico: Aumentar capacidade ou revisar prazos</li>
          )}
          {metrics.recurring > metrics.volume * 0.2 && (
            <li>
              • {metrics.recurring} incidentes recorrentes: Investigar causas
              raiz
            </li>
          )}
          {metrics.mttr > 4 && (
            <li>• MTTR alto: Melhorar runbooks e documentação</li>
          )}
          {metrics.mtta > 1 && (
            <li>• MTTA alto: Revisar processo de escalação</li>
          )}
        </ul>
      </div>
    </div>
  );
}
