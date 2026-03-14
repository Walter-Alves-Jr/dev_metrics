import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { getDevelopers, getMetricas, getMetricasPorProduto } from "@/lib/storage";
import { getBugTracking } from "@/lib/bugTracking";
import { useState } from "react";

export default function ExportReports() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const developers = getDevelopers();
      const metricas = getMetricas();
      const metricasProduto = getMetricasPorProduto();
      const bugTracking = getBugTracking();

      let csv = "RELATÓRIO DE MÉTRICAS - DEV METRICS\n";
      csv += `Data: ${new Date().toLocaleDateString("pt-BR")}\n\n`;

      // Seção de Desenvolvedores
      csv += "=== MÉTRICAS POR DESENVOLVEDOR ===\n";
      csv += "Nome,Custo Mensal,Total Tarefas,Projetos,Sustentação,Valor Total,ROI,Produtividade (R$/h),Eficiência (%)\n";
      metricas.forEach((m) => {
        csv += `"${m.developerName}",${m.monthlyCost},${m.taskCount},${m.projectCount},${m.maintenanceCount},${m.totalValue},${m.roi}%,${m.produtividade},${m.eficiencia}%\n`;
      });

      csv += "\n=== MÉTRICAS POR PRODUTO ===\n";
      csv += "Produto,Devs Alocados,Total Tarefas,Projetos,Sustentação,Valor Total,ROI Projetos (%),Custo/h Sustentação,Tempo Médio Sustentação (h)\n";
      metricasProduto.forEach((m) => {
        csv += `"${m.productName}",${m.devCount},${m.taskCount},${m.projectCount},${m.maintenanceCount},${m.totalValue},${m.projectROI}%,${m.maintenanceCostPerHour},${m.maintenanceAvgTime}\n`;
      });

      csv += "\n=== RASTREAMENTO DE BUGS/PROJETOS ===\n";
      csv += "Tipo,Título,Desenvolvedor,Produto,Data Início,Target HML,Target PRD,Status\n";
      bugTracking.forEach((item) => {
        const dev = developers.find((d) => d.id === item.developerId)?.name || "Desconhecido";
        csv += `"${item.type}","${item.title}","${dev}","${item.productId}","${item.dataInicio}","${item.targetHML}","${item.targetPRD}","${item.status}"\n`;
      });

      // Criar blob e download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `dev-metrics-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      alert("Erro ao exportar relatório");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = () => {
    setIsExporting(true);
    try {
      const metricas = getMetricas();
      const metricasProduto = getMetricasPorProduto();

      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Dev Metrics - Relatório</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background-color: #F5F7FA; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2563EB; padding-bottom: 20px; }
            h1 { color: #111827; margin: 0; }
            .date { color: #6B7280; font-size: 12px; }
            h2 { color: #2563EB; margin-top: 30px; margin-bottom: 15px; border-left: 4px solid #F97316; padding-left: 10px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #FFFFFF; }
            th { background-color: #2563EB; color: #FFFFFF; padding: 10px; text-align: left; font-weight: bold; }
            td { padding: 8px; border-bottom: 1px solid #E5E7EB; }
            tr:nth-child(even) { background-color: #F5F7FA; }
            .positive { color: #22C55E; font-weight: bold; }
            .warning { color: #F59E0B; font-weight: bold; }
            .negative { color: #EF4444; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Dev Metrics - Relatório de Métricas</h1>
            <div class="date">Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</div>
          </div>

          <h2>Métricas por Desenvolvedor</h2>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Custo Mensal</th>
                <th>Total Tarefas</th>
                <th>Projetos</th>
                <th>Sustentação</th>
                <th>Valor Total</th>
                <th>ROI</th>
                <th>Produtividade</th>
              </tr>
            </thead>
            <tbody>
              ${metricas
                .map(
                  (m) => `
                <tr>
                  <td>${m.developerName}</td>
                  <td>R$ ${m.monthlyCost.toFixed(2)}</td>
                  <td>${m.taskCount}</td>
                  <td>${m.projectCount}</td>
                  <td>${m.maintenanceCount}</td>
                  <td>R$ ${m.totalValue.toFixed(2)}</td>
                  <td class="${m.roi >= 100 ? "positive" : m.roi >= 50 ? "warning" : "negative"}">${m.roi.toFixed(2)}%</td>
                  <td>R$ ${m.produtividade.toFixed(2)}/h</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <h2>Métricas por Produto</h2>
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Devs</th>
                <th>Tarefas</th>
                <th>Projetos</th>
                <th>Sustentação</th>
                <th>Valor Total</th>
                <th>ROI Projetos</th>
                <th>Custo/h Sust.</th>
              </tr>
            </thead>
            <tbody>
              ${metricasProduto
                .map(
                  (m) => `
                <tr>
                  <td>${m.productName}</td>
                  <td>${m.devCount}</td>
                  <td>${m.taskCount}</td>
                  <td>${m.projectCount}</td>
                  <td>${m.maintenanceCount}</td>
                  <td>R$ ${m.totalValue.toFixed(2)}</td>
                  <td class="${m.projectROI >= 100 ? "positive" : m.projectROI >= 50 ? "warning" : "negative"}">${m.projectROI.toFixed(2)}%</td>
                  <td>R$ ${m.maintenanceCostPerHour.toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="footer">
            <p>Este relatório foi gerado automaticamente pelo sistema Dev Metrics</p>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `dev-metrics-${new Date().toISOString().split("T")[0]}.html`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Erro ao exportar relatório");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={exportToCSV}
        disabled={isExporting}
        className="flex items-center gap-2"
        style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
      >
        <Download className="w-4 h-4" />
        Exportar CSV
      </Button>
      <Button
        onClick={exportToPDF}
        disabled={isExporting}
        className="flex items-center gap-2"
        style={{ backgroundColor: "#F97316", color: "#FFFFFF" }}
      >
        <Download className="w-4 h-4" />
        Exportar HTML
      </Button>
    </div>
  );
}
