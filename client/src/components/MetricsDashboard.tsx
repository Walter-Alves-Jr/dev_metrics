import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getMetricas,
  getMetricasPorProduto,
  getTotalMetricas,
  getTasksAtrasadas,
} from "@/lib/storage";

export default function MetricsDashboard() {
  const metricas = getMetricas();
  const metricasProduto = getMetricasPorProduto();
  const totalMetricas = getTotalMetricas();
  const tasksAtrasadas = getTasksAtrasadas();

  return (
    <div className="space-y-6">
      {/* Total Metrics */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold mb-4">📊 Métricas Gerais</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total de Devs</p>
            <p className="text-2xl font-bold">{totalMetricas.totalDevelopers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total de Produtos</p>
            <p className="text-2xl font-bold">{totalMetricas.totalProducts}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total de Tarefas</p>
            <p className="text-2xl font-bold">{totalMetricas.totalTasks}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Custo Total (R$)</p>
            <p className="text-2xl font-bold">
              {totalMetricas.totalCost.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Valor Total (R$)</p>
            <p className="text-2xl font-bold">
              {totalMetricas.totalValue.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ROI Total</p>
            <p className="text-2xl font-bold">{totalMetricas.roi.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Horas Orçadas</p>
            <p className="text-2xl font-bold">{totalMetricas.totalHorasOrcadas}h</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Horas Reais</p>
            <p className="text-2xl font-bold">{totalMetricas.totalHorasReais}h</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tarefas Atrasadas</p>
            <p className={`text-2xl font-bold ${tasksAtrasadas.length > 0 ? "text-red-600" : "text-green-600"}`}>
              {tasksAtrasadas.length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs for detailed metrics */}
      <Tabs defaultValue="devs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="devs">Por Desenvolvedor</TabsTrigger>
          <TabsTrigger value="produtos">Por Produto</TabsTrigger>
        </TabsList>

        {/* Per Developer Metrics */}
        <TabsContent value="devs" className="space-y-3">
          {metricas.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Nenhum desenvolvedor cadastrado
            </div>
          ) : (
            metricas.map((metric) => (
              <div key={metric.developerId} className="p-4 border rounded">
                <h4 className="font-semibold mb-3">{metric.developerName}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Custo Mensal</p>
                    <p className="font-semibold">R$ {metric.monthlyCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Tarefas</p>
                    <p className="font-semibold">{metric.taskCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Projetos / Sustentação</p>
                    <p className="font-semibold">
                      {metric.projectCount} / {metric.maintenanceCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Valor Total</p>
                    <p className="font-semibold">R$ {metric.totalValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Horas Orçadas / Reais</p>
                    <p className="font-semibold">
                      {metric.totalHorasOrcadas}h / {metric.totalHorasReais}h
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Eficiência</p>
                    <p className="font-semibold">{metric.eficiencia}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Produtividade (R$/h)</p>
                    <p className="font-semibold">R$ {metric.produtividade.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Valor Médio/Tarefa</p>
                    <p className="font-semibold">
                      R$ {metric.avgValuePerTask.toFixed(2)}
                    </p>
                  </div>
                  <div>
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
                  {metric.maintenanceCount > 0 && (
                    <>
                      <div className="col-span-2 md:col-span-3 border-t pt-3 mt-3">
                        <p className="font-semibold text-sm text-gray-700 mb-2">Metricas de Sustentacao</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Custo/h Sustentacao</p>
                        <p className="font-semibold">R$ {metric.maintenanceCostPerHour.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tempo Medio/Ticket</p>
                        <p className="font-semibold">{metric.maintenanceAvgTime}h</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tickets Resolvidos</p>
                        <p className="font-semibold">{metric.maintenanceTicketsResolved}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Per Product Metrics */}
        <TabsContent value="produtos" className="space-y-3">
          {metricasProduto.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Nenhum produto cadastrado
            </div>
          ) : (
            metricasProduto.map((metric) => (
              <div key={metric.productId} className="p-4 border rounded">
                <h4 className="font-semibold mb-3">{metric.productName}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Devs Alocados</p>
                    <p className="font-semibold">{metric.devCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total de Tarefas</p>
                    <p className="font-semibold">{metric.taskCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Custo Total</p>
                    <p className="font-semibold">R$ {metric.totalCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Valor Total</p>
                    <p className="font-semibold">R$ {metric.totalValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Horas Orçadas / Reais</p>
                    <p className="font-semibold">
                      {metric.totalHorasOrcadas}h / {metric.totalHorasReais}h
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Valor Médio/Tarefa</p>
                    <p className="font-semibold">
                      R$ {metric.avgValuePerTask.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">ROI Projetos</p>
                    <p
                      className={`text-lg font-bold ${
                        metric.projectROI >= 100
                          ? "text-green-600"
                          : metric.projectROI >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {metric.projectROI.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Custo/h Sustentacao</p>
                    <p className="font-semibold">R$ {metric.maintenanceCostPerHour.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tempo Medio Sustentacao</p>
                    <p className="font-semibold">{metric.maintenanceAvgTime}h</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Delayed Tasks Alert */}
      {tasksAtrasadas.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="font-semibold text-red-800 mb-3">
            ⚠️ {tasksAtrasadas.length} Tarefa(s) Atrasada(s)
          </h3>
          <div className="space-y-2">
            {tasksAtrasadas.map((task) => (
              <div key={task.id} className="text-sm text-red-700">
                <p className="font-semibold">{task.description}</p>
                <p>
                  Vencimento: {new Date(task.dataFimPlanejada).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
