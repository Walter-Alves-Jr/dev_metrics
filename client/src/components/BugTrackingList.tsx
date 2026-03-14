import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { BugTrackingItem, deleteBugTracking, getSettings } from "@/lib/bugTracking";
import { getDevelopers, getProducts } from "@/lib/storage";

interface BugTrackingListProps {
  items: BugTrackingItem[];
  onItemDeleted: () => void;
}

export default function BugTrackingList({ items, onItemDeleted }: BugTrackingListProps) {
  const developers = getDevelopers();
  const products = getProducts();
  const settings = getSettings();

  const getDeveloperName = (id: string) => {
    return developers.find((d) => d.id === id)?.name || "Desconhecido";
  };

  const getDeveloperCost = (id: string) => {
    return developers.find((d) => d.id === id)?.monthlyCost || 0;
  };

  const getProductName = (id: string) => {
    return products.find((p) => p.id === id)?.name || "Desconhecido";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planejado: "bg-blue-50 text-blue-700 border-blue-200",
      em_progresso: "bg-yellow-50 text-yellow-700 border-yellow-200",
      hml: "bg-purple-50 text-purple-700 border-purple-200",
      prd: "bg-green-50 text-green-700 border-green-200",
      concluido: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colors[status] || "bg-gray-50 text-gray-700";
  };

  const getTypeLabel = (type: string) => {
    return type === "bug" ? "🐛 BUG" : "📋 Projeto";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const calculateBugAnalysis = (item: BugTrackingItem) => {
    if (item.type !== "bug" || !item.dataBug) return null;
    
    const devCost = getDeveloperCost(item.developerId);
    const costPerHour = devCost / 160; // 160 horas por mês (22 dias * 8 horas)
    
    // Calcular tempo entre data do BUG e resolução (ou hoje se não resolvido)
    const bugDate = new Date(item.dataBug);
    const resolutionDate = item.dataResolucao ? new Date(item.dataResolucao) : new Date();
    const timeDiffMs = resolutionDate.getTime() - bugDate.getTime();
    const horasDecorridas = timeDiffMs / (1000 * 60 * 60); // Converter ms para horas
    const diasDecorridos = horasDecorridas / 24;
    
    // Custo = horas decorridas * custo por hora
    const totalCost = horasDecorridas * costPerHour;
    
    // Receita = horas gastas (se informado) ou horas decorridas * valor da hora
    const horasParaReceita = item.horasGastas || horasDecorridas;
    const revenue = horasParaReceita * (settings.hourlyRate / 100);
    
    const profit = revenue - totalCost;
    const roi = totalCost > 0 ? ((profit / totalCost) * 100) : 0;

    return {
      diasDecorridos: diasDecorridos.toFixed(1),
      horasDecorridas: horasDecorridas.toFixed(1),
      costPerHour: costPerHour.toFixed(2),
      totalCost: totalCost.toFixed(2),
      revenue: revenue.toFixed(2),
      profit: profit.toFixed(2),
      roi: roi.toFixed(0),
    };
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar este item?")) {
      deleteBugTracking(id);
      onItemDeleted();
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Nenhum bug ou projeto registrado
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const bugAnalysis = calculateBugAnalysis(item);
        
        return (
          <div key={item.id} className="p-4 border rounded bg-white">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{getTypeLabel(item.type)}</span>
                  <h4 className="font-semibold text-lg">{item.title}</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Dev: <span className="font-medium">{getDeveloperName(item.developerId)}</span> | 
                  Produto: <span className="font-medium">{getProductName(item.productId)}</span>
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm mb-2">
              {item.type === "bug" && item.dataBug && (
                <>
                  <div>
                    <p className="text-gray-600">Data BUG</p>
                    <p className="font-semibold">{formatDate(item.dataBug)}</p>
                  </div>
                  {item.dataResolucao && (
                    <div>
                      <p className="text-gray-600">Data Resolução</p>
                      <p className="font-semibold">{formatDate(item.dataResolucao)}</p>
                    </div>
                  )}
                </>
              )}
              <div>
                <p className="text-gray-600">Início</p>
                <p className="font-semibold">{formatDate(item.dataInicio)}</p>
              </div>
              <div>
                <p className="text-gray-600">Target HML</p>
                <p className="font-semibold">{formatDate(item.targetHML)}</p>
              </div>
              <div>
                <p className="text-gray-600">Target PRD</p>
                <p className="font-semibold">{formatDate(item.targetPRD)}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(item.status)}`}>
                  {item.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
            </div>

            {/* Análise de BUG */}
            {bugAnalysis && (
              <div className="mt-3 p-3 bg-orange-50 rounded border border-orange-200">
                <p className="text-xs font-semibold text-orange-900 mb-2">
                  Análise de Custo vs Retorno (Tempo: {bugAnalysis.diasDecorridos} dias / {bugAnalysis.horasDecorridas}h)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  <div>
                    <p className="text-orange-700">Custo/h Dev</p>
                    <p className="font-semibold text-orange-900">R$ {bugAnalysis.costPerHour}</p>
                  </div>
                  <div>
                    <p className="text-orange-700">Custo Total</p>
                    <p className="font-semibold text-orange-900">R$ {bugAnalysis.totalCost}</p>
                  </div>
                  <div>
                    <p className="text-orange-700">Receita</p>
                    <p className="font-semibold text-orange-900">R$ {bugAnalysis.revenue}</p>
                  </div>
                  <div>
                    <p className="text-orange-700">Lucro</p>
                    <p className={`font-semibold ${parseFloat(bugAnalysis.profit) >= 0 ? "text-green-700" : "text-red-700"}`}>
                      R$ {bugAnalysis.profit}
                    </p>
                  </div>
                  <div>
                    <p className="text-orange-700">ROI</p>
                    <p className={`font-semibold ${parseFloat(bugAnalysis.roi) >= 0 ? "text-green-700" : "text-red-700"}`}>
                      {bugAnalysis.roi}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
