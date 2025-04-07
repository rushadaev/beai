'use client';

import { AgentDefinition, AgentTool } from './Agent';
import { useSafeTranslation } from '@/components/I18nProvider';

interface AgentToolsSectionProps {
  agent: AgentDefinition;
  addTool: (agentId: string, toolType: 'built-in' | 'api-call' | 'agent') => void;
  editTool: (agentId: string, toolIndex: number) => void;
  removeTool: (agentId: string, toolIndex: number) => void;
}

export default function AgentToolsSection({
  agent,
  addTool,
  editTool,
  removeTool
}: AgentToolsSectionProps) {
  const { t } = useSafeTranslation();

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-secondary">
          {t('dashboard.editor.agent.toolsSection.title')}
        </label>
        <div className="flex space-x-2">
          <button
            onClick={() => addTool(agent.id, 'built-in')}
            className="text-xs px-2 py-1 rounded bg-dark hover:bg-dark/80 text-primary"
          >
            {t('dashboard.editor.agent.toolsSection.addBuiltInButton')}
          </button>
          <button
            onClick={() => addTool(agent.id, 'api-call')}
            className="text-xs px-2 py-1 rounded bg-dark hover:bg-dark/80 text-primary"
          >
            {t('dashboard.editor.agent.toolsSection.addApiCallButton')}
          </button>
          <button
            onClick={() => addTool(agent.id, 'agent')}
            className="text-xs px-2 py-1 rounded bg-dark hover:bg-dark/80 text-primary"
          >
            {t('dashboard.editor.agent.toolsSection.addAgentToolButton')}
          </button>
        </div>
      </div>
      
      {agent.tools.length === 0 ? (
        <p className="text-sm text-secondary italic">{t('dashboard.editor.agent.toolsSection.noTools')}</p>
      ) : (
        <div className="space-y-2">
          {agent.tools.map((tool, index) => (
            <div key={index} className="rounded-md border border-border bg-dark p-3">
              {typeof tool === 'string' ? (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs bg-accent/20 rounded px-2 py-1 text-accent">
                      {tool.startsWith('agent_') ? 
                        t('dashboard.editor.agent.toolsSection.agentToolType') : 
                        t('dashboard.editor.agent.toolsSection.builtInToolType') 
                      }
                    </span>
                    <span className="ml-2 text-sm text-primary">
                      {tool.startsWith('agent_') ? tool.substring(6) : tool}
                    </span>
                  </div>
                  <div>
                    <button
                      onClick={() => editTool(agent.id, index)}
                      className="text-secondary hover:text-primary mr-2"
                      title={t('dashboard.editor.agent.toolsSection.editToolTitle')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeTool(agent.id, index)}
                      className="text-red-400 hover:text-red-300"
                      title={t('dashboard.editor.agent.toolsSection.removeToolTitle')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-xs bg-accent/20 rounded px-2 py-1 text-accent">
                        {t('dashboard.editor.agent.toolsSection.apiCallToolType')}
                      </span>
                      <span className="ml-2 text-sm text-primary">
                        {(tool as AgentTool).name}
                      </span>
                    </div>
                    <div>
                      <button
                        onClick={() => editTool(agent.id, index)}
                        className="text-secondary hover:text-primary mr-2"
                        title={t('dashboard.editor.agent.toolsSection.editToolTitle')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeTool(agent.id, index)}
                        className="text-red-400 hover:text-red-300"
                        title={t('dashboard.editor.agent.toolsSection.removeToolTitle')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {(tool as AgentTool).description && (
                    <div className="text-sm text-secondary">
                      {(tool as AgentTool).description}
                    </div>
                  )}
                  
                  {(tool as AgentTool).parameters && Object.keys((tool as AgentTool).parameters?.properties || {}).length > 0 && (
                    <div className="mt-1 text-xs">
                      <span className="text-secondary">{t('dashboard.editor.agent.toolsSection.parametersLabel')}: </span>
                      <span className="text-primary">{Object.keys((tool as AgentTool).parameters?.properties || {}).join(", ")}</span>
                    </div>
                  )}
                  
                  {(tool as AgentTool).api_config && (
                    <div className="mt-1 text-xs">
                      <span className="text-secondary">{t('dashboard.editor.agent.toolsSection.apiLabel')}: </span>
                      <span className="text-primary">
                        {(tool as AgentTool).api_config?.method} {(tool as AgentTool).api_config?.url}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 