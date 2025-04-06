'use client';

import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';

interface AgentAttribute {
  name: string;
  type: string;
  default?: string;
}

interface AgentTool {
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
  };
}

interface AgentDefinition {
  id: string;
  name: string;
  instructions: string;
  model?: string;
  handoff_description?: string;
  tools: (string | AgentTool)[];
  handoffs: string[];
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
  default_model: "gpt-4o-mini"
};

const VALID_TYPES = ["str", "int", "float", "bool", "list", "dict", "List[str]", "Dict[str, Any]"];
const MODEL_OPTIONS = ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo", "claude-3-opus", "claude-3-sonnet"];

export default function Agent({ 
  initialConfig, 
  onUpdate, 
  onPreviewUpdate,
  onSaved,
  isSaving = false,
  chatbotId
}: AgentProps) {
  const [config, setConfig] = useState<AgentConfig>(initialConfig || DEFAULT_AGENT_CONFIG);
  const [activeAgent, setActiveAgent] = useState<string>(config.agents[0]?.id || "");
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
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
        const response = await fetch(`http://localhost:8000/api/agents/${chatbotId}`, {
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

  const testAgent = async () => {
    if (!testMessage.trim() || !chatbotId) return;
    
    setIsTesting(true);
    try {
      const response = await fetch('http://localhost:8000/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: chatbotId,
          message: testMessage,
          stream: false
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from agent');
      }
      
      const data = await response.json();
      setTestResponse(data.response);
    } catch (error) {
      console.error('Error testing agent:', error);
      setTestResponse('Error: Failed to get response from agent');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-primary">Agent Configuration</h2>
        
        {/* System Settings */}
        <div className="space-y-4 rounded-md border border-border p-4">
          <h3 className="font-medium text-primary">System Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                System Name
              </label>
              <input
                type="text"
                value={config.system_name}
                onChange={(e) => updateSystemName(e.target.value)}
                className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Default Model
              </label>
              <select
                value={config.default_model}
                onChange={(e) => updateDefaultModel(e.target.value)}
                className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
              >
                {MODEL_OPTIONS.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Context Class */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-primary">Context Class</h4>
            </div>
            
            <div className="mb-2">
              <label className="block text-sm font-medium text-secondary mb-1">
                Context Class Name
              </label>
              <input
                type="text"
                value={config.context_class.name}
                onChange={(e) => updateContextClassName(e.target.value)}
                className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-secondary">
                  Context Attributes
                </label>
                <button
                  onClick={addContextAttribute}
                  className="text-xs px-2 py-1 rounded bg-dark hover:bg-dark/80 text-primary"
                >
                  + Add Attribute
                </button>
              </div>
              
              {config.context_class.attributes.length === 0 ? (
                <p className="text-sm text-secondary italic">No attributes defined</p>
              ) : (
                <div className="space-y-2">
                  {config.context_class.attributes.map((attr, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={attr.name}
                        onChange={(e) => updateContextAttribute(index, { ...attr, name: e.target.value })}
                        placeholder="Name"
                        className="flex-1 rounded-md border border-border bg-dark px-3 py-1 text-sm text-primary focus:border-accent focus:outline-none"
                      />
                      
                      <select
                        value={attr.type}
                        onChange={(e) => updateContextAttribute(index, { ...attr, type: e.target.value })}
                        className="rounded-md border border-border bg-dark px-3 py-1 text-sm text-primary focus:border-accent focus:outline-none"
                      >
                        {VALID_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      
                      <input
                        type="text"
                        value={attr.default || ""}
                        onChange={(e) => updateContextAttribute(index, { ...attr, default: e.target.value })}
                        placeholder="Default (optional)"
                        className="flex-1 rounded-md border border-border bg-dark px-3 py-1 text-sm text-primary focus:border-accent focus:outline-none"
                      />
                      
                      <button
                        onClick={() => removeContextAttribute(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Agents */}
        <div className="space-y-4 rounded-md border border-border p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-primary">Agents</h3>
            <button
              onClick={addAgent}
              className="rounded bg-accent px-2 py-1 text-xs font-medium text-dark hover:bg-accent/80"
            >
              + Add Agent
            </button>
          </div>
          
          {/* Agent Tabs */}
          {config.agents.length > 0 && (
            <div className="border-b border-border">
              <div className="flex flex-wrap">
                {config.agents.map((agent) => (
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
          
          {/* Active Agent Editor */}
          {activeAgent && (
            <div className="space-y-4">
              {config.agents.filter(a => a.id === activeAgent).map((agent) => (
                <div key={agent.id} className="space-y-4">
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
                        Router Agent
                      </label>
                      
                      <button
                        onClick={() => removeAgent(agent.id)}
                        disabled={config.agents.length <= 1}
                        className="text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">
                      Instructions
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
                      Model (optional, defaults to system default)
                    </label>
                    <select
                      value={agent.model || ""}
                      onChange={(e) => updateAgent(agent.id, { model: e.target.value || undefined })}
                      className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
                    >
                      <option value="">Use Default ({config.default_model})</option>
                      {MODEL_OPTIONS.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">
                      Handoff Description (optional)
                    </label>
                    <input
                      type="text"
                      value={agent.handoff_description || ""}
                      onChange={(e) => updateAgent(agent.id, { handoff_description: e.target.value || undefined })}
                      className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
                      placeholder="Description of when to hand off to this agent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">
                      Available Handoffs
                    </label>
                    {config.agents.filter(a => a.id !== agent.id).length === 0 ? (
                      <p className="text-sm text-secondary italic">No other agents available for handoff</p>
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
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Testing Section */}
        <div className="space-y-4 rounded-md border border-border p-4">
          <h3 className="font-medium text-primary">Test Agent</h3>
          
          {!configSaved && (
            <div className="mb-3 rounded-md bg-accent/10 p-2 text-sm text-primary border border-accent/30">
              <span className="font-medium">Note:</span> You must save your agent configuration before testing.
            </div>
          )}
          
          {hasUnsavedChanges && configSaved && (
            <div className="mb-3 rounded-md bg-yellow-500/10 p-2 text-sm text-yellow-400 border border-yellow-500/30">
              <span className="font-medium">Warning:</span> You have unsaved changes. Save your configuration to test with the latest changes.
            </div>
          )}
          
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Test Message
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter a message to test with the agent..."
                  className="flex-1 rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
                />
                <button
                  onClick={testAgent}
                  disabled={isTesting || !testMessage.trim() || !chatbotId || !configSaved}
                  className="rounded bg-accent px-3 py-2 text-sm font-medium text-dark hover:bg-accent/80 disabled:opacity-50"
                  title={!configSaved ? "Save configuration first" : ""}
                >
                  {isTesting ? 'Testing...' : 'Test'}
                </button>
              </div>
            </div>
            
            {testResponse && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-secondary mb-1">
                  Response
                </label>
                <div className="rounded-md border border-border bg-dark p-3 text-sm text-primary">
                  {testResponse}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={saveConfig}
            disabled={isSaving}
            className={`rounded px-4 py-2 text-sm font-medium text-dark hover:opacity-90 disabled:opacity-50 ${
              hasUnsavedChanges ? "bg-accent" : "bg-green-500"
            }`}
          >
            {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Configuration' : 'Configuration Saved'}
          </button>
        </div>
      </div>
    </div>
  );
} 