import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDeveloper } from "@/lib/storage";
import { useState } from "react";

interface AddDeveloperFormProps {
  onDeveloperAdded: () => void;
}

export default function AddDeveloperForm({
  onDeveloperAdded,
}: AddDeveloperFormProps) {
  const [name, setName] = useState("");
  const [monthlyCost, setMonthlyCost] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nome do desenvolvedor é obrigatório");
      return;
    }

    const cost = parseFloat(monthlyCost);
    if (isNaN(cost) || cost < 0) {
      setError("Custo mensal deve ser um número válido");
      return;
    }

    try {
      addDeveloper(name, cost);
      setName("");
      setMonthlyCost("");
      onDeveloperAdded();
    } catch (err) {
      setError("Erro ao adicionar desenvolvedor");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded">
      <h3 className="font-semibold">Adicionar Desenvolvedor</h3>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div>
        <Label htmlFor="dev-name">Nome</Label>
        <Input
          id="dev-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: João Silva"
        />
      </div>

      <div>
        <Label htmlFor="dev-cost">Custo Mensal (R$)</Label>
        <Input
          id="dev-cost"
          type="number"
          step="0.01"
          value={monthlyCost}
          onChange={(e) => setMonthlyCost(e.target.value)}
          placeholder="Ex: 5000"
        />
      </div>

      <Button type="submit" className="w-full">
        Adicionar
      </Button>
    </form>
  );
}
