import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteTask,
  Developer,
  getDevelopers,
  getProducts,
  getTasks,
  Product,
  Task,
  TaskStatus,
  updateTaskStatus,
} from "@/lib/storage";
import { useState } from "react";

interface TasksListProps {
  onTaskDeleted: () => void;
}

export default function TasksList({ onTaskDeleted }: TasksListProps) {
  const tasks = getTasks();
  const developers = getDevelopers();
  const products = getProducts();
  const [filter, setFilter] = useState<string>("all");
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [horasReais, setHorasReais] = useState("");

  const getDeveloperName = (developerId: string) => {
    return developers.find((d) => d.id === developerId)?.name || "Desconhecido";
  };

  const getProductName = (productId: string) => {
    return products.find((p) => p.id === productId)?.name || "Desconhecido";
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta tarefa?")) {
      deleteTask(id);
      onTaskDeleted();
    }
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const dataFim = newStatus === "concluido" ? new Date().toISOString() : "";
    const horas =
      newStatus === "concluido" && horasReais
        ? parseFloat(horasReais)
        : task.horasReais;

    updateTaskStatus(taskId, newStatus, horas, dataFim);
    setUpdatingTaskId(null);
    setHorasReais("");
    onTaskDeleted();
  };

  const filteredTasks =
    filter === "all"
      ? tasks
      : filter.startsWith("dev-")
        ? tasks.filter((t) => t.developerId === filter.substring(4))
        : tasks.filter((t) => t.productId === filter.substring(4));

  const sortedTasks = [...filteredTasks].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "concluido":
        return "bg-green-100 text-green-800";
      case "em_progresso":
        return "bg-blue-100 text-blue-800";
      case "atrasado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case "concluido":
        return "Concluído";
      case "em_progresso":
        return "Em Progresso";
      case "atrasado":
        return "Atrasado";
      default:
        return "Planejado";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-semibold">Filtrar:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full mt-2 p-2 border rounded"
        >
          <option value="all">Todas as tarefas</option>
          <optgroup label="Por Desenvolvedor">
            {developers.map((dev) => (
              <option key={dev.id} value={`dev-${dev.id}`}>
                {dev.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Por Produto">
            {products.map((prod) => (
              <option key={prod.id} value={`prod-${prod.id}`}>
                {prod.name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          Nenhuma tarefa registrada
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <div key={task.id} className="p-4 border rounded space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{task.description}</p>
                  <p className="text-xs text-gray-600">
                    {getDeveloperName(task.developerId)} • {getProductName(task.productId)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-semibold">Tipo:</span> {task.type === "projeto" ? "Projeto" : "Sustentação"}
                </div>
                <div>
                  <span className="font-semibold">Valor:</span> R$ {task.value.toFixed(2)}
                </div>
                <div>
                  <span className="font-semibold">Horas Orçadas:</span> {task.horasOrcadas}h
                </div>
                <div>
                  <span className="font-semibold">Horas Reais:</span> {task.horasReais}h
                </div>
                <div>
                  <span className="font-semibold">Início:</span> {new Date(task.dataInicio).toLocaleDateString("pt-BR")}
                </div>
                <div>
                  <span className="font-semibold">Fim Planejado:</span> {new Date(task.dataFimPlanejada).toLocaleDateString("pt-BR")}
                </div>
              </div>

              {updatingTaskId === task.id ? (
                <div className="space-y-2 mt-3 p-3 bg-gray-50 rounded">
                  <div>
                    <Label htmlFor={`horas-${task.id}`}>Horas Reais</Label>
                    <Input
                      id={`horas-${task.id}`}
                      type="number"
                      step="0.5"
                      value={horasReais}
                      onChange={(e) => setHorasReais(e.target.value)}
                      placeholder={task.horasOrcadas.toString()}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(task.id, "concluido")}
                      className="flex-1"
                    >
                      Concluir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setUpdatingTaskId(null);
                        setHorasReais("");
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 mt-3">
                  {task.status !== "concluido" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setUpdatingTaskId(task.id);
                          setHorasReais(task.horasReais.toString());
                        }}
                        className="flex-1"
                      >
                        {task.status === "em_progresso" ? "Finalizar" : "Iniciar"}
                      </Button>
                      {task.status === "planejado" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(task.id, "em_progresso")}
                          className="flex-1"
                        >
                          Em Progresso
                        </Button>
                      )}
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(task.id)}
                  >
                    Deletar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
