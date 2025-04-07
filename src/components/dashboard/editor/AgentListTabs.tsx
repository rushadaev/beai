'use client';

import { AgentDefinition } from './Agent';
import { useSafeTranslation } from '@/components/I18nProvider';

interface AgentListTabsProps {
  agents: AgentDefinition[];
  activeAgent: string;
  setActiveAgent: (id: string) => void;
  addAgent: () => void;
}

export default function AgentListTabs({ 
  agents,
  activeAgent,
  setActiveAgent,
  addAgent
}: AgentListTabsProps) {
  const { t } = useSafeTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-primary">{t('dashboard.editor.agent.agentsSection.title')}</h3>
        <button
          onClick={addAgent}
          className="rounded bg-accent px-2 py-1 text-xs font-medium text-dark hover:bg-accent/80"
        >
          {t('dashboard.editor.agent.agentsSection.addAgentButton')}
        </button>
      </div>
      
      {agents.length > 0 && (
        <div className="border-b border-border">
          <div className="flex flex-wrap">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setActiveAgent(agent.id)}
                className={`px-3 py-2 text-sm ${
                  activeAgent === agent.id
                    ? 'border-b-2 border-accent text-primary'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {agent.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 