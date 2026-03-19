import { mapJsonToSmartOps, WebhookIntegration } from './supabase';
import { addProject, updateProject } from './integratedMetrics';

/**
 * Processa um payload de webhook e atualiza os dados no SmartOps
 */
export async function processWebhookPayload(
  integration: WebhookIntegration,
  payload: Record<string, any>
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    // Se a integração não está ativa, ignora
    if (!integration.active) {
      return { success: false, message: 'Integração inativa' };
    }

    // Mapeia os dados do webhook para o formato SmartOps
    const mappedData = mapJsonToSmartOps(payload, integration.field_mappings);

    // Processa conforme o tipo de integração
    switch (integration.source) {
      case 'jira':
        return processJiraWebhook(mappedData, payload);
      case 'azure_devops':
        return processAzureDevOpsWebhook(mappedData, payload);
      case 'movidesk':
        return processMovideskWebhook(mappedData, payload);
      case 'multidados':
        return processMultidadosWebhook(mappedData, payload);
      case 'custom':
        return processCustomWebhook(mappedData);
      default:
        return { success: false, message: 'Tipo de integração desconhecido' };
    }
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return {
      success: false,
      message: `Erro ao processar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  }
}

/**
 * Processa webhook do Jira
 */
function processJiraWebhook(
  mappedData: Record<string, any>,
  originalPayload: Record<string, any>
): { success: boolean; message: string; data?: any } {
  try {
    const issue = originalPayload.issue || {};
    const issueKey = issue.key || mappedData['project.id'];

    // Extrai informações do Jira
    const projectData = {
      id: issueKey,
      title: issue.fields?.summary || mappedData['project.name'] || 'Sem título',
      status: mapJiraStatusToSmartOps(issue.fields?.status?.name),
      createdAt: new Date(issue.fields?.created).toISOString(),
      estimatedHours: parseFloat(mappedData['project.hours']) || 0,
      costPerHour: parseFloat(mappedData['project.cost']) || 0,
    };

    // Verifica se o projeto já existe
    const existingProject = loadProjects().find(p => p.id === projectData.id);

    if (existingProject) {
      updateProject(projectData.id, projectData);
    } else {
      addProject(projectData);
    }

    return {
      success: true,
      message: `Projeto Jira ${issueKey} sincronizado com sucesso`,
      data: projectData,
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao processar Jira: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  }
}

/**
 * Processa webhook do Azure DevOps
 */
function processAzureDevOpsWebhook(
  mappedData: Record<string, any>,
  originalPayload: Record<string, any>
): { success: boolean; message: string; data?: any } {
  try {
    const resource = originalPayload.resource || {};
    const workItemId = resource.id || mappedData['project.id'];

    const projectData = {
      id: String(workItemId),
      title: resource.fields?.['System.Title'] || mappedData['project.name'] || 'Sem título',
      status: mapAzureStatusToSmartOps(resource.fields?.['System.State']),
      createdAt: new Date(resource.fields?.['System.CreatedDate']).toISOString(),
      estimatedHours: parseFloat(mappedData['project.hours']) || 0,
      costPerHour: parseFloat(mappedData['project.cost']) || 0,
    };

    const existingProject = loadProjects().find(p => p.id === projectData.id);

    if (existingProject) {
      updateProject(projectData.id, projectData);
    } else {
      addProject(projectData);
    }

    return {
      success: true,
      message: `Work Item Azure ${workItemId} sincronizado com sucesso`,
      data: projectData,
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao processar Azure DevOps: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  }
}

/**
 * Processa webhook do Movidesk
 */
function processMovideskWebhook(
  mappedData: Record<string, any>,
  originalPayload: Record<string, any>
): { success: boolean; message: string; data?: any } {
  try {
    const ticket = originalPayload.ticket || {};
    const ticketId = ticket.id || mappedData['project.id'];

    const projectData = {
      id: String(ticketId),
      title: ticket.subject || mappedData['project.name'] || 'Sem título',
      status: mapMovideskStatusToSmartOps(ticket.status),
      createdAt: new Date(ticket.createdDate).toISOString(),
      estimatedHours: parseFloat(mappedData['project.hours']) || 0,
      costPerHour: parseFloat(mappedData['project.cost']) || 0,
    };

    const existingProject = loadProjects().find(p => p.id === projectData.id);

    if (existingProject) {
      updateProject(projectData.id, projectData);
    } else {
      addProject(projectData);
    }

    return {
      success: true,
      message: `Ticket Movidesk ${ticketId} sincronizado com sucesso`,
      data: projectData,
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao processar Movidesk: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  }
}

/**
 * Processa webhook do Multidados
 */
function processMultidadosWebhook(
  mappedData: Record<string, any>,
  originalPayload: Record<string, any>
): { success: boolean; message: string; data?: any } {
  try {
    const project = originalPayload.project || {};
    const projectId = project.id || mappedData['project.id'];

    const projectData = {
      id: String(projectId),
      title: project.name || mappedData['project.name'] || 'Sem título',
      status: mapMultidadosStatusToSmartOps(project.status),
      createdAt: new Date(project.createdAt).toISOString(),
      estimatedHours: parseFloat(mappedData['project.hours']) || 0,
      costPerHour: parseFloat(mappedData['project.cost']) || 0,
    };

    const existingProject = loadProjects().find(p => p.id === projectData.id);

    if (existingProject) {
      updateProject(projectData.id, projectData);
    } else {
      addProject(projectData);
    }

    return {
      success: true,
      message: `Projeto Multidados ${projectId} sincronizado com sucesso`,
      data: projectData,
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao processar Multidados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  }
}

/**
 * Processa webhook customizado
 */
function processCustomWebhook(
  mappedData: Record<string, any>
): { success: boolean; message: string; data?: any } {
  try {
    const projectData = {
      id: mappedData['project.id'] || `custom_${Date.now()}`,
      title: mappedData['project.name'] || 'Projeto Customizado',
      status: (mappedData['project.status'] || 'backlog') as any,
      createdAt: new Date().toISOString(),
      estimatedHours: parseFloat(mappedData['project.hours']) || 0,
      costPerHour: parseFloat(mappedData['project.cost']) || 0,
    };

    const existingProject = loadProjects().find(p => p.id === projectData.id);

    if (existingProject) {
      updateProject(projectData.id, projectData);
    } else {
      addProject(projectData);
    }

    return {
      success: true,
      message: `Dados customizados sincronizados com sucesso`,
      data: projectData,
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao processar dados customizados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  }
}

// Mapeadores de status para diferentes plataformas

function mapJiraStatusToSmartOps(jiraStatus: string): string {
  const statusMap: Record<string, string> = {
    'To Do': 'backlog',
    'In Progress': 'dev',
    'In Review': 'review',
    'Ready for Deploy': 'deploy',
    'Done': 'concluido',
  };
  return statusMap[jiraStatus] || 'backlog';
}

function mapAzureStatusToSmartOps(azureStatus: string): string {
  const statusMap: Record<string, string> = {
    'New': 'backlog',
    'Active': 'dev',
    'Resolved': 'review',
    'Closed': 'concluido',
  };
  return statusMap[azureStatus] || 'backlog';
}

function mapMovideskStatusToSmartOps(movideskStatus: string): string {
  const statusMap: Record<string, string> = {
    'Aberto': 'backlog',
    'Em Andamento': 'dev',
    'Aguardando': 'review',
    'Resolvido': 'concluido',
  };
  return statusMap[movideskStatus] || 'backlog';
}

function mapMultidadosStatusToSmartOps(multidadosStatus: string): string {
  const statusMap: Record<string, string> = {
    'planejamento': 'backlog',
    'execucao': 'dev',
    'validacao': 'review',
    'finalizado': 'concluido',
  };
  return statusMap[multidadosStatus] || 'backlog';
}

// Importa a função loadProjects (será importada do integratedMetrics)
function loadProjects() {
  // Esta função será importada do integratedMetrics
  return [];
}
