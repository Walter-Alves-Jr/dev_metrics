import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateWebhookUrl, defaultMappings, WebhookIntegration } from '@/lib/supabase';
import { Copy, Plus, Trash2, Edit2 } from 'lucide-react';

export default function IntegrationsManager() {
  const [integrations, setIntegrations] = useState<WebhookIntegration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<WebhookIntegration | null>(null);
  const [showNewIntegration, setShowNewIntegration] = useState(false);
  const [newIntegrationName, setNewIntegrationName] = useState('');
  const [newIntegrationSource, setNewIntegrationSource] = useState<'jira' | 'azure_devops' | 'movidesk' | 'multidados' | 'custom'>('jira');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load integrations from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('smartops_integrations');
    if (stored) {
      setIntegrations(JSON.parse(stored));
    }
  }, []);

  // Save integrations to localStorage
  const saveIntegrations = (newIntegrations: WebhookIntegration[]) => {
    setIntegrations(newIntegrations);
    localStorage.setItem('smartops_integrations', JSON.stringify(newIntegrations));
  };

  const createIntegration = () => {
    if (!newIntegrationName.trim()) return;

    const newIntegration: WebhookIntegration = {
      id: `integration_${Date.now()}`,
      name: newIntegrationName,
      source: newIntegrationSource,
      webhook_url: generateWebhookUrl(`integration_${Date.now()}`),
      field_mappings: defaultMappings[newIntegrationSource] || {},
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveIntegrations([...integrations, newIntegration]);
    setNewIntegrationName('');
    setShowNewIntegration(false);
  };

  const deleteIntegration = (id: string) => {
    saveIntegrations(integrations.filter(i => i.id !== id));
    if (selectedIntegration?.id === id) {
      setSelectedIntegration(null);
    }
  };

  const toggleIntegrationStatus = (id: string) => {
    const updated = integrations.map(i =>
      i.id === id ? { ...i, active: !i.active } : i
    );
    saveIntegrations(updated);
  };

  const copyWebhookUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const updateFieldMapping = (integrationId: string, smartopsField: string, sourceField: string) => {
    const updated = integrations.map(i =>
      i.id === integrationId
        ? {
            ...i,
            field_mappings: {
              ...i.field_mappings,
              [smartopsField]: sourceField,
            },
          }
        : i
    );
    saveIntegrations(updated);
    if (selectedIntegration?.id === integrationId) {
      setSelectedIntegration(updated.find(i => i.id === integrationId) || null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Integrações</h2>
        <Button onClick={() => setShowNewIntegration(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Integração
        </Button>
      </div>

      {showNewIntegration && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-4">Criar Nova Integração</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome da Integração</label>
              <Input
                placeholder="Ex: Jira - Projeto X"
                value={newIntegrationName}
                onChange={(e) => setNewIntegrationName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fonte de Dados</label>
              <select
                value={newIntegrationSource}
                onChange={(e) => setNewIntegrationSource(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="jira">Jira</option>
                <option value="azure_devops">Azure DevOps</option>
                <option value="movidesk">Movidesk</option>
                <option value="multidados">Multidados</option>
                <option value="custom">Customizado</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={createIntegration} className="bg-green-600 hover:bg-green-700">
                Criar
              </Button>
              <Button onClick={() => setShowNewIntegration(false)} variant="outline">
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Integrações Ativas ({integrations.length})</TabsTrigger>
          <TabsTrigger value="docs">Documentação</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {integrations.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              <p>Nenhuma integração configurada ainda.</p>
              <p className="text-sm mt-2">Clique em "Nova Integração" para começar.</p>
            </Card>
          ) : (
            integrations.map((integration) => (
              <Card key={integration.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{integration.name}</h3>
                    <p className="text-sm text-gray-500">Fonte: {integration.source}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => toggleIntegrationStatus(integration.id)}
                      variant={integration.active ? 'default' : 'outline'}
                      size="sm"
                    >
                      {integration.active ? 'Ativo' : 'Inativo'}
                    </Button>
                    <Button
                      onClick={() => deleteIntegration(integration.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">URL do Webhook</label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={integration.webhook_url}
                        readOnly
                        className="bg-gray-50"
                      />
                      <Button
                        onClick={() => copyWebhookUrl(integration.webhook_url, integration.id)}
                        size="sm"
                        variant="outline"
                      >
                        <Copy className="w-4 h-4" />
                        {copiedId === integration.id ? 'Copiado!' : 'Copiar'}
                      </Button>
                    </div>
                  </div>

                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium text-blue-600">
                      Configurar Mapeamento de Campos
                    </summary>
                    <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded">
                      {Object.entries(integration.field_mappings).map(([smartopsField, sourceField]) => (
                        <div key={smartopsField} className="flex gap-2 items-center">
                          <span className="text-xs font-mono bg-white px-2 py-1 rounded flex-1">
                            {smartopsField}
                          </span>
                          <span className="text-gray-400">→</span>
                          <Input
                            value={sourceField}
                            onChange={(e) => updateFieldMapping(integration.id, smartopsField, e.target.value)}
                            placeholder="Ex: issue.fields.customfield_10000"
                            className="flex-1 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Como Usar as Integrações</h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">1. Criar uma Integração</h4>
                <p className="text-gray-600">Clique em "Nova Integração" e escolha a fonte de dados (Jira, Azure, etc).</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">2. Copiar a URL do Webhook</h4>
                <p className="text-gray-600">Use o botão "Copiar" para obter a URL única da sua integração.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">3. Configurar na Ferramenta Externa</h4>
                <p className="text-gray-600">Cole a URL nos webhooks da sua ferramenta (Jira, Azure DevOps, etc).</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">4. Mapear Campos (Opcional)</h4>
                <p className="text-gray-600">Se os campos não forem reconhecidos automaticamente, configure o mapeamento usando notação de ponto (ex: issue.fields.customfield_10000).</p>
              </div>
              <div className="bg-blue-50 p-3 rounded border border-blue-200 mt-4">
                <p className="text-xs"><strong>Nota:</strong> Os dados chegam em tempo real e atualizam automaticamente seus dashboards e a Timeline do projeto.</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
