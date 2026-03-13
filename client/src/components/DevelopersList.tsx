import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteDeveloper, updateDeveloper } from "@/lib/storage";
import { Developer } from "@/lib/storage";
import { useState } from "react";

interface DevelopersListProps {
  developers: Developer[];
  onDeveloperUpdated: () => void;
}

export default function DevelopersList({
  developers,
  onDeveloperUpdated,
}: DevelopersListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCost, setEditCost] = useState("");

  const handleEdit = (dev: Developer) => {
    setEditingId(dev.id);
    setEditName(dev.name);
    setEditCost(dev.monthlyCost.toString());
  };

  const handleSave = (id: string) => {
    const cost = parseFloat(editCost);
    if (editName.trim() && !isNaN(cost) && cost >= 0) {
      updateDeveloper(id, editName, cost);
      setEditingId(null);
      onDeveloperUpdated();
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar este desenvolvedor?")) {
      deleteDeveloper(id);
      onDeveloperUpdated();
    }
  };

  if (developers.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Nenhum desenvolvedor cadastrado
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {developers.map((dev) => (
        <div key={dev.id} className="p-4 border rounded">
          {editingId === dev.id ? (
            <div className="space-y-3">
              <div>
                <Label>Nome</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div>
                <Label>Custo Mensal (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editCost}
                  onChange={(e) => setEditCost(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSave(dev.id)}
                  className="flex-1"
                >
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingId(null)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{dev.name}</h4>
                <p className="text-sm text-gray-600">
                  Custo: R$ {dev.monthlyCost.toFixed(2)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(dev)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(dev.id)}
                >
                  Deletar
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
