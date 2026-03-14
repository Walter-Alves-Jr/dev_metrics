import { useState } from "react";
import { Developer, getDevelopers } from "@/lib/storage";
import { getBugTracking } from "@/lib/bugTracking";
import { calcularMetricasDesenvolvedorMensal } from "@/lib/monthlyMetrics";
import { getSettings } from "@/lib/bugTracking";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MonthlyMetricsDashboard() {
  const developers = getDevelopers();
  const projetos = getBugTracking();
  const settings = getSettings();

  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [selectedDevId, setSelectedDevId] = useState(developers[0]?.id || "");

  if (!selectedDevId || developers.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Nenhum desenvolvedor cadastrado
      </div>
    );
  }

  const selectedDev = developers.find((d) => d.id === selectedDevId);
  if (!selectedDev) return null;

  const metricas = calcularMetricasDesenvolvedorMensal(
    selectedDev,
    projetos,
    settings.hourlyRate,
    mes,
    ano
  );

  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const anos = [];
  for (let i = 2024; i <= 2027; i++) {
    anos.push(i);
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-700">
            Desenvolvedor
          </label>
          <Select value={selectedDevId} onValueChange={setSelectedDevId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {developers.map((dev) => (
                <SelectItem key={dev.id} value={dev.id}>
                  {dev.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Mês</label>
          <Select value={mes.toString()} onValueChange={(v) => setMes(parseInt(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {meses.map((m, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Ano</label>
          <Select value={ano.toString()} onValueChange={(v) => setAno(parseInt(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {anos.map((a) => (
                <SelectItem key={a} value={a.toString()}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">
            Valor/Hora
          </label>
          <div className="px-3 py-2 border rounded bg-gray-50 text-sm font-semibold">
            R$ {settings.hourlyRate.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">
          {meses[mes - 1]} de {ano}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <div>
            <p className="text-blue-700">Salário Mensal</p>
            <p className="font-semibold text-blue-900">
              R$ {metricas.salarioMensal.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-blue-700">Custo Projetos</p>
            <p className="font-semibold text-blue-900">
              R$ {metricas.custoProjetos.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-blue-700">% do Salário</p>
            <p
              className={`font-semibold ${
                metricas.percentualSalario <= 100
                  ? "text-green-700"
                  : metricas.percentualSalario <= 120
                    ? "text-orange-700"
                    : "text-red-700"
              }`}
            >
              {metricas.percentualSalario.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-blue-700">Dias Úteis</p>
            <p className="font-semibold text-blue-900">{metricas.diasUteis}</p>
          </div>
          <div>
            <p className="text-blue-700">Projetos</p>
            <p className="font-semibold text-blue-900">
              {metricas.projetos.length}
            </p>
          </div>
        </div>
      </div>

      {metricas.projetos.length === 0 ? (
        <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
          <p className="text-sm text-yellow-800">
            Nenhum projeto neste período para este desenvolvedor.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="p-2 text-left font-semibold text-gray-700">
                  Projeto
                </th>
                <th className="p-2 text-right font-semibold text-gray-700">
                  Período
                </th>
                <th className="p-2 text-right font-semibold text-gray-700">
                  Dias
                </th>
                <th className="p-2 text-right font-semibold text-gray-700">
                  Horas
                </th>
                <th className="p-2 text-right font-semibold text-gray-700">
                  Valor Total
                </th>
                <th className="p-2 text-right font-semibold text-gray-700">
                  Custo Diário
                </th>
                <th className="p-2 text-right font-semibold text-gray-700">
                  Custo Mensal
                </th>
                <th className="p-2 text-center font-semibold text-gray-700">
                  Eficiência
                </th>
              </tr>
            </thead>
            <tbody>
              {metricas.projetos.map((proj) => (
                <tr key={proj.projectId} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-2 text-gray-900">
                    <span className="text-xs mr-1">
                      {proj.projectType === "bug" ? "🐛" : "📋"}
                    </span>
                    {proj.projectTitle}
                  </td>
                  <td className="p-2 text-right text-gray-700 text-xs">
                    {formatDate(proj.dataInicio)} a {formatDate(proj.dataFim)}
                  </td>
                  <td className="p-2 text-right text-gray-700">
                    {proj.diasUteis}d ({proj.diasTotais}t)
                  </td>
                  <td className="p-2 text-right text-gray-700">
                    {proj.horasOrcadas}h
                    {proj.horasReais !== proj.horasOrcadas && (
                      <span className="text-xs text-orange-600">
                        {" "}
                        ({proj.horasReais}r)
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-right text-gray-700">
                    R$ {proj.valorTotal.toFixed(2)}
                  </td>
                  <td className="p-2 text-right text-gray-700">
                    R$ {proj.custoDiario.toFixed(2)}
                  </td>
                  <td className="p-2 text-right font-semibold text-gray-900">
                    R$ {proj.custoMensal.toFixed(2)}
                  </td>
                  <td className="p-2 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        proj.eficiencia <= 100
                          ? "bg-green-50 text-green-700"
                          : "bg-orange-50 text-orange-700"
                      }`}
                    >
                      {proj.eficiencia.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-4 bg-gray-50 rounded border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-2">Como funciona</h4>
        <div className="space-y-1 text-sm text-gray-700">
          <p>
            <strong>Valor Total:</strong> Horas Orçadas × Valor/Hora
          </p>
          <p>
            <strong>Custo Diário:</strong> Valor Total ÷ Dias Totais do Período
          </p>
          <p>
            <strong>Custo Mensal:</strong> Custo Diário × Dias Úteis (seg-sex) no Período
          </p>
          <p>
            <strong>% do Salário:</strong> (Custo Projetos ÷ Salário Mensal) × 100
          </p>
          <p>
            <strong>Eficiência:</strong> (Horas Reais ÷ Horas Orçadas) × 100
          </p>
        </div>
      </div>
    </div>
  );
}
