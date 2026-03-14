import { Developer, getMetricas } from "@/lib/storage";
import { getSettings, updateSettings, getBugTracking } from "@/lib/bugTracking";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ResourceMaximizationDashboardProps {
  developers: Developer[];
}

export default function ResourceMaximizationDashboard({
  developers,
}: ResourceMaximizationDashboardProps) {
  const [selectedDevId, setSelectedDevId] = useState(developers[0]?.id || "");
  const [settings, setSettings] = useState(getSettings());
  const [editingRate, setEditingRate] = useState(false);
  const [newRate, setNewRate] = useState(settings.hourlyRate.toString());

  if (!selectedDevId || developers.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Nenhum desenvolvedor cadastrado
      </div>
    );
  }

  const selectedDev = developers.find((d) => d.id === selectedDevId);
  if (!selectedDev) return null;

  const handleSaveRate = () => {
    const rate = parseFloat(newRate);
    if (rate > 0) {
      const updated = updateSettings({ hourlyRate: rate });
      setSettings(updated);
      setEditingRate(false);
    }
  };

  // Buscar métricas do dev
  const metricas = getMetricas();
  const devMetricas = metricas.find((m) => m.developerId === selectedDevId);
  
  // Buscar projetos/bugs do dev
  const bugTracking = getBugTracking();
  const devItems = bugTracking.filter((item) => item.developerId === selectedDevId);

  // Calcular receita e custo baseado em dados reais
  const costPerHour = selectedDev.monthlyCost / 160; // 160 horas por mês
  
  // Receita = valor da hora * horas orçadas
  const totalHoursOrcadas = devItems.reduce((acc, item) => {
    if (item.horasGastas) {
      return acc + item.horasGastas;
    }
    return acc;
  }, 0);

  const totalRevenue = totalHoursOrcadas * (settings.hourlyRate / 100);
  const totalCost = totalHoursOrcadas * costPerHour;
  const totalProfit = totalRevenue - totalCost;
  const totalROI = totalCost > 0 ? ((totalProfit / totalCost) * 100) : 0;
  const efficiency = totalCost > 0 ? ((totalRevenue / totalCost) * 100) : 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-gray-700">Selecionar Desenvolvedor</label>
        <Select value={selectedDevId} onValueChange={setSelectedDevId}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {developers.map((dev) => (
              <SelectItem key={dev.id} value={dev.id}>
                {dev.name} (R$ {dev.monthlyCost.toFixed(2)}/mês)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="p-4 bg-blue-50 rounded border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Configuração</h3>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm text-blue-800">
            <strong>Valor da hora:</strong> R$ {settings.hourlyRate.toFixed(2)}
          </p>
          {!editingRate ? (
            <button
              onClick={() => setEditingRate(true)}
              className="text-xs px-2 py-1 bg-blue-200 text-blue-900 rounded hover:bg-blue-300"
            >
              Editar
            </button>
          ) : (
            <div className="flex gap-1">
              <input
                type="number"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                className="w-20 px-2 py-1 border rounded text-sm"
              />
              <button
                onClick={handleSaveRate}
                className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Salvar
              </button>
              <button
                onClick={() => setEditingRate(false)}
                className="text-xs px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
        <p className="text-sm text-blue-800">
          Custo do dev: <strong>R$ {selectedDev.monthlyCost.toFixed(2)}/mês</strong> (~R$ {costPerHour.toFixed(2)}/hora)
        </p>
      </div>

      {devItems.length === 0 ? (
        <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Nenhum projeto/bug atrelado a este desenvolvedor.</strong> Registre projetos ou bugs na aba "Bugs/Projetos" para ver a análise de recursos.
          </p>
        </div>
      ) : (
        <>
          <div className="p-4 bg-green-50 rounded border border-green-200">
            <h4 className="font-semibold text-green-900 mb-3">Resumo de Recursos</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
              <div>
                <p className="text-green-700">Total de Horas</p>
                <p className="font-semibold text-green-900">{totalHoursOrcadas.toFixed(1)}h</p>
              </div>
              <div>
                <p className="text-green-700">Receita Total</p>
                <p className="font-semibold text-green-900">R$ {totalRevenue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-green-700">Custo Total</p>
                <p className="font-semibold text-green-900">R$ {totalCost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-green-700">Lucro</p>
                <p className={`font-semibold ${totalProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
                  R$ {totalProfit.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-green-700">ROI</p>
                <p className={`font-semibold ${totalROI >= 0 ? "text-green-700" : "text-red-700"}`}>
                  {totalROI.toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="p-2 text-left font-semibold text-gray-700">Projeto/Bug</th>
                  <th className="p-2 text-right font-semibold text-gray-700">Orcado</th>
                  <th className="p-2 text-right font-semibold text-gray-700">Real</th>
                  <th className="p-2 text-right font-semibold text-gray-700">Eficiencia</th>
                  <th className="p-2 text-right font-semibold text-gray-700">Receita</th>
                  <th className="p-2 text-right font-semibold text-gray-700">Custo</th>
                  <th className="p-2 text-right font-semibold text-gray-700">Lucro</th>
                  <th className="p-2 text-center font-semibold text-gray-700">ROI</th>
                </tr>
              </thead>
              <tbody>
                {devItems.map((item) => {
                  const horasOrcadas = item.horasOrcadas || item.horasGastas || 0;
                  const horasReais = item.horasReais || horasOrcadas;
                  const eficiencia = horasOrcadas > 0 ? (horasReais / horasOrcadas) * 100 : 0;
                  const itemRevenue = horasReais * (settings.hourlyRate / 100);
                  const itemCost = horasReais * costPerHour;
                  const itemProfit = itemRevenue - itemCost;
                  const itemROI = itemCost > 0 ? ((itemProfit / itemCost) * 100) : 0;

                  return (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-2 text-gray-900">
                        <span className="text-xs mr-1">{item.type === "bug" ? "🐛" : "📋"}</span>
                        {item.title}
                      </td>
                      <td className="p-2 text-right text-gray-700">{horasOrcadas}h</td>
                      <td className="p-2 text-right text-gray-700">{horasReais}h</td>
                      <td className="p-2 text-right text-gray-700">
                        <span className={`font-semibold ${
                          eficiencia <= 100 ? "text-green-700" : "text-orange-700"
                        }`}>
                          {eficiencia.toFixed(0)}%
                        </span>
                      </td>
                      <td className="p-2 text-right text-gray-700">R$ {itemRevenue.toFixed(2)}</td>
                      <td className="p-2 text-right text-gray-700">R$ {itemCost.toFixed(2)}</td>
                      <td className={`p-2 text-right font-semibold ${itemProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
                        R$ {itemProfit.toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          itemROI >= 50 ? "bg-green-50 text-green-700" : itemROI >= 0 ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"
                        }`}>
                          {itemROI.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="p-4 bg-gray-50 rounded border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-2">Como funciona</h4>
        <div className="space-y-1 text-sm text-gray-700">
          <p><strong>Horas:</strong> Soma das horas orçadas/gastas em todos os projetos/bugs do dev</p>
          <p><strong>Receita:</strong> Horas × Valor da hora configurado</p>
          <p><strong>Custo:</strong> Horas × Custo/hora do dev (baseado no salário mensal)</p>
          <p><strong>ROI:</strong> ((Receita - Custo) / Custo) × 100</p>
        </div>
      </div>
    </div>
  );
}
