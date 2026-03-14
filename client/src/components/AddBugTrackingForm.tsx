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
import { Developer, Product } from "@/lib/storage";
import { addBugTracking } from "@/lib/bugTracking";
import { useState } from "react";

interface AddBugTrackingFormProps {
  developers: Developer[];
  products: Product[];
  onItemAdded: () => void;
}

export default function AddBugTrackingForm({
  developers,
  products,
  onItemAdded,
}: AddBugTrackingFormProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"bug" | "projeto">("projeto");
  const [dataBug, setDataBug] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [targetHML, setTargetHML] = useState("");
  const [targetPRD, setTargetPRD] = useState("");
  const [developerId, setDeveloperId] = useState("");
  const [productId, setProductId] = useState("");
  const [horasGastas, setHorasGastas] = useState("");
  const [dataResolucao, setDataResolucao] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Título é obrigatório");
      return;
    }

    if (!developerId) {
      setError("Selecione um desenvolvedor");
      return;
    }

    if (!productId) {
      setError("Selecione um produto");
      return;
    }

    if (!dataInicio) {
      setError("Data de início é obrigatória");
      return;
    }

    if (type === "projeto" && !targetHML) {
      setError("Target HML é obrigatório para projetos");
      return;
    }

    if (type === "projeto" && !targetPRD) {
      setError("Target PRD é obrigatório para projetos");
      return;
    }

    if (type === "bug" && !dataBug) {
      setError("Data do BUG é obrigatória para bugs");
      return;
    }

    if (type === "bug" && !horasGastas) {
      setError("Horas gastas é obrigatório para bugs");
      return;
    }

    addBugTracking(
      title,
      type,
      type === "bug" ? dataBug : undefined,
      dataInicio,
      type === "projeto" ? targetHML : "",
      type === "projeto" ? targetPRD : "",
      developerId,
      productId,
      type === "bug" ? parseFloat(horasGastas) : undefined,
      type === "bug" ? dataResolucao : undefined
    );

    setTitle("");
    setType("projeto");
    setDataBug("");
    setDataInicio("");
    setTargetHML("");
    setTargetPRD("");
    setDeveloperId("");
    setProductId("");
    setHorasGastas("");
    setDataResolucao("");
    onItemAdded();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-white">
      <h3 className="font-semibold text-lg">Adicionar Bug/Projeto</h3>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

      <div>
        <Label>Título</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Descrição do bug ou projeto"
        />
      </div>

      <div>
        <Label>Tipo</Label>
        <Select value={type} onValueChange={(v) => setType(v as "bug" | "projeto")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bug">BUG</SelectItem>
            <SelectItem value="projeto">Projeto/Melhoria</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type === "bug" && (
        <>
          <div>
            <Label>Data do BUG</Label>
            <Input
              type="date"
              value={dataBug}
              onChange={(e) => setDataBug(e.target.value)}
            />
          </div>
          <div>
            <Label>Horas Gastas para Resolver</Label>
            <Input
              type="number"
              step="0.5"
              min="0"
              value={horasGastas}
              onChange={(e) => setHorasGastas(e.target.value)}
              placeholder="Ex: 2.5"
            />
          </div>
          <div>
            <Label>Data de Resolução (Opcional)</Label>
            <Input
              type="date"
              value={dataResolucao}
              onChange={(e) => setDataResolucao(e.target.value)}
            />
          </div>
        </>
      )}

      <div>
        <Label>Data Início Projeto</Label>
        <Input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
        />
      </div>

      {type === "projeto" && (
        <>
          <div>
            <Label>Target Data HML</Label>
            <Input
              type="date"
              value={targetHML}
              onChange={(e) => setTargetHML(e.target.value)}
            />
          </div>

          <div>
            <Label>Target Data PRD</Label>
            <Input
              type="date"
              value={targetPRD}
              onChange={(e) => setTargetPRD(e.target.value)}
            />
          </div>
        </>
      )}

      <div>
        <Label>Desenvolvedor</Label>
        <Select value={developerId} onValueChange={setDeveloperId}>
          <SelectTrigger>
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
        <Label>Produto</Label>
        <Select value={productId} onValueChange={setProductId}>
          <SelectTrigger>
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

      <Button type="submit" className="w-full">
        Adicionar
      </Button>
    </form>
  );
}
