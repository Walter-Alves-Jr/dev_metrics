import { Button } from "@/components/ui/button";
import { deleteTask, getDevelopers, getTasks, Task } from "@/lib/storage";
import { useState } from "react";

interface TasksListProps {
  onTaskDeleted: () => void;
}

export default function TasksList({ onTaskDeleted }: TasksListProps) {
  const tasks = getTasks();
  const developers = getDevelopers();
  const [filter, setFilter] = useState<string>("all");

  const getDeveloperName = (developerId: string) => {
    return developers.find((d) => d.id === developerId)?.name || "Desconhecido";
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta tarefa?")) {
      deleteTask(id);
      onTaskDeleted();
    }
  };

  const filteredTasks =
    filter === "all"
      ? tasks
      : tasks.filter((t) => t.developerId === filter);

  const sortedTasks = [...filteredTasks].sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-semibold">Filtrar por desenvolvedor:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full mt-2 p-2 border rounded"
        >
          <option value="all">Todas as tarefas</option>
          {developers.map((dev) => (
            <option key={dev.id} value={dev.id}>
              {dev.name}
            </option>
          ))}
        </select>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          Nenhuma tarefa registrada
        </div>
      ) : (
        <div className="space-y-2">
          {sortedTasks.map((task) => (
            <div key={task.id} className="p-3 border rounded flex justify-between items-start">
              <div className="flex-1">
                <p className="font-semibold text-sm">{task.description}</p>
                <p className="text-xs text-gray-600">
                  {getDeveloperName(task.developerId)} • R${" "}
                  {task.value.toFixed(2)} • {new Date(task.completedAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(task.id)}
              >
                Deletar
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
