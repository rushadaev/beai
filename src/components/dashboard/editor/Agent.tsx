'use client';

import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import ApiConfigModal, { ApiToolConfig } from './ApiConfigModal';
import { useSafeTranslation } from '@/components/I18nProvider';
import AgentSystemSettings from './AgentSystemSettings';
import AgentListTabs from './AgentListTabs';
import ActiveAgentEditor from './ActiveAgentEditor';
import AgentTestingSection from './AgentTestingSection';
import AgentApiEndpoints from './AgentApiEndpoints';
import ToolSelectionModal from './ToolSelectionModal';
import { JudgeLoopSettings } from './JudgeLoopConfig';

// Export interfaces for use in sub-components
export interface AgentAttribute {
  name: string;
  type: string;
  default?: string;
}

export interface BuiltInTool {
  type: 'built-in';
  name: string; // e.g., 'file_search'
  description?: string; // Optional description
  vector_store_id?: string; // Specific to file_search
}

export interface AgentTool {
  name: string;
  description?: string;
  parameters?: {
    type: string;
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
    additionalProperties?: boolean;
  };
  api_config?: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    headers?: Record<string, string>;
    query_params?: Record<string, string>;
    body_template?: Record<string, unknown>;
    response_template?: Record<string, unknown>;
  };
}

export interface AgentDefinition {
  id: string;
  name: string;
  instructions: string;
  model?: string;
  handoff_description?: string;
  tools: (string | AgentTool | BuiltInTool)[];
  handoffs: string[];
  output_type?: {
    name: string;
    schema: {
      type: string;
      properties: Record<string, {
        type: string;
        description: string;
        enum?: string[];
      }>;
      required: string[];
    };
  };
}

export interface AgentConfig {
  system_name: string;
  context_class: {
    name: string;
    attributes: AgentAttribute[];
  };
  agents: AgentDefinition[];
  router_agent_id: string;
  default_model: string;
  workflow_type?: 'simple_router' | 'judge_loop';
  judge_loop_settings?: {
    generator_agent_id: string;
    evaluator_agent_id: string;
    max_iterations: number;
    pass_field: string;
    pass_value: string;
    feedback_field: string;
  };
}

interface AgentProps {
  initialConfig?: AgentConfig;
  onUpdate?: (config: AgentConfig) => void;
  onPreviewUpdate?: (config: AgentConfig) => void;
  onSaved?: () => void;
  isSaving?: boolean;
  chatbotId?: string;
}

const DEFAULT_AGENT_CONFIG: AgentConfig = {
  system_name: "AssistantSystem",
  context_class: {
    name: "UserContext",
    attributes: [
      { name: "user_id", type: "str" },
      { name: "conversation_history", type: "str", default: "" }
    ]
  },
  agents: [
    {
      id: "main_assistant",
      name: "Main Assistant",
      instructions: "You are a helpful assistant. Answer the user's questions clearly and concisely.",
      tools: [],
      handoffs: []
    }
  ],
  router_agent_id: "main_assistant",
  default_model: "gpt-4.1-mini",
  workflow_type: "simple_router"
};

// Import or define the AgentResponse interface
interface AgentResponse {
  response?: string;
  content?: string;
  iterations?: Array<{
    content?: string;
    generated_content?: string;
    evaluation?: {
      score: string;
      feedback: string;
    };
  }>;
  [key: string]: unknown;
}

