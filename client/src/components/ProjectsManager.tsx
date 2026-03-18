import { Project, loadProjects, updateProjectStatus, updateProjectHours, deleteProject, loadDevelopers, loadProducts } from "@/lib/integratedMetrics";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProjectsManagerProps {
  onDataChanged: () => void;
}

export default function ProjectsManager({ onDataChanged }: ProjectsManagerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const developers = loadDevelopers();
  const products = loadProducts();

  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  const handleStatusChange = (id: string, status: Project["status"]) => {
    updateProjectStatus(id, status);
    setProjects(loadProjects());
    onDataChanged();
    toast.success("Status atualizado!");
  };

  const handleHoursChange = (id: string, hours: string) => {
    const val = parseFloat(hours) || 0;
    updateProjectHours(id, val);
    setProjects(loadProjects());
    onDataChanged();
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este projeto?")) {
      deleteProject(id);
      setProjects(loadProjects());
      onDataChanged();
      toast.success("Projeto removido!");
    }
  };

  const getDevName = (id: string) => developers.find(d => d.id === id)?.name || "Desconhecido";
  const getProductName = (id: string) => products.find(p => p.id === id)?.name || "Desconhecido";

  if (projects.length === 0) {
    return <div className="text-center p-8 text-gray-500">Nenhum projeto encontrado.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-100 text-left">
            <th className="py-3 px-2">Projeto</th>
            <th className="py-3 px-2">Dev / Produto</th>
            <th className="py-3 px-2">Status</th>
            <th className="py-3 px-2">Horas (Real/Plan)</th>
            <th className="py-3 px-2 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-2">
                <p className="font-semibold text-gray-900">{p.title}</p>
                <p className="text-[10px] text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</p>
              </td>
              <td className="py-3 px-2">
                <p className="text-gray-700">{getDevName(p.developerId)}</p>
                <p className="text-xs text-blue-600">{getProductName(p.productId)}</p>
              </td>
              <td className="py-3 px-2">
                <select 
                  value={p.status}
                  onChange={(e) => handleStatusChange(p.id, e.target.value as Project["status"])}
                  className="bg-white border rounded px-2 py-1 text-xs"
                >
                  <option value="backlog">Backlog</option>
                  <option value="dev">Dev</option>
                  <option value="review">Review</option>
                  <option value="deploy">Deploy</option>
                  <option value="done">Concluído</option>
                </select>
              </td>
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    value={p.hoursActual || 0}
                    onChange={(e) => handleHoursChange(p.id, e.target.value)}
                    className="w-16 border rounded px-1 py-1 text-xs"
                  />
                  <span className="text-gray-400">/ {p.hoursPlanned}h</span>
                </div>
              </td>
              <td className="py-3 px-2 text-right">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDelete(p.id)}
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
