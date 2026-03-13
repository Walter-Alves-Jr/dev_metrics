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
import { addDeveloper, Product } from "@/lib/storage";
import { useState } from "react";

interface AddDeveloperFormProps {
  products: Product[];
  onDeveloperAdded: () => void;
}

export default function AddDeveloperForm({
  products,
  onDeveloperAdded,
}: AddDeveloperFormProps) {
  const [name, setName] = useState("");
  const [monthlyCost, setMonthlyCost] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
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
      addDeveloper(name, cost, selectedProducts);
      setName("");
      setMonthlyCost("");
      setSelectedProducts([]);
      onDeveloperAdded();
    } catch (err) {
      setError("Erro ao adicionar desenvolvedor");
    }
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
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

      <div>
        <Label>Produtos (selecione um ou mais)</Label>
        {products.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum produto cadastrado</p>
        ) : (
          <div className="space-y-2 mt-2">
            {products.map((product) => (
              <label key={product.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => toggleProduct(product.id)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{product.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full">
        Adicionar
      </Button>
    </form>
  );
}