export default function Agent({ 
  initialConfig, 
  onUpdate, 
  onPreviewUpdate,
  onSaved,
  isSaving = false,
  chatbotId
}: AgentProps) {
  const { t } = useSafeTranslation();
  const [config, setConfig] = useState<AgentConfig>(initialConfig || DEFAULT_AGENT_CONFIG);
  const [activeAgent, setActiveAgent] = useState<string>(config?.agents[0]?.id || "");
  const [configSaved, setConfigSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showToolModal, setShowToolModal] = useState(false);
  const [currentToolType, setCurrentToolType] = useState<'built-in' | 'api-call' | 'agent' | null>(null);
  const [editingToolIndex, setEditingToolIndex] = useState<number | null>(null);
  const [showApiConfigModal, setShowApiConfigModal] = useState(false);
  const [currentApiConfig, setCurrentApiConfig] = useState<ApiToolConfig | null>(null);
  
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  useEffect(() => {
    if (initialConfig && initialLoad) {
      setConfig(initialConfig);
      setActiveAgent(initialConfig.agents[0]?.id || "");
      // If we have an initial config from the server, it's already saved
      setConfigSaved(true);
      setHasUnsavedChanges(false);
      setInitialLoad(false);
    }
  }, [initialConfig, initialLoad]);

  const handleConfigChange = (newConfig: AgentConfig) => {
    // Keep the current activeAgent if it still exists in the new config
    const agentStillExists = newConfig.agents.some(agent => agent.id === activeAgent);
    
    setConfig(newConfig);
    setHasUnsavedChanges(true);
    
    // Only set a new activeAgent if the current one doesn't exist anymore
    if (!agentStillExists && newConfig.agents.length > 0) {
      setActiveAgent(newConfig.agents[0].id);
    }
    
    if (onPreviewUpdate) {
      onPreviewUpdate(newConfig);
    }
  };

  const updateSystemName = (name: string) => {
    handleConfigChange({
      ...config,
      system_name: name
    });
  };

  const updateContextClassName = (name: string) => {
    handleConfigChange({
      ...config,
      context_class: {
        ...config.context_class,
        name
      }
    });
  };

  const addContextAttribute = () => {
    handleConfigChange({
      ...config,
      context_class: {
        ...config.context_class,
        attributes: [
          ...config.context_class.attributes,
          { name: "", type: "str" }
        ]
      }
    });
  };

  const updateContextAttribute = (index: number, attr: AgentAttribute) => {
    const newAttributes = [...config.context_class.attributes];
    newAttributes[index] = attr;
    
    handleConfigChange({
      ...config,
      context_class: {
        ...config.context_class,
        attributes: newAttributes
      }
    });
  };

  const removeContextAttribute = (index: number) => {
    const newAttributes = [...config.context_class.attributes];
    newAttributes.splice(index, 1);
    
    handleConfigChange({
      ...config,
      context_class: {
        ...config.context_class,
        attributes: newAttributes
      }
    });
  };

  const updateDefaultModel = (model: string) => {
    handleConfigChange({
      ...config,
      default_model: model
    });
  };

  const updateWorkflowType = (type: 'simple_router' | 'judge_loop') => {
    // If switching to judge loop and no judge loop settings exist, initialize with defaults
    if (type === 'judge_loop' && !config.judge_loop_settings) {
      handleConfigChange({
        ...config,
        workflow_type: type,
        judge_loop_settings: {
          generator_agent_id: config.agents[0]?.id || '',
          evaluator_agent_id: config.agents.length > 1 ? config.agents[1].id : config.agents[0]?.id || '',
          max_iterations: 5,
          pass_field: 'score',
          pass_value: 'pass',
          feedback_field: 'feedback'
        }
      });
    } else {
      handleConfigChange({
        ...config,
        workflow_type: type
      });
    }
  };

  const updateJudgeLoopSettings = (settings: JudgeLoopSettings) => {
    handleConfigChange({
      ...config,
      judge_loop_settings: settings
    });
  };

  const updateRouterAgentId = (id: string) => {
    handleConfigChange({
      ...config,
      router_agent_id: id
    });
  };

  const addAgent = () => {
    const newAgentId = `agent_${nanoid(6)}`;
    const newAgent: AgentDefinition = {
      id: newAgentId,
      name: "New Agent",
      instructions: "You are a helpful assistant.",
      tools: [],
      handoffs: []
    };
    
    // First set the active agent to avoid race conditions
    setActiveAgent(newAgentId);
    
    // Then update the config
    handleConfigChange({
      ...config,
      agents: [...config.agents, newAgent]
    });
  };

  const updateAgent = (agentId: string, updates: Partial<AgentDefinition>) => {
    const agentIndex = config.agents.findIndex(a => a.id === agentId);
    if (agentIndex === -1) return;
    
    const newAgents = [...config.agents];
    newAgents[agentIndex] = {
      ...newAgents[agentIndex],
      ...updates
    };
    
    handleConfigChange({
      ...config,
      agents: newAgents
    });
  };

  const removeAgent = (agentId: string) => {
    // Don't remove if it's the last agent
    if (config.agents.length <= 1) return;
    
    const newAgents = config.agents.filter(a => a.id !== agentId);
    const newConfig = {
      ...config,
      agents: newAgents
    };
    
    // Update router if needed
    if (config.router_agent_id === agentId) {
      newConfig.router_agent_id = newAgents[0].id;
    }
    
    // Update handoffs in other agents
    newConfig.agents = newConfig.agents.map(agent => ({
      ...agent,
      handoffs: agent.handoffs.filter(h => h !== agentId)
    }));
    
    handleConfigChange(newConfig);
    setActiveAgent(newAgents[0].id);
  };

  const saveConfig = async () => {
    if (onUpdate) {
      onUpdate(config);
    }
    
    try {
      // Register agent with API
      if (chatbotId) {
        const response = await fetch(`${apiBaseUrl}/api/chatbots/${chatbotId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ config }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to register agent');
        }
        
        // Mark configuration as saved
        setConfigSaved(true);
        setHasUnsavedChanges(false);
        
        // Call onSaved callback if provided
        if (onSaved) {
          onSaved();
        }
      }
    } catch (error) {
      console.error('Error saving agent config:', error);
    }
  };

  const testAgentHandler = async (message: string): Promise<string | AgentResponse> => {
    if (!chatbotId) {
      throw new Error("No chatbot ID available");
    }
    
    setHasUnsavedChanges(false); // Reset the unsaved changes flag for testing
    
    const endpoint = `${apiBaseUrl}/api/chatbots/${chatbotId}/message`;
    const payload = {
      message,
      context: {} // You can add context data here if needed
    };
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error testing agent");
    }
    
    const responseData = await response.json();
    
    // Return the full response object to allow accessing judge loop iterations
    return responseData;
  };

  const addTool = (agentId: string, toolType: 'built-in' | 'api-call' | 'agent') => {
    setCurrentToolType(toolType);
    
    if (toolType === 'api-call') {
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
      setShowApiConfigModal(true);
    } else {
      setShowToolModal(true);
    }
    
    setEditingToolIndex(null);
  };
  
  const handleAddTool = (agentId: string, tool: string | AgentTool) => {
    const agent = config.agents.find(a => a.id === agentId);
    if (!agent) return;
    
    const newTools = [...agent.tools, tool];
    updateAgent(agentId, { tools: newTools });
    setShowToolModal(false);
  };
  
  const editTool = (agentId: string, toolIndex: number) => {
    const agent = config.agents.find(a => a.id === agentId);
    if (!agent) return;
    
    const tool = agent.tools[toolIndex];
    
    if (typeof tool === 'string') {
      if (tool.startsWith('agent_')) {
        setCurrentToolType('agent');
      } else {
        setCurrentToolType('built-in');
      }
      setEditingToolIndex(toolIndex);
      setShowToolModal(true);
    } else {
      // It's an API call tool
      setCurrentToolType('api-call');
      setEditingToolIndex(toolIndex);
      setCurrentApiConfig(tool as unknown as ApiToolConfig);
      setShowApiConfigModal(true);
    }
  };
  
  const updateTool = (agentId: string, toolIndex: number, tool: string | AgentTool) => {
    const agent = config.agents.find(a => a.id === agentId);
    if (!agent) return;
    
    const newTools = [...agent.tools];
    newTools[toolIndex] = tool;
    updateAgent(agentId, { tools: newTools });
    setShowToolModal(false);
  };
  
  const removeTool = (agentId: string, toolIndex: number) => {
    const agent = config.agents.find(a => a.id === agentId);
    if (!agent) return;
    
    const newTools = [...agent.tools];
    newTools.splice(toolIndex, 1);
    updateAgent(agentId, { tools: newTools });
  };

  const handleSaveApiConfig = (apiConfig: ApiToolConfig) => {
    const activeAgentId = config.agents.find(a => a.id === activeAgent)?.id;
    if (!activeAgentId) return;
    
    const agentTool: AgentTool = {
      name: apiConfig.name,
      description: apiConfig.description,
      parameters: apiConfig.parameters,
      api_config: apiConfig.api_config
    };
    
    if (editingToolIndex !== null) {
      updateTool(activeAgentId, editingToolIndex, agentTool);
    } else {
      handleAddTool(activeAgentId, agentTool);
    }
    
    setShowApiConfigModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-primary">{t('dashboard.editor.agent.title')}</h2>
        
        <AgentSystemSettings 
          config={config}
          updateSystemName={updateSystemName}
          updateDefaultModel={updateDefaultModel}
          updateContextClassName={updateContextClassName}
          addContextAttribute={addContextAttribute}
          updateContextAttribute={updateContextAttribute}
          removeContextAttribute={removeContextAttribute}
          updateWorkflowType={updateWorkflowType}
          updateJudgeLoopSettings={updateJudgeLoopSettings}
        />
        
        {/* Agents Section */}
        <div className="space-y-4 rounded-md border border-border p-4">
          <AgentListTabs 
            agents={config.agents}
            activeAgent={activeAgent}
            setActiveAgent={setActiveAgent}
            addAgent={addAgent}
          />
          
          {/* Active Agent Editor */}
          {activeAgent && (
            <div className="space-y-4">
              {config.agents.filter(a => a.id === activeAgent).map((agent) => (
                <ActiveAgentEditor
                  chatbotId={chatbotId || ""}
                  key={agent.id}
                  agent={agent}
                  config={config}
                  updateAgent={updateAgent}
                  removeAgent={removeAgent}
                  updateRouterAgentId={updateRouterAgentId}
                  addTool={addTool}
                  editTool={editTool}
                  removeTool={removeTool}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Testing Section - Replaced with component */}
        <AgentTestingSection
          chatbotId={chatbotId}
          configSaved={configSaved}
          hasUnsavedChanges={hasUnsavedChanges}
          testAgent={testAgentHandler}
        />
        
        {/* API Endpoints Section - Replaced with component */}
        {configSaved && chatbotId && (
          <AgentApiEndpoints 
            chatbotId={chatbotId}
            apiBaseUrl={apiBaseUrl}
          />
        )}
        
        <div className="flex justify-end">
          <button
            onClick={saveConfig}
            disabled={isSaving}
            className={`rounded px-4 py-2 text-sm font-medium text-dark hover:opacity-90 disabled:opacity-50 ${
              hasUnsavedChanges ? "bg-accent" : "bg-green-500"
            }`}
          >
            {isSaving ? 
              t('dashboard.editor.agent.saveButtonSaving') : 
              hasUnsavedChanges ? 
                t('dashboard.editor.agent.saveButtonUnsaved') : 
                t('dashboard.editor.agent.saveButtonSaved')
            }
          </button>
        </div>
      </div>
      
      {/* Tool Selection Modal - Replaced with component */}
      <ToolSelectionModal
        isOpen={showToolModal}
        onClose={() => setShowToolModal(false)}
        config={config}
        activeAgent={activeAgent}
        currentToolType={currentToolType}
        setCurrentToolType={setCurrentToolType}
        editingToolIndex={editingToolIndex}
        handleAddTool={handleAddTool}
        updateTool={updateTool}
        setShowApiConfigModal={setShowApiConfigModal}
        setCurrentApiConfig={setCurrentApiConfig as (config: unknown) => void}
      />
      
      {/* API Config Modal */}
      <ApiConfigModal
        isOpen={showApiConfigModal}
        onClose={() => setShowApiConfigModal(false)}
        apiConfig={currentApiConfig}
        onSave={handleSaveApiConfig}
        isEditing={editingToolIndex !== null}
      />
    </div>
  );
}