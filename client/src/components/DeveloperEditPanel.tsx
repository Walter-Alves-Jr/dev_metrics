import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  loadDevelopers,
  updateMonthlyCost,
  calculateOnCallHourValue,
  calculateOvertimeHourValue,
  calculateRealDevCost,
} from "@/lib/integratedMetrics";
import { Developer } from "@/lib/integratedMetrics";

export default function DeveloperEditPanel() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [selectedDevId, setSelectedDevId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [onCallHours, setOnCallHours] = useState("");
  const [overtimeHours, setOvertimeHours] = useState("");

  useEffect(() => {
    setDevelopers(loadDevelopers());
  }, []);

  const selectedDev = developers.find((d) => d.id === selectedDevId);

  const handleSaveMonthlyCost = () => {
    if (!selectedDevId || !selectedMonth) {
      toast.error("Selecione desenvolvedor e mês");
      return;
    }

    const onCall = parseFloat(onCallHours) || 0;
    const overtime = parseFloat(overtimeHours) || 0;

    updateMonthlyCost(selectedDevId, selectedMonth, onCall, overtime);
    toast.success("Dados salvos!");
    setDevelopers(loadDevelopers());
    setOnCallHours("");
    setOvertimeHours("");
  };

  const handleSelectDev = (devId: string) => {
    setSelectedDevId(devId);
    const dev = developers.find((d) => d.id === devId);
    if (dev) {
      const monthlyCost = dev.monthlyCosts.find((mc) => mc.month === selectedMonth);
      if (monthlyCost) {
        setOnCallHours(monthlyCost.onCallHours.toString());
        setOvertimeHours(monthlyCost.overtimeHours.toString());
      } else {
        setOnCallHours("");
        setOvertimeHours("");
      }
    }
  };

  const handleSelectMonth = (month: string) => {
    setSelectedMonth(month);
    if (selectedDevId) {
      const dev = developers.find((d) => d.id === selectedDevId);
      if (dev) {
        const monthlyCost = dev.monthlyCosts.find((mc) => mc.month === month);
        if (monthlyCost) {
          setOnCallHours(monthlyCost.onCallHours.toString());
          setOvertimeHours(monthlyCost.overtimeHours.toString());
        } else {
          setOnCallHours("");
          setOvertimeHours("");
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Seleção de Dev */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#111827" }}>
            Desenvolvedor
          </label>
          <select
            value={selectedDevId}
            onChange={(e) => handleSelectDev(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            style={{ borderColor: "#E5E7EB" }}
          >
            <option value="">Selecione...</option>
            {developers.map((dev) => (
              <option key={dev.id} value={dev.id}>
                {dev.name} (R$ {dev.baseSalary.toLocaleString("pt-BR")}/mês)
              </option>
            ))}
          </select>
        </div>

        {/* Seleção de Mês */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#111827" }}>
            Mês
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => handleSelectMonth(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            style={{ borderColor: "#E5E7EB" }}
          />
        </div>
      </div>

      {selectedDev && (
        <div className="space-y-4 p-4 rounded" style={{ backgroundColor: "#F5F7FA" }}>
          {/* Informações de Cálculo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p style={{ color: "#6B7280" }}>Valor hora sobreaviso:</p>
              <p className="font-semibold" style={{ color: "#2563EB" }}>
                R${" "}
                {calculateOnCallHourValue(selectedDev.baseSalary).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p style={{ color: "#6B7280" }}>Valor hora extra:</p>
              <p className="font-semibold" style={{ color: "#2563EB" }}>
                R${" "}
                {calculateOvertimeHourValue(selectedDev.baseSalary).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {/* Inputs de Horas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#111827" }}>
                Horas de Sobreaviso
              </label>
              <input
                type="number"
                value={onCallHours}
                onChange={(e) => setOnCallHours(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border rounded"
                style={{ borderColor: "#E5E7EB" }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#111827" }}>
                Horas Extras
              </label>
              <input
                type="number"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border rounded"
                style={{ borderColor: "#E5E7EB" }}
              />
            </div>
          </div>

          {/* Resumo de Custo */}
          {(parseFloat(onCallHours) > 0 || parseFloat(overtimeHours) > 0) && (
            <div
              className="p-3 rounded"
              style={{ backgroundColor: "#FFFFFF", borderLeft: "4px solid #2563EB" }}
            >
              <p className="text-sm font-semibold mb-2" style={{ color: "#111827" }}>
                Resumo do Mês
              </p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p style={{ color: "#6B7280" }}>Sobreaviso:</p>
                  <p className="font-semibold">
                    R${" "}
                    {(
                      calculateOnCallHourValue(selectedDev.baseSalary) * parseFloat(onCallHours || "0")
                    ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p style={{ color: "#6B7280" }}>Horas Extras:</p>
                  <p className="font-semibold">
                    R${" "}
                    {(
                      calculateOvertimeHourValue(selectedDev.baseSalary) *
                      parseFloat(overtimeHours || "0")
                    ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p style={{ color: "#6B7280" }}>Custo Total (com CLT 1.7x):</p>
                  <p className="font-semibold" style={{ color: "#22C55E" }}>
                    R${" "}
                    {calculateRealDevCost(selectedDev, selectedMonth).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleSaveMonthlyCost} className="w-full">
            Salvar Dados do Mês
          </Button>
        </div>
      )}

      {/* Histórico do Dev Selecionado */}
      {selectedDev && selectedDev.monthlyCosts.length > 0 && (
        <div className="p-4 rounded" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          <h3 className="font-semibold mb-3" style={{ color: "#111827" }}>
            Histórico de {selectedDev.name}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "2px solid #E5E7EB" }}>
                  <th className="text-left py-2 px-2" style={{ color: "#6B7280" }}>
                    Mês
                  </th>
                  <th className="text-right py-2 px-2" style={{ color: "#6B7280" }}>
                    Sobreaviso (h)
                  </th>
                  <th className="text-right py-2 px-2" style={{ color: "#6B7280" }}>
                    Extras (h)
                  </th>
                  <th className="text-right py-2 px-2" style={{ color: "#6B7280" }}>
                    Custo Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedDev.monthlyCosts.map((mc) => (
                  <tr key={mc.month} style={{ borderBottom: "1px solid #E5E7EB" }}>
                    <td className="py-2 px-2">{mc.month}</td>
                    <td className="text-right py-2 px-2">{mc.onCallHours}</td>
                    <td className="text-right py-2 px-2">{mc.overtimeHours}</td>
                    <td className="text-right py-2 px-2 font-semibold" style={{ color: "#2563EB" }}>
                      R${" "}
                      {calculateRealDevCost(selectedDev, mc.month).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
