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
import { addTask, Developer, Product, TaskType } from "@/lib/storage";
import { useState } from "react";

interface AddTaskFormProps {
  developers: Developer[];
  products: Product[];
  onTaskAdded: () => void;
}

export default function AddTaskForm({
  developers,
  products,
  onTaskAdded,
}: AddTaskFormProps) {
  const [developerId, setDeveloperId] = useState("");
  const [productId, setProductId] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TaskType>("projeto");
  const [value, setValue] = useState("");
  const [horasOrcadas, setHorasOrcadas] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFimPlanejada, setDataFimPlanejada] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!developerId) {
      setError("Selecione um desenvolvedor");
      return;
    }

    if (!productId) {
      setError("Selecione um produto");
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

    const horas = parseFloat(horasOrcadas);
    if (isNaN(horas) || horas < 0) {
      setError("Horas orçadas deve ser um número válido");
      return;
    }

    if (!dataInicio) {
      setError("Data de início é obrigatória");
      return;
    }

    if (!dataFimPlanejada) {
      setError("Data de fim planejada é obrigatória");
      return;
    }

    try {
      addTask(
        developerId,
        productId,
        description,
        type,
        taskValue,
        horas,
        dataInicio,
        dataFimPlanejada
      );
      setDeveloperId("");
      setProductId("");
      setDescription("");
      setType("projeto");
      setValue("");
      setHorasOrcadas("");
      setDataInicio("");
      setDataFimPlanejada("");
      onTaskAdded();
    } catch (err) {
      setError("Erro ao adicionar tarefa");
    }
  };

  if (developers.length === 0 || products.length === 0) {
    return (
      <div className="p-4 border rounded bg-yellow-50 text-yellow-800">
        Adicione um desenvolvedor e um produto primeiro para registrar tarefas.
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
        <Label htmlFor="task-product">Produto</Label>
        <Select value={productId} onValueChange={setProductId}>
          <SelectTrigger id="task-product">
            <SelectValue placeholder="Selecione um produto" />
          </SelectTrigger>
          <SelectContent>
            {products.map((prod) => (
              <SelectItem key={prod.id} value={prod.id}>
                {prod.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="task-type">Tipo de Tarefa</Label>
        <Select value={type} onValueChange={(val) => setType(val as TaskType)}>
          <SelectTrigger id="task-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="projeto">Projeto</SelectItem>
            <SelectItem value="sustentacao">Sustentação</SelectItem>
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

      <div>
        <Label htmlFor="task-horas">Horas Orçadas</Label>
        <Input
          id="task-horas"
          type="number"
          step="0.5"
          value={horasOrcadas}
          onChange={(e) => setHorasOrcadas(e.target.value)}
          placeholder="Ex: 40"
        />
      </div>

      <div>
        <Label htmlFor="task-inicio">Data de Início</Label>
        <Input
          id="task-inicio"
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="task-fim">Data de Fim Planejada</Label>
        <Input
          id="task-fim"
          type="date"
          value={dataFimPlanejada}
          onChange={(e) => setDataFimPlanejada(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full">
        Registrar Tarefa
      </Button>
    </form>
  );
}
