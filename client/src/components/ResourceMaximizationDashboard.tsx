import { Developer } from "@/lib/storage";
import { calculateResourceMaximization, getSettings, updateSettings } from "@/lib/bugTracking";
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

  const maximization = calculateResourceMaximization(
    selectedDev.id,
    selectedDev.name,
    selectedDev.monthlyCost,
    settings.hourlyRate
  );

  // Filtrar cenários relevantes (1, 5, 10, 15, 20, 25, 30 dias)
  const relevantScenarios = maximization.scenarios.filter(
    (s: any) => [1, 5, 10, 15, 20, 25, 30].includes(s.days)
  );

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 150) return "bg-green-50 text-green-700";
    if (efficiency >= 100) return "bg-blue-50 text-blue-700";
    if (efficiency >= 50) return "bg-yellow-50 text-yellow-700";
    return "bg-red-50 text-red-700";
  };

  const getRoiColor = (roi: number) => {
    if (roi >= 50) return "bg-green-50 text-green-700";
    if (roi >= 0) return "bg-blue-50 text-blue-700";
    return "bg-red-50 text-red-700";
  };

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
        <h3 className="font-semibold text-blue-900 mb-2">Cenário Base</h3>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm text-blue-800">
            <strong>100 horas</strong> por <strong>R$ {settings.hourlyRate.toFixed(2)}</strong> = <strong>R$ {(settings.hourlyRate / 100).toFixed(2)}/hora</strong>
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
          Custo do dev: <strong>R$ {selectedDev.monthlyCost.toFixed(2)}/mês</strong> (~R$ {(selectedDev.monthlyCost / 22).toFixed(2)}/dia)
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="p-2 text-left font-semibold text-gray-700">Dias</th>
              <th className="p-2 text-left font-semibold text-gray-700">Horas</th>
              <th className="p-2 text-right font-semibold text-gray-700">Receita</th>
              <th className="p-2 text-right font-semibold text-gray-700">Custo</th>
              <th className="p-2 text-right font-semibold text-gray-700">Lucro</th>
              <th className="p-2 text-center font-semibold text-gray-700">Eficiência</th>
              <th className="p-2 text-center font-semibold text-gray-700">ROI</th>
            </tr>
          </thead>
          <tbody>
            {relevantScenarios.map((scenario: any) => {
              const profit = scenario.totalRevenue - scenario.totalCost;
              return (
                <tr key={scenario.days} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-2 font-semibold text-gray-900">{scenario.days}d</td>
                  <td className="p-2 text-gray-700">{scenario.totalHours}h</td>
                  <td className="p-2 text-right text-gray-700">
                    R$ {scenario.totalRevenue.toFixed(2)}
                  </td>
                  <td className="p-2 text-right text-gray-700">
                    R$ {scenario.totalCost.toFixed(2)}
                  </td>
                  <td className={`p-2 text-right font-semibold ${profit >= 0 ? "text-green-700" : "text-red-700"}`}>
                    R$ {profit.toFixed(2)}
                  </td>
                  <td className="p-2 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getEfficiencyColor(scenario.efficiency)}`}>
                      {scenario.efficiency.toFixed(0)}%
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getRoiColor(scenario.roi)}`}>
                      {scenario.roi.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-gray-50 rounded border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-2">Legenda</h4>
        <div className="space-y-1 text-sm text-gray-700">
          <p><strong>Eficiência:</strong> Percentual de retorno sobre o custo (Receita / Custo × 100)</p>
          <p><strong>ROI:</strong> Retorno sobre investimento ((Receita - Custo) / Custo × 100)</p>
          <p><strong>Verde:</strong> Altamente lucrativo | <strong>Azul:</strong> Lucrativo | <strong>Amarelo:</strong> Moderado | <strong>Vermelho:</strong> Prejuízo</p>
        </div>
      </div>
    </div>
  );
}
