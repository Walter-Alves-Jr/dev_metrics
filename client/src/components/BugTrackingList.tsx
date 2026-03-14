import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { BugTrackingItem, deleteBugTracking } from "@/lib/bugTracking";
import { getDevelopers, getProducts } from "@/lib/storage";

interface BugTrackingListProps {
  items: BugTrackingItem[];
  onItemDeleted: () => void;
}

export default function BugTrackingList({ items, onItemDeleted }: BugTrackingListProps) {
  const developers = getDevelopers();
  const products = getProducts();

  const getDeveloperName = (id: string) => {
    return developers.find((d) => d.id === id)?.name || "Desconhecido";
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
      {items.map((item) => (
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

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm mb-2">
            {item.type === "bug" && item.dataBug && (
              <div>
                <p className="text-gray-600">Data BUG</p>
                <p className="font-semibold">{formatDate(item.dataBug)}</p>
              </div>
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
        </div>
      ))}
    </div>
  );
}
