'use client';

import { AgentConfig } from './Agent';
import { useSafeTranslation } from '@/components/I18nProvider';

const BUILT_IN_TOOLS = ["web_search", "file_search"];

interface ToolSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AgentConfig;
  activeAgent: string;
  currentToolType: 'built-in' | 'api-call' | 'agent' | null;
  setCurrentToolType: (type: 'built-in' | 'api-call' | 'agent' | null) => void;
  editingToolIndex: number | null;
  handleAddTool: (agentId: string, tool: string) => void;
  updateTool: (agentId: string, toolIndex: number, tool: string) => void;
  setShowApiConfigModal: (show: boolean) => void;
  setCurrentApiConfig: (config: unknown) => void; // Consider refining 'any'
}

export default function ToolSelectionModal({
  isOpen,
  onClose,
  config,
  activeAgent,
  currentToolType,
  setCurrentToolType,
  editingToolIndex,
  handleAddTool,
  updateTool,
  setShowApiConfigModal,
  setCurrentApiConfig
}: ToolSelectionModalProps) {
  const { t } = useSafeTranslation();

  if (!isOpen) return null;

  const handleApiCallClick = () => {
    setCurrentToolType('api-call');
    onClose(); // Close this modal
    // Reset/Prepare API config for the API modal
    setCurrentApiConfig({
      name: "",
      description: "",
      parameters: {
        type: "object",
        properties: {},
        required: [],
        additionalProperties: false
      },
      api_config: {
        method: "GET",
        url: "",
        headers: {},
        query_params: {},
        body_template: {},
        response_template: {}
      }
    });
    setShowApiConfigModal(true); // Show the API config modal
  };

  const handleBuiltInSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const activeAgentId = config.agents.find(a => a.id === activeAgent)?.id;
    if (activeAgentId && e.target.value) {
      if (editingToolIndex !== null) {
        updateTool(activeAgentId, editingToolIndex, e.target.value);
      } else {
        handleAddTool(activeAgentId, e.target.value);
      }
      onClose(); // Close modal after selection
    }
  };

  const handleAgentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const activeAgentId = config.agents.find(a => a.id === activeAgent)?.id;
    if (activeAgentId && e.target.value) {
      const agentToolName = `agent_${e.target.value}`;
      if (editingToolIndex !== null) {
        updateTool(activeAgentId, editingToolIndex, agentToolName);
      } else {
        handleAddTool(activeAgentId, agentToolName);
      }
      onClose(); // Close modal after selection
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-primary">
            {editingToolIndex !== null ? 
              t('dashboard.editor.agent.toolModal.editTitle') : 
              t('dashboard.editor.agent.toolModal.addTitle')
            }
          </h3>
          <button 
            onClick={onClose}
            className="text-secondary hover:text-primary"
            title={t('dashboard.editor.agent.toolModal.closeTooltip')} // Added tooltip
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Tool Type Selection (only when adding new) */}
        {editingToolIndex === null && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-secondary mb-1">
              {t('dashboard.editor.agent.toolModal.toolTypeLabel')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setCurrentToolType('built-in')}
                className={`p-2 rounded border ${
                  currentToolType === 'built-in' 
                    ? 'border-accent bg-accent/10 text-accent' 
                    : 'border-border text-secondary hover:text-primary'
                }`}
              >
                {t('dashboard.editor.agent.toolModal.builtInButton')}
              </button>
              <button
                onClick={handleApiCallClick}
                className={`p-2 rounded border ${
                  currentToolType === 'api-call' // Note: This state won't persist after click
                    ? 'border-accent bg-accent/10 text-accent' 
                    : 'border-border text-secondary hover:text-primary'
                }`}
              >
                {t('dashboard.editor.agent.toolModal.apiCallButton')}
              </button>
              <button
                onClick={() => setCurrentToolType('agent')}
                className={`p-2 rounded border ${
                  currentToolType === 'agent' 
                    ? 'border-accent bg-accent/10 text-accent' 
                    : 'border-border text-secondary hover:text-primary'
                }`}
              >
                {t('dashboard.editor.agent.toolModal.agentToolButton')}
              </button>
            </div>
          </div>
        )}
        
        {/* Built-in Tool Selection */}
        {currentToolType === 'built-in' && (
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              {t('dashboard.editor.agent.toolModal.selectBuiltInLabel')}
            </label>
            <select
              className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
              onChange={handleBuiltInSelect}
              defaultValue={editingToolIndex !== null ? (config.agents.find(a => a.id === activeAgent)?.tools[editingToolIndex] as string) || "" : ""} // Set default value when editing
            >
              <option value="">{t('dashboard.editor.agent.toolModal.selectToolOption')}</option>
              {BUILT_IN_TOOLS.map(tool => (
                <option key={tool} value={tool}>{tool}</option>
              ))}
            </select>
          </div>
        )}
        
        {/* Agent Tool Selection */}
        {currentToolType === 'agent' && (
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              {t('dashboard.editor.agent.toolModal.selectAgentToolLabel')}
            </label>
            <select
              className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
              onChange={handleAgentSelect}
              defaultValue={editingToolIndex !== null ? (config.agents.find(a => a.id === activeAgent)?.tools[editingToolIndex] as string)?.substring(6) || "" : ""} // Set default value when editing
            >
              <option value="">{t('dashboard.editor.agent.toolModal.selectAgentOption')}</option>
              {config.agents
                .filter(a => a.id !== activeAgent) // Exclude current agent
                .map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))
              }
            </select>
          </div>
        )}
      </div>
    </div>
  );
} 