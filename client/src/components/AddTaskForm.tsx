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
import { addTask } from "@/lib/storage";
import { Developer } from "@/lib/storage";
import { useState } from "react";

interface AddTaskFormProps {
  developers: Developer[];
  onTaskAdded: () => void;
}

export default function AddTaskForm({
  developers,
  onTaskAdded,
}: AddTaskFormProps) {
  const [developerId, setDeveloperId] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!developerId) {
      setError("Selecione um desenvolvedor");
      return;
    }

    if (!description.trim()) {
      setError("Descrição da tarefa é obrigatória");
      return;
    }

    const taskValue = parseFloat(value);
    if (isNaN(taskValue) || taskValue < 0) {
      setError("Valor deve ser um número válido");
      return;
    }

    try {
      addTask(developerId, description, taskValue);
      setDeveloperId("");
      setDescription("");
      setValue("");
      onTaskAdded();
    } catch (err) {
      setError("Erro ao adicionar tarefa");
    }
  };

  if (developers.length === 0) {
    return (
      <div className="p-4 border rounded bg-yellow-50 text-yellow-800">
        Adicione um desenvolvedor primeiro para registrar tarefas.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded">
      <h3 className="font-semibold">Registrar Tarefa</h3>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div>
        <Label htmlFor="task-dev">Desenvolvedor</Label>
        <Select value={developerId} onValueChange={setDeveloperId}>
          <SelectTrigger id="task-dev">
            <SelectValue placeholder="Selecione um desenvolvedor" />
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
        <Label htmlFor="task-desc">Descrição da Tarefa</Label>
        <Input
          id="task-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Implementar autenticação"
        />
      </div>

      <div>
        <Label htmlFor="task-value">Valor Agregado (R$)</Label>
        <Input
          id="task-value"
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ex: 2000"
        />
      </div>

      <Button type="submit" className="w-full">
        Registrar Tarefa
      </Button>
    </form>
  );
}
