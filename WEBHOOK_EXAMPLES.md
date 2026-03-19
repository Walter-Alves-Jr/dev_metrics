# SmartOps - Exemplos de Webhooks

Este documento contém exemplos de payloads para integrar suas ferramentas com o SmartOps via Webhooks.

## Como Usar

1. Acesse a aba **"Integrações"** no SmartOps.
2. Clique em **"Nova Integração"** e escolha sua ferramenta.
3. Copie a **URL do Webhook** gerada.
4. Configure essa URL nos webhooks da sua ferramenta (Jira, Azure, etc).
5. Quando um evento acontecer, o SmartOps receberá os dados automaticamente.

---

## Jira

### URL do Webhook
```
https://walter-alves-jr.github.io/smartops/api/webhooks/{integration_id}
```

### Configuração no Jira
1. Vá em **Project Settings > Webhooks**.
2. Clique em **Create a webhook**.
3. Cole a URL acima.
4. Selecione os eventos: `issue.created`, `issue.updated`, `issue.deleted`.

### Exemplo de Payload (Jira envia automaticamente)
```json
{
  "issue": {
    "key": "PROJ-123",
    "fields": {
      "summary": "Implementar nova feature",
      "status": {
        "name": "In Progress"
      },
      "created": "2024-01-15T10:00:00Z",
      "customfield_10000": 8,
      "customfield_10001": 500
    }
  }
}
```

### Mapeamento de Campos Recomendado
| Campo SmartOps | Campo Jira |
|---|---|
| project.id | issue.key |
| project.name | issue.fields.summary |
| project.status | issue.fields.status.name |
| project.hours | issue.fields.customfield_10000 |
| project.cost | issue.fields.customfield_10001 |

---

## Azure DevOps

### URL do Webhook
```
https://walter-alves-jr.github.io/smartops/api/webhooks/{integration_id}
```

### Configuração no Azure DevOps
1. Vá em **Project Settings > Service hooks**.
2. Clique em **Create subscription**.
3. Selecione **Web Hooks**.
4. Cole a URL acima.
5. Selecione os eventos: `workitem.created`, `workitem.updated`.

### Exemplo de Payload (Azure envia automaticamente)
```json
{
  "resource": {
    "id": 12345,
    "fields": {
      "System.Title": "Implementar API REST",
      "System.State": "Active",
      "System.CreatedDate": "2024-01-15T10:00:00Z",
      "Custom.Hours": 16,
      "Custom.Cost": 1200
    }
  }
}
```

### Mapeamento de Campos Recomendado
| Campo SmartOps | Campo Azure |
|---|---|
| project.id | resource.id |
| project.name | resource.fields["System.Title"] |
| project.status | resource.fields["System.State"] |
| project.hours | resource.fields["Custom.Hours"] |
| project.cost | resource.fields["Custom.Cost"] |

---

## Movidesk

### URL do Webhook
```
https://walter-alves-jr.github.io/smartops/api/webhooks/{integration_id}
```

### Configuração no Movidesk
1. Vá em **Configurações > Integrações > Webhooks**.
2. Clique em **Novo Webhook**.
3. Cole a URL acima.
4. Selecione os eventos desejados.

### Exemplo de Payload
```json
{
  "ticket": {
    "id": "TK-5678",
    "subject": "Suporte - Erro no login",
    "status": "Em Andamento",
    "createdDate": "2024-01-15T10:00:00Z",
    "timeSpent": 2.5,
    "cost": 150
  }
}
```

### Mapeamento de Campos Recomendado
| Campo SmartOps | Campo Movidesk |
|---|---|
| project.id | ticket.id |
| project.name | ticket.subject |
| project.status | ticket.status |
| project.hours | ticket.timeSpent |
| project.cost | ticket.cost |

---

## Multidados

### URL do Webhook
```
https://walter-alves-jr.github.io/smartops/api/webhooks/{integration_id}
```

### Configuração no Multidados
1. Acesse o painel de **Integrações**.
2. Configure um webhook com a URL acima.
3. Mapeie os campos conforme necessário.

### Exemplo de Payload
```json
{
  "project": {
    "id": "PROJ-9999",
    "name": "Projeto de Transformação Digital",
    "status": "execucao",
    "createdAt": "2024-01-15T10:00:00Z",
    "hours": 120,
    "cost": 8000
  }
}
```

### Mapeamento de Campos Recomendado
| Campo SmartOps | Campo Multidados |
|---|---|
| project.id | project.id |
| project.name | project.name |
| project.status | project.status |
| project.hours | project.hours |
| project.cost | project.cost |

---

## Webhook Customizado

Se sua ferramenta não está listada, você pode usar a opção **"Customizado"** e enviar um JSON com a estrutura que desejar.

### Exemplo de Payload Customizado
```json
{
  "project": {
    "id": "CUSTOM-001",
    "name": "Meu Projeto",
    "status": "dev",
    "hours": 10,
    "cost": 500
  }
}
```

### Como Enviar
Use qualquer ferramenta que suporte HTTP POST (cURL, Postman, etc):

```bash
curl -X POST https://walter-alves-jr.github.io/smartops/api/webhooks/{integration_id} \
  -H "Content-Type: application/json" \
  -d '{
    "project": {
      "id": "CUSTOM-001",
      "name": "Meu Projeto",
      "status": "dev",
      "hours": 10,
      "cost": 500
    }
  }'
```

---

## Status Suportados

O SmartOps reconhece automaticamente os seguintes status:

| SmartOps | Jira | Azure | Movidesk | Multidados |
|---|---|---|---|---|
| backlog | To Do | New | Aberto | planejamento |
| dev | In Progress | Active | Em Andamento | execucao |
| review | In Review | Resolved | Aguardando | validacao |
| deploy | Ready for Deploy | - | - | - |
| concluido | Done | Closed | Resolvido | finalizado |

---

## Dicas Importantes

1. **Teste Primeiro**: Use o Postman ou cURL para testar o webhook antes de configurar na ferramenta.
2. **Mapeamento de Campos**: Se os campos não forem reconhecidos, configure o mapeamento na aba de Integrações.
3. **Notação de Ponto**: Use notação de ponto para campos aninhados (ex: `issue.fields.customfield_10000`).
4. **Sincronização em Tempo Real**: Os dados são processados instantaneamente após o webhook ser recebido.
5. **Histórico**: Verifique o histórico de webhooks na aba de Integrações para debugar problemas.

---

## Suporte

Se encontrar problemas:
1. Verifique se a integração está **Ativa** na aba de Integrações.
2. Confirme que o mapeamento de campos está correto.
3. Teste o webhook manualmente com o cURL.
4. Verifique o console do navegador para mensagens de erro.
