'use client';

import { AgentDefinition, AgentConfig } from './Agent';
import { useSafeTranslation } from '@/components/I18nProvider';
import AgentToolsSection from './AgentToolsSection';

const MODEL_OPTIONS = ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo", "claude-3-opus", "claude-3-sonnet"];

interface ActiveAgentEditorProps {
  chatbotId: string;
  agent: AgentDefinition;
  config: AgentConfig;
  updateAgent: (agentId: string, updates: Partial<AgentDefinition>) => void;
  removeAgent: (agentId: string) => void;
  updateRouterAgentId: (id: string) => void;
  addTool: (agentId: string, toolType: 'built-in' | 'api-call' | 'agent') => void;
  editTool: (agentId: string, toolIndex: number) => void;
  removeTool: (agentId: string, toolIndex: number) => void;
}

export default function ActiveAgentEditor({
  chatbotId,
  agent,
  config,
  updateAgent,
  removeAgent,
  updateRouterAgentId,
  addTool,
  editTool,
  removeTool
}: ActiveAgentEditorProps) {
  const { t } = useSafeTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={agent.name}
            onChange={(e) => updateAgent(agent.id, { name: e.target.value })}
            className="rounded-md border border-border bg-dark px-3 py-1 text-sm text-primary focus:border-accent focus:outline-none"
          />
          <div className="text-xs bg-dark px-2 py-1 rounded text-secondary">
            ID: {agent.id}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-xs text-secondary">
            <input
              type="checkbox"
              checked={config.router_agent_id === agent.id}
              onChange={(e) => {
                if (e.target.checked) {
                  updateRouterAgentId(agent.id);
                }
              }}
              className="mr-1"
            />
            {t('dashboard.editor.agent.agentsSection.routerAgentLabel')}
          </label>
          
          <button
            onClick={() => removeAgent(agent.id)}
            disabled={config.agents.length <= 1}
            className="text-red-400 hover:text-red-300 disabled:opacity-50"
            title={t('dashboard.editor.agent.agentsSection.deleteAgentTitle')}
          >
            {t('dashboard.editor.agent.agentsSection.deleteAgentButton')}
          </button>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-secondary mb-1">
          {t('dashboard.editor.agent.agentsSection.instructionsLabel')}
        </label>
        <textarea
          value={agent.instructions}
          onChange={(e) => updateAgent(agent.id, { instructions: e.target.value })}
          rows={4}
          className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-secondary mb-1">
          {t('dashboard.editor.agent.agentsSection.modelLabel')}
        </label>
        <select
          value={agent.model || ""}
          onChange={(e) => updateAgent(agent.id, { model: e.target.value || undefined })}
          className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
        >
          <option value="">{t('dashboard.editor.agent.agentsSection.modelUseDefaultOption', { model: config.default_model })}</option>
          {MODEL_OPTIONS.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-secondary mb-1">
          {t('dashboard.editor.agent.agentsSection.handoffDescriptionLabel')}
        </label>
        <input
          type="text"
          value={agent.handoff_description || ""}
          onChange={(e) => updateAgent(agent.id, { handoff_description: e.target.value || undefined })}
          className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
          placeholder={t('dashboard.editor.agent.agentsSection.handoffDescriptionPlaceholder')}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-secondary mb-1">
          {t('dashboard.editor.agent.agentsSection.availableHandoffsLabel')}
        </label>
        {config.agents.filter(a => a.id !== agent.id).length === 0 ? (
          <p className="text-sm text-secondary italic">{t('dashboard.editor.agent.agentsSection.noHandoffsAvailable')}</p>
        ) : (
          <div className="space-y-1">
            {config.agents.filter(a => a.id !== agent.id).map((otherAgent) => (
              <div key={otherAgent.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`handoff-${agent.id}-${otherAgent.id}`}
                  checked={agent.handoffs.includes(otherAgent.id)}
                  onChange={(e) => {
                    const newHandoffs = e.target.checked
                      ? [...agent.handoffs, otherAgent.id]
                      : agent.handoffs.filter(id => id !== otherAgent.id);
                    
                    updateAgent(agent.id, { handoffs: newHandoffs });
                  }}
                  className="mr-2"
                />
                <label
                  htmlFor={`handoff-${agent.id}-${otherAgent.id}`}
                  className="text-sm text-primary"
                >
                  {otherAgent.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Render Tools Section */}
      <AgentToolsSection 
        chatbotId={chatbotId}
        agent={agent}
        addTool={addTool}
        editTool={editTool}
        removeTool={removeTool}
        onUpdateAgent={(updatedAgent) => updateAgent(updatedAgent.id, updatedAgent)}
      />
    </div>
  );
} 