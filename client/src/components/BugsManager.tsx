import { Bug, loadBugs, fixBug, deleteBug, loadDevelopers, loadProducts } from "@/lib/integratedMetrics";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BugsManagerProps {
  onDataChanged: () => void;
}

export default function BugsManager({ onDataChanged }: BugsManagerProps) {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const developers = loadDevelopers();
  const products = loadProducts();

  useEffect(() => {
    setBugs(loadBugs());
  }, []);

  const handleFixBug = (id: string, hours: string) => {
    const val = parseFloat(hours) || 0;
    fixBug(id, val);
    setBugs(loadBugs());
    onDataChanged();
    toast.success("Bug corrigido!");
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este bug?")) {
      deleteBug(id);
      setBugs(loadBugs());
      onDataChanged();
      toast.success("Bug removido!");
    }
  };

  const getDevName = (id: string) => developers.find(d => d.id === id)?.name || "Desconhecido";
  const getProductName = (id: string) => products.find(p => p.id === id)?.name || "Desconhecido";

  if (bugs.length === 0) {
    return <div className="text-center p-8 text-gray-500">Nenhum bug encontrado.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-100 text-left">
            <th className="py-3 px-2">Bug</th>
            <th className="py-3 px-2">Dev / Produto</th>
            <th className="py-3 px-2">Status / Severidade</th>
            <th className="py-3 px-2">Horas Gastas</th>
            <th className="py-3 px-2 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {bugs.map((b) => (
            <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-2">
                <p className="font-semibold text-gray-900">{b.title}</p>
                <p className="text-[10px] text-gray-400">Encontrado em: {new Date(b.foundAt).toLocaleDateString()}</p>
              </td>
              <td className="py-3 px-2">
                <p className="text-gray-700">{getDevName(b.developerId)}</p>
                <p className="text-xs text-blue-600">{getProductName(b.productId)}</p>
              </td>
              <td className="py-3 px-2">
                <div className="flex flex-col gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                    b.fixedAt ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {b.fixedAt ? "Corrigido" : "Aberto"}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                    b.severity === "critical" ? "bg-red-600 text-white" :
                    b.severity === "high" ? "bg-orange-100 text-orange-700" :
                    b.severity === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {b.severity.toUpperCase()}
                  </span>
                </div>
              </td>
              <td className="py-3 px-2">
                {!b.fixedAt ? (
                  <div className="flex items-center gap-2">
                    <input 
                      id={`hours-${b.id}`}
                      type="number"
                      placeholder="h"
                      className="w-16 border rounded px-1 py-1 text-xs"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => {
                        const input = document.getElementById(`hours-${b.id}`) as HTMLInputElement;
                        handleFixBug(b.id, input.value);
                      }}
                      className="h-7 px-2 text-[10px] bg-green-600 hover:bg-green-700"
                    >
                      Corrigir
                    </Button>
                  </div>
                ) : (
                  <span className="text-gray-700 font-semibold">{b.hoursSpent || 0} horas</span>
                )}
              </td>
              <td className="py-3 px-2 text-right">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDelete(b.id)}
                  className="h-7 px-2 text-[10px]"
                >
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
