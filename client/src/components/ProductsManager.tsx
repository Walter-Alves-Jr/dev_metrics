import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addProduct, deleteProduct, updateProduct } from "@/lib/storage";
import { Product } from "@/lib/storage";
import { useState } from "react";

interface ProductsManagerProps {
  products: Product[];
  onProductUpdated: () => void;
}

export default function ProductsManager({
  products,
  onProductUpdated,
}: ProductsManagerProps) {
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      addProduct(newName, newDescription);
      setNewName("");
      setNewDescription("");
      onProductUpdated();
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditName(product.name);
    setEditDescription(product.description || "");
  };

  const handleSave = (id: string) => {
    if (editName.trim()) {
      updateProduct(id, editName, editDescription);
      setEditingId(null);
      onProductUpdated();
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar este produto?")) {
      deleteProduct(id);
      onProductUpdated();
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Product Form */}
      <form onSubmit={handleAddProduct} className="p-4 border rounded bg-blue-50">
        <h3 className="font-semibold mb-3">Adicionar Produto</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="prod-name">Nome do Produto</Label>
            <Input
              id="prod-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: App Mobile"
            />
          </div>
          <div>
            <Label htmlFor="prod-desc">Descrição (opcional)</Label>
            <Input
              id="prod-desc"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Ex: Aplicativo para iOS e Android"
            />
          </div>
          <Button type="submit" className="w-full">
            Adicionar Produto
          </Button>
        </div>
      </form>

      {/* Products List */}
      {products.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          Nenhum produto cadastrado
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="p-4 border rounded">
              {editingId === product.id ? (
                <div className="space-y-3">
                  <div>
                    <Label>Nome</Label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSave(product.id)}
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
                    <h4 className="font-semibold">{product.name}</h4>
                    {product.description && (
                      <p className="text-sm text-gray-600">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(product.id)}
                    >
                      Deletar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
