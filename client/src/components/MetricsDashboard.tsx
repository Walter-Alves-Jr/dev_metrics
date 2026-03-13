import { getMetrics, getTotalMetrics } from "@/lib/storage";

export default function MetricsDashboard() {
  const metrics = getMetrics();
  const totalMetrics = getTotalMetrics();

  return (
    <div className="space-y-6">
      {/* Total Metrics */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold mb-4">Métricas Gerais</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total de Devs</p>
            <p className="text-2xl font-bold">{totalMetrics.totalDevelopers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total de Tarefas</p>
            <p className="text-2xl font-bold">{totalMetrics.totalTasks}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Custo Total (R$)</p>
            <p className="text-2xl font-bold">
              {totalMetrics.totalCost.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Valor Total (R$)</p>
            <p className="text-2xl font-bold">
              {totalMetrics.totalValue.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ROI Total</p>
            <p className="text-2xl font-bold">{totalMetrics.roi.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Valor Médio/Tarefa</p>
            <p className="text-2xl font-bold">
              {totalMetrics.avgValuePerTask.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Per Developer Metrics */}
      {metrics.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          Nenhum desenvolvedor cadastrado
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="font-semibold">Métricas por Desenvolvedor</h3>
          {metrics.map((metric) => (
            <div
              key={metric.developerId}
              className="p-4 border rounded"
            >
              <h4 className="font-semibold mb-3">{metric.developerName}</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Custo Mensal</p>
                  <p className="font-semibold">R$ {metric.monthlyCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Tarefas</p>
                  <p className="font-semibold">{metric.taskCount}</p>
                </div>
                <div>
                  <p className="text-gray-600">Valor Total</p>
                  <p className="font-semibold">R$ {metric.totalValue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Valor Médio/Tarefa</p>
                  <p className="font-semibold">
                    R$ {metric.avgValuePerTask.toFixed(2)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">ROI (Retorno/Custo)</p>
                  <p
                    className={`text-lg font-bold ${
                      metric.roi >= 100
                        ? "text-green-600"
                        : metric.roi >= 50
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {metric.roi.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
