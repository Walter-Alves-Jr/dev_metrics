import { Incident, loadIncidents, acknowledgeIncident, resolveIncident } from "@/lib/integratedMetrics";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BugsManagerProps {
  onDataChanged: () => void;
}

export default function BugsManager({ onDataChanged }: BugsManagerProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    setIncidents(loadIncidents());
  }, []);

  const handleAcknowledge = (id: string) => {
    acknowledgeIncident(id);
    setIncidents(loadIncidents());
    onDataChanged();
    toast.success("Bug reconhecido!");
  };

  const handleResolve = (id: string, recurring: boolean) => {
    resolveIncident(id, recurring);
    setIncidents(loadIncidents());
    onDataChanged();
    toast.success("Bug resolvido!");
  };

  const calculateMTTA = (incident: Incident): string => {
    if (!incident.acknowledgedAt) return "-";
    const diff = new Date(incident.acknowledgedAt).getTime() - new Date(incident.openedAt).getTime();
    return (diff / (1000 * 60 * 60)).toFixed(1) + "h";
  };

  const calculateMTTR = (incident: Incident): string => {
    if (!incident.resolvedAt) return "-";
    const diff = new Date(incident.resolvedAt).getTime() - new Date(incident.openedAt).getTime();
    return (diff / (1000 * 60 * 60)).toFixed(1) + "h";
  };

  const checkSLACompliance = (incident: Incident): boolean => {
    if (!incident.resolvedAt) return false;
    const diff = new Date(incident.resolvedAt).getTime() - new Date(incident.openedAt).getTime();
    const hours = diff / (1000 * 60 * 60);
    return hours <= incident.slaTargetHours;
  };

  if (incidents.length === 0) {
    return <div className="text-center p-8 text-gray-500">Nenhum bug encontrado.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-100 text-left">
            <th className="py-3 px-2">Bug</th>
            <th className="py-3 px-2">Severidade / SLA</th>
            <th className="py-3 px-2">MTTA / MTTR</th>
            <th className="py-3 px-2">Status</th>
            <th className="py-3 px-2 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((i) => (
            <tr key={i.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-2">
                <p className="font-semibold text-gray-900">{i.title}</p>
                <p className="text-[10px] text-gray-400">Aberto em: {new Date(i.openedAt).toLocaleString()}</p>
              </td>
              <td className="py-3 px-2">
                <div className="flex flex-col gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                    i.severity === "critical" ? "bg-red-600 text-white" :
                    i.severity === "high" ? "bg-orange-100 text-orange-700" :
                    i.severity === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {i.severity.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-gray-600">SLA: {i.slaTargetHours}h</span>
                </div>
              </td>
              <td className="py-3 px-2">
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-semibold">MTTA: {calculateMTTA(i)}</span>
                  <span className="font-semibold">MTTR: {calculateMTTR(i)}</span>
                </div>
              </td>
              <td className="py-3 px-2">
                <div className="flex flex-col gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                    i.resolvedAt ? "bg-green-100 text-green-700" :
                    i.acknowledgedAt ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                  }`}>
                    {i.resolvedAt ? "Resolvido" : i.acknowledgedAt ? "Em Atendimento" : "Aberto"}
                  </span>
                  {i.resolvedAt && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                      checkSLACompliance(i) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {checkSLACompliance(i) ? "✓ SLA OK" : "✗ SLA Violado"}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-2 text-right space-y-1">
                {!i.acknowledgedAt && (
                  <Button 
                    size="sm" 
                    onClick={() => handleAcknowledge(i.id)}
                    className="h-7 px-2 text-[10px] bg-blue-600 hover:bg-blue-700 w-full"
                  >
                    Reconhecer
                  </Button>
                )}
                {i.acknowledgedAt && !i.resolvedAt && (
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      onClick={() => handleResolve(i.id, false)}
                      className="h-7 px-2 text-[10px] bg-green-600 hover:bg-green-700 flex-1"
                    >
                      Resolver
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleResolve(i.id, true)}
                      className="h-7 px-2 text-[10px] bg-yellow-600 hover:bg-yellow-700"
                      title="Marcar como recorrente"
                    >
                      ⚠
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
