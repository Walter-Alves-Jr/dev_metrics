import { useState } from "react";
import {
  loadDevelopers,
  loadProjects,
  loadBugs,
  calculateDevCostPerHour,
  calculateProjectROI,
  calculateBugFinancialImpact,
} from "@/lib/integratedMetrics";

export default function ROIDashboard() {
  const developers = loadDevelopers();
  const projects = loadProjects();
  const bugs = loadBugs();

  // Normalizar dados
  const normalizedDevs = developers.map((dev) => ({
    ...dev,
    baseSalary: typeof dev.baseSalary === "string" ? parseFloat(dev.baseSalary) : dev.baseSalary,
  }));

  // Calcular ROI por projeto
  const projectsWithROI = projects.map((project) => {
    const dev = normalizedDevs.find((d) => d.id === project.developerId);
    if (!dev) return { ...project, costPerHour: 0, totalCost: 0, roi: 0, profit: 0, hoursSpent: 0 };

    const costPerHour = calculateDevCostPerHour(dev);
    const hoursSpent = project.hoursActual || project.hoursPlanned;
    const totalCost = hoursSpent * costPerHour;
    const projectValue = project.valuePerHour * hoursSpent;
    const profit = projectValue - totalCost;
    const roi = calculateProjectROI(projectValue, hoursSpent, costPerHour);

    return {
      ...project,
      costPerHour,
      totalCost,
      roi,
      profit,
      hoursSpent,
      projectValue,
    };
  });

  // Calcular impacto de bugs
  const bugsWithImpact = bugs.map((bug) => {
    const dev = normalizedDevs.find((d) => d.id === bug.developerId);
    if (!dev) return { ...bug, costPerHour: 0, financialImpact: 0, hoursSpent: 0 };

    const costPerHour = calculateDevCostPerHour(dev);
    // Calcular horas gastas baseado em data de criação e resolução
    const createdDate = new Date(bug.foundAt);
    const resolvedDate = bug.fixedAt ? new Date(bug.fixedAt) : new Date();
    const hoursSpent = (resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
    const financialImpact = calculateBugFinancialImpact(hoursSpent, costPerHour);

    return {
      ...bug,
      costPerHour,
      financialImpact,
      hoursSpent: Math.max(0, hoursSpent),
    };
  });

  // Calcular totais
  const totalProjectValue = projectsWithROI.reduce((sum, p) => sum + ((p as any).projectValue || 0), 0);
  const totalProjectCost = projectsWithROI.reduce((sum, p) => sum + p.totalCost, 0);
  const totalProjectProfit = projectsWithROI.reduce((sum, p) => sum + p.profit, 0);
  const avgProjectROI = projectsWithROI.length > 0 ? projectsWithROI.reduce((sum, p) => sum + p.roi, 0) / projectsWithROI.length : 0;

  const totalBugCost = bugsWithImpact.reduce((sum, b) => sum + b.financialImpact, 0);

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-green-50 rounded border border-green-200">
          <div className="text-sm text-green-700 font-semibold">Valor Total Projetos</div>
          <div className="text-2xl font-bold text-green-900 mt-1">
            R$ {totalProjectValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="p-4 bg-orange-50 rounded border border-orange-200">
          <div className="text-sm text-orange-700 font-semibold">Custo Total Projetos</div>
          <div className="text-2xl font-bold text-orange-900 mt-1">
            R$ {totalProjectCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className={`p-4 rounded border ${totalProjectProfit >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <div className={`text-sm font-semibold ${totalProjectProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
            Lucro Total
          </div>
          <div className={`text-2xl font-bold mt-1 ${totalProjectProfit >= 0 ? "text-green-900" : "text-red-900"}`}>
            R$ {totalProjectProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className={`p-4 rounded border ${avgProjectROI >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <div className={`text-sm font-semibold ${avgProjectROI >= 0 ? "text-green-700" : "text-red-700"}`}>
            ROI Médio
          </div>
          <div className={`text-2xl font-bold mt-1 ${avgProjectROI >= 0 ? "text-green-900" : "text-red-900"}`}>
            {avgProjectROI.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Projetos com ROI */}
      <div className="bg-white p-6 rounded border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise de Projetos - ROI</h3>
        {projectsWithROI.length === 0 ? (
          <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
            <p className="text-sm text-yellow-800">
              Nenhum projeto cadastrado. Registre projetos na aba "Entrada" para ver análise de ROI.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="p-2 text-left font-semibold text-gray-700">Projeto</th>
                  <th className="p-2 text-right font-semibold text-gray-700">Horas</th>
                  <th className="p-2 text-right font-semibold text-gray-700">Valor/Hora Dev</th>
                  <th className="p-2 text-right font-semibold text-gray-700">Valor Total</th>
                  <th className="p-2 text-right font-semibold text-gray-700">Custo Dev</th>
                  <th className="p-2 text-right font-semibold text-gray-700">Lucro</th>
                  <th className="p-2 text-center font-semibold text-gray-700">ROI</th>
                </tr>
              </thead>
              <tbody>
                {projectsWithROI.map((project) => {
                  return (
                    <tr key={project.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-2 text-gray-900 font-medium">{project.title}</td>
                      <td className="p-2 text-right text-gray-700">{project.hoursSpent.toFixed(1)}h</td>
                      <td className="p-2 text-right text-gray-700">
                        R$ {project.costPerHour.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-right text-gray-700">
                        R$ {((project as any).projectValue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-right text-gray-700">
                        R$ {project.totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`p-2 text-right font-semibold ${project.profit >= 0 ? "text-green-700" : "text-red-700"}`}>
                        R$ {project.profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          project.roi >= 50 ? "bg-green-50 text-green-700" :
                          project.roi >= 0 ? "bg-yellow-50 text-yellow-700" :
                          "bg-red-50 text-red-700"
                        }`}>
                          {project.roi.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bugs - Impacto Financeiro */}
      <div className="bg-white p-6 rounded border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise de Bugs - Impacto Financeiro</h3>
        <div className="p-4 bg-red-50 rounded border border-red-200 mb-4">
          <div className="text-sm text-red-700 font-semibold">Custo Total com Bugs</div>
          <div className="text-2xl font-bold text-red-900 mt-1">
            R$ {totalBugCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-red-600 mt-2">
            Custo acumulado em horas gastas resolvendo bugs (baseado no custo/hora do desenvolvedor)
          </p>
        </div>

        {bugsWithImpact.length === 0 ? (
          <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
            <p className="text-sm text-yellow-800">
              Nenhum bug cadastrado. Registre bugs na aba "Entrada" para ver análise de impacto.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="p-2 text-left font-semibold text-gray-700">Bug</th>
                  <th className="p-2 text-center font-semibold text-gray-700">Severidade</th>
                  <th className="p-2 text-right font-semibold text-gray-700">Horas Gastas</th>
                  <th className="p-2 text-right font-semibold text-gray-700">Valor/Hora Dev</th>
                  <th className="p-2 text-right font-semibold text-gray-700">Impacto Financeiro</th>
                </tr>
              </thead>
              <tbody>
                {bugsWithImpact.map((bug) => {
                  const severityColors: Record<string, string> = {
                    critical: "bg-red-50 text-red-700",
                    high: "bg-orange-50 text-orange-700",
                    medium: "bg-yellow-50 text-yellow-700",
                    low: "bg-green-50 text-green-700",
                  };
                  return (
                    <tr key={bug.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-2 text-gray-900 font-medium">{bug.title}</td>
                      <td className="p-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${severityColors[bug.severity]}`}>
                          {bug.severity.charAt(0).toUpperCase() + bug.severity.slice(1)}
                        </span>
                      </td>
                      <td className="p-2 text-right text-gray-700">{bug.hoursSpent.toFixed(1)}h</td>
                      <td className="p-2 text-right text-gray-700">
                        R$ {bug.costPerHour.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-right font-semibold text-red-700">
                        R$ {bug.financialImpact.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
