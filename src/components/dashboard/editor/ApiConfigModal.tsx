'use client';

import { useState, useEffect } from 'react';

interface ApiParam {
  type: string;
  description: string;
  enum?: string[];
}

export interface ApiToolConfig {
  name: string;
  description?: string;
  parameters?: {
    type: string;
    properties: Record<string, ApiParam>;
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

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiConfig: ApiToolConfig | null;
  onSave: (config: ApiToolConfig) => void;
  isEditing: boolean;
}

const PARAMETER_TYPES = ["string", "number", "integer", "boolean", "array", "object"];
const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE"];

export default function ApiConfigModal({
  isOpen,
  onClose,
  apiConfig,
  onSave,
  isEditing
}: ApiConfigModalProps) {
  const [config, setConfig] = useState<ApiToolConfig>({
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
  
  const [currentTab, setCurrentTab] = useState<'basic' | 'parameters' | 'apiConfig'>('basic');
  const [newParamName, setNewParamName] = useState("");
  const [newParamType, setNewParamType] = useState("string");
  const [newParamDesc, setNewParamDesc] = useState("");
  const [newParamRequired, setNewParamRequired] = useState(true);
  const [newParamEnum, setNewParamEnum] = useState("");
  
  const [newHeaderKey, setNewHeaderKey] = useState("");
  const [newHeaderValue, setNewHeaderValue] = useState("");
  const [newQueryKey, setNewQueryKey] = useState("");
  const [newQueryValue, setNewQueryValue] = useState("");
  
  const [bodyTemplateString, setBodyTemplateString] = useState("{}");
  const [responseTemplateString, setResponseTemplateString] = useState("{}");
  
  useEffect(() => {
    if (apiConfig) {
      setConfig({
        name: apiConfig.name || "",
        description: apiConfig.description || "",
        parameters: apiConfig.parameters || {
          type: "object",
          properties: {},
          required: [],
          additionalProperties: false
        },
        api_config: apiConfig.api_config || {
          method: "GET",
          url: "",
          headers: {},
          query_params: {},
          body_template: {},
          response_template: {}
        }
      });
      
      try {
        setBodyTemplateString(JSON.stringify(apiConfig.api_config?.body_template || {}, null, 2));
        setResponseTemplateString(JSON.stringify(apiConfig.api_config?.response_template || {}, null, 2));
      } catch (e) {
        console.error("Error parsing templates:", e);
      }
    }
  }, [apiConfig]);
  
  const addParameter = () => {
    if (!newParamName.trim()) return;
    
    const updatedConfig = {...config};
    if (!updatedConfig.parameters) {
      updatedConfig.parameters = {
        type: "object",
        properties: {},
        required: [],
        additionalProperties: false
      };
    }
    
    // Add parameter to properties
    updatedConfig.parameters.properties = {
      ...updatedConfig.parameters.properties,
      [newParamName]: {
        type: newParamType,
        description: newParamDesc,
        ...(newParamType === "string" && newParamEnum ? { 
          enum: newParamEnum.split(",").map(v => v.trim())
        } : {})
      }
    };
    
    // Add to required if needed
    if (newParamRequired) {
      updatedConfig.parameters.required = [
        ...updatedConfig.parameters.required,
        newParamName
      ];
    }
    
    setConfig(updatedConfig);
    
    // Reset form
    setNewParamName("");
    setNewParamDesc("");
    setNewParamEnum("");
  };
  
  const removeParameter = (paramName: string) => {
    const updatedConfig = {...config};
    if (!updatedConfig.parameters) return;
    
    // Remove from properties using a more direct approach without unused variables
    updatedConfig.parameters.properties = Object.entries(updatedConfig.parameters.properties)
      .filter(([key]) => key !== paramName)
      .reduce((obj, [key, value]) => ({...obj, [key]: value}), {});
    
    // Remove from required if it exists
    if (updatedConfig.parameters.required.includes(paramName)) {
      updatedConfig.parameters.required = updatedConfig.parameters.required.filter(
        name => name !== paramName
      );
    }
    
    setConfig(updatedConfig);
  };
  
  const addHeader = () => {
    if (!newHeaderKey.trim() || !newHeaderValue.trim()) return;
    
    const updatedConfig = {...config};
    if (!updatedConfig.api_config) {
      updatedConfig.api_config = {
        method: "GET",
        url: "",
        headers: {},
        query_params: {},
        body_template: {},
        response_template: {}
      };
    }
    
    updatedConfig.api_config.headers = {
      ...updatedConfig.api_config.headers,
      [newHeaderKey]: newHeaderValue
    };
    
    setConfig(updatedConfig);
    setNewHeaderKey("");
    setNewHeaderValue("");
  };
  
  const removeHeader = (headerKey: string) => {
    const updatedConfig = {...config};
    if (!updatedConfig.api_config?.headers) return;
    
    // Remove header using a more direct approach without unused variables
    updatedConfig.api_config.headers = Object.entries(updatedConfig.api_config.headers)
      .filter(([key]) => key !== headerKey)
      .reduce((obj, [key, value]) => ({...obj, [key]: value}), {});
    
    setConfig(updatedConfig);
  };
  
  const addQueryParam = () => {
    if (!newQueryKey.trim() || !newQueryValue.trim()) return;
    
    const updatedConfig = {...config};
    if (!updatedConfig.api_config) {
      updatedConfig.api_config = {
        method: "GET",
        url: "",
        headers: {},
        query_params: {},
        body_template: {},
        response_template: {}
      };
    }
    
    updatedConfig.api_config.query_params = {
      ...updatedConfig.api_config.query_params,
      [newQueryKey]: newQueryValue
    };
    
    setConfig(updatedConfig);
    setNewQueryKey("");
    setNewQueryValue("");
  };
  
  const removeQueryParam = (queryKey: string) => {
    const updatedConfig = {...config};
    if (!updatedConfig.api_config?.query_params) return;
    
    // Remove query param using a more direct approach without unused variables
    updatedConfig.api_config.query_params = Object.entries(updatedConfig.api_config.query_params)
      .filter(([key]) => key !== queryKey)
      .reduce((obj, [key, value]) => ({...obj, [key]: value}), {});
    
    setConfig(updatedConfig);
  };
  
  const updateBodyTemplate = () => {
    try {
      const parsedBody = JSON.parse(bodyTemplateString);
      const updatedConfig = {...config};
      if (!updatedConfig.api_config) {
        updatedConfig.api_config = {
          method: "GET",
          url: "",
          headers: {},
          query_params: {},
          body_template: {},
          response_template: {}
        };
      }
      
      updatedConfig.api_config.body_template = parsedBody;
      setConfig(updatedConfig);
    } catch (e) {
      alert(`Invalid JSON for body template: ${e instanceof Error ? e.message : String(e)}`);
    }
  };
  
  const updateResponseTemplate = () => {
    try {
      const parsedResponse = JSON.parse(responseTemplateString);
      const updatedConfig = {...config};
      if (!updatedConfig.api_config) {
        updatedConfig.api_config = {
          method: "GET",
          url: "",
          headers: {},
          query_params: {},
          body_template: {},
          response_template: {}
        };
      }
      
      updatedConfig.api_config.response_template = parsedResponse;
      setConfig(updatedConfig);
    } catch (e) {
      alert(`Invalid JSON for response template: ${e instanceof Error ? e.message : String(e)}`);
    }
  };
  
  const handleSave = () => {
    // Validate minimal requirements
    if (!config.name.trim()) {
      alert("Tool name is required");
      return;
    }
    
    if (!config.api_config?.url.trim()) {
      alert("API URL is required");
      return;
    }
    
    // Update templates before saving
    try {
      if (bodyTemplateString.trim() !== '{}') {
        config.api_config!.body_template = JSON.parse(bodyTemplateString);
      }
      
      if (responseTemplateString.trim() !== '{}') {
        config.api_config!.response_template = JSON.parse(responseTemplateString);
      }
    } catch (e) {
      alert(`Invalid JSON in templates: ${e instanceof Error ? e.message : String(e)}`);
      return;
    }
    
    onSave(config);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-primary">
            {isEditing ? 'Edit API Call' : 'Add API Call'}
          </h3>
          <button 
            onClick={onClose}
            className="text-secondary hover:text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="mb-4 border-b border-border">
          <div className="flex">
            <button 
              onClick={() => setCurrentTab('basic')}
              className={`px-4 py-2 text-sm font-medium ${
                currentTab === 'basic' 
                  ? 'border-b-2 border-accent text-primary' 
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Basic Info
            </button>
            <button 
              onClick={() => setCurrentTab('parameters')}
              className={`px-4 py-2 text-sm font-medium ${
                currentTab === 'parameters' 
                  ? 'border-b-2 border-accent text-primary' 
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Parameters
            </button>
            <button 
              onClick={() => setCurrentTab('apiConfig')}
              className={`px-4 py-2 text-sm font-medium ${
                currentTab === 'apiConfig' 
                  ? 'border-b-2 border-accent text-primary' 
                  : 'text-secondary hover:text-primary'
              }`}
            >
              API Configuration
            </button>
          </div>
        </div>
        
        {/* Basic Info */}
        {currentTab === 'basic' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Tool Name
              </label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({...config, name: e.target.value})}
                className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
                placeholder="create_task"
              />
              <p className="mt-1 text-xs text-secondary">
                The name should be in snake_case and describe what the API call does
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Description
              </label>
              <textarea
                value={config.description || ""}
                onChange={(e) => setConfig({...config, description: e.target.value})}
                className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
                placeholder="Create a new task for a user"
                rows={3}
              />
              <p className="mt-1 text-xs text-secondary">
                Clearly describe what this API call does and when it should be used
              </p>
            </div>
          </div>
        )}
        
        {/* Parameters */}
        {currentTab === 'parameters' && (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-primary">Parameters</h4>
                <label className="text-xs text-secondary">
                  <input 
                    type="checkbox" 
                    checked={config.parameters?.additionalProperties || false}
                    onChange={(e) => {
                      const updatedConfig = {...config};
                      if (!updatedConfig.parameters) {
                        updatedConfig.parameters = {
                          type: "object",
                          properties: {},
                          required: [],
                          additionalProperties: e.target.checked
                        };
                      } else {
                        updatedConfig.parameters.additionalProperties = e.target.checked;
                      }
                      setConfig(updatedConfig);
                    }}
                    className="mr-1"
                  />
                  Allow additional parameters
                </label>
              </div>
              
              {/* Parameter List */}
              <div className="border border-border rounded-md overflow-hidden mb-4">
                <table className="w-full text-sm text-left">
                  <thead className="bg-dark">
                    <tr>
                      <th className="px-4 py-2 text-secondary">Parameter</th>
                      <th className="px-4 py-2 text-secondary">Type</th>
                      <th className="px-4 py-2 text-secondary">Required</th>
                      <th className="px-4 py-2 text-secondary">Description</th>
                      <th className="px-4 py-2 text-secondary"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(config.parameters?.properties || {}).map(([name, param]) => (
                      <tr key={name} className="border-t border-border">
                        <td className="px-4 py-2 text-primary">{name}</td>
                        <td className="px-4 py-2 text-primary">{param.type}</td>
                        <td className="px-4 py-2 text-primary">
                          {config.parameters?.required.includes(name) ? 'Yes' : 'No'}
                        </td>
                        <td className="px-4 py-2 text-primary">{param.description}</td>
                        <td className="px-4 py-2 text-primary">
                          <button
                            onClick={() => removeParameter(name)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {Object.keys(config.parameters?.properties || {}).length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-secondary text-center italic">
                          No parameters defined yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Add Parameter Form */}
              <div className="border border-border rounded-md p-4 bg-dark/50">
                <h5 className="font-medium text-sm text-primary mb-3">Add Parameter</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-secondary mb-1">Name</label>
                    <input
                      type="text"
                      value={newParamName}
                      onChange={(e) => setNewParamName(e.target.value)}
                      className="w-full rounded-md border border-border bg-dark px-2 py-1 text-sm text-primary focus:border-accent focus:outline-none"
                      placeholder="user_id"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-secondary mb-1">Type</label>
                    <select
                      value={newParamType}
                      onChange={(e) => setNewParamType(e.target.value)}
                      className="w-full rounded-md border border-border bg-dark px-2 py-1 text-sm text-primary focus:border-accent focus:outline-none"
                    >
                      {PARAMETER_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs text-secondary mb-1">Description</label>
                    <input
                      type="text"
                      value={newParamDesc}
                      onChange={(e) => setNewParamDesc(e.target.value)}
                      className="w-full rounded-md border border-border bg-dark px-2 py-1 text-sm text-primary focus:border-accent focus:outline-none"
                      placeholder="User identifier"
                    />
                  </div>
                  
                  {newParamType === 'string' && (
                    <div className="md:col-span-2">
                      <label className="block text-xs text-secondary mb-1">
                        Enum Values (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={newParamEnum}
                        onChange={(e) => setNewParamEnum(e.target.value)}
                        className="w-full rounded-md border border-border bg-dark px-2 py-1 text-sm text-primary focus:border-accent focus:outline-none"
                        placeholder="low, medium, high"
                      />
                    </div>
                  )}
                  
                  <div className="md:col-span-2 flex items-center">
                    <label className="flex items-center text-sm text-secondary">
                      <input
                        type="checkbox"
                        checked={newParamRequired}
                        onChange={(e) => setNewParamRequired(e.target.checked)}
                        className="mr-2"
                      />
                      Required parameter
                    </label>
                  </div>
                </div>
                
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={addParameter}
                    disabled={!newParamName.trim() || !newParamDesc.trim()}
                    className="rounded bg-accent px-3 py-1 text-xs font-medium text-dark hover:bg-accent/80 disabled:opacity-50"
                  >
                    Add Parameter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* API Configuration */}
        {currentTab === 'apiConfig' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  HTTP Method
                </label>
                <select
                  value={config.api_config?.method || "GET"}
                  onChange={(e) => {
                    const updatedConfig = {...config};
                    if (!updatedConfig.api_config) {
                      updatedConfig.api_config = {
                        method: e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE',
                        url: "",
                        headers: {},
                        query_params: {},
                        body_template: {},
                        response_template: {}
                      };
                    } else {
                      updatedConfig.api_config.method = e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE';
                    }
                    setConfig(updatedConfig);
                  }}
                  className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
                >
                  {HTTP_METHODS.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  API URL
                </label>
                <input
                  type="text"
                  value={config.api_config?.url || ""}
                  onChange={(e) => {
                    const updatedConfig = {...config};
                    if (!updatedConfig.api_config) {
                      updatedConfig.api_config = {
                        method: "GET",
                        url: e.target.value,
                        headers: {},
                        query_params: {},
                        body_template: {},
                        response_template: {}
                      };
                    } else {
                      updatedConfig.api_config.url = e.target.value;
                    }
                    setConfig(updatedConfig);
                  }}
                  className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
                  placeholder="https://api.example.com/users/{user_id}"
                />
                <p className="mt-1 text-xs text-secondary">
                  Use {"{parameter_name}"} syntax to include parameter values in the URL
                </p>
              </div>
            </div>
            
            {/* Headers */}
            <div>
              <h4 className="text-sm font-medium text-primary mb-2">Headers</h4>
              <div className="border border-border rounded-md overflow-hidden mb-3">
                <table className="w-full text-sm text-left">
                  <thead className="bg-dark">
                    <tr>
                      <th className="px-4 py-2 text-secondary">Name</th>
                      <th className="px-4 py-2 text-secondary">Value</th>
                      <th className="px-4 py-2 text-secondary"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(config.api_config?.headers || {}).map(([key, value]) => (
                      <tr key={key} className="border-t border-border">
                        <td className="px-4 py-2 text-primary">{key}</td>
                        <td className="px-4 py-2 text-primary">{value}</td>
                        <td className="px-4 py-2 text-primary">
                          <button
                            onClick={() => removeHeader(key)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {Object.keys(config.api_config?.headers || {}).length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-secondary text-center italic">
                          No headers defined yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newHeaderKey}
                  onChange={(e) => setNewHeaderKey(e.target.value)}
                  placeholder="Header name"
                  className="flex-1 rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
                />
                <input
                  type="text"
                  value={newHeaderValue}
                  onChange={(e) => setNewHeaderValue(e.target.value)}
                  placeholder="Header value"
                  className="flex-1 rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
                />
                <button
                  onClick={addHeader}
                  disabled={!newHeaderKey.trim() || !newHeaderValue.trim()}
                  className="rounded bg-accent px-3 py-1 text-sm font-medium text-dark hover:bg-accent/80 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
            
            {/* Query Parameters */}
            <div>
              <h4 className="text-sm font-medium text-primary mb-2">Query Parameters</h4>
              <div className="border border-border rounded-md overflow-hidden mb-3">
                <table className="w-full text-sm text-left">
                  <thead className="bg-dark">
                    <tr>
                      <th className="px-4 py-2 text-secondary">Name</th>
                      <th className="px-4 py-2 text-secondary">Value</th>
                      <th className="px-4 py-2 text-secondary"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(config.api_config?.query_params || {}).map(([key, value]) => (
                      <tr key={key} className="border-t border-border">
                        <td className="px-4 py-2 text-primary">{key}</td>
                        <td className="px-4 py-2 text-primary">{value}</td>
                        <td className="px-4 py-2 text-primary">
                          <button
                            onClick={() => removeQueryParam(key)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {Object.keys(config.api_config?.query_params || {}).length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-secondary text-center italic">
                          No query parameters defined yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newQueryKey}
                  onChange={(e) => setNewQueryKey(e.target.value)}
                  placeholder="Parameter name"
                  className="flex-1 rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
                />
                <input
                  type="text"
                  value={newQueryValue}
                  onChange={(e) => setNewQueryValue(e.target.value)}
                  placeholder="Parameter value or {template}"
                  className="flex-1 rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
                />
                <button
                  onClick={addQueryParam}
                  disabled={!newQueryKey.trim() || !newQueryValue.trim()}
                  className="rounded bg-accent px-3 py-1 text-sm font-medium text-dark hover:bg-accent/80 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-secondary mb-4">
                Use {"{parameter_name}"} syntax to include parameter values in query parameters
              </p>
            </div>
            
            {/* Body Template */}
            {(config.api_config?.method === 'POST' || config.api_config?.method === 'PUT') && (
              <div>
                <h4 className="text-sm font-medium text-primary mb-2">Body Template (JSON)</h4>
                <textarea
                  value={bodyTemplateString}
                  onChange={(e) => setBodyTemplateString(e.target.value)}
                  className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary font-mono focus:border-accent focus:outline-none"
                  rows={6}
                  placeholder='{
  "name": "{task_name}",
  "priority": "{priority}"
}'
                />
                <div className="flex justify-end mt-1">
                  <button
                    onClick={updateBodyTemplate}
                    className="rounded bg-dark px-3 py-1 text-xs font-medium text-primary hover:bg-dark/80"
                  >
                    Validate JSON
                  </button>
                </div>
                <p className="text-xs text-secondary mt-1">
                  Use {"{parameter_name}"} syntax to include parameter values in the body template
                </p>
              </div>
            )}
            
            {/* Response Template */}
            <div>
              <h4 className="text-sm font-medium text-primary mb-2">Response Template (JSON)</h4>
              <textarea
                value={responseTemplateString}
                onChange={(e) => setResponseTemplateString(e.target.value)}
                className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary font-mono focus:border-accent focus:outline-none"
                rows={6}
                placeholder='{
  "id": "task_123",
  "name": "{task_name}",
  "user_id": "{user_id}"
}'
              />
              <div className="flex justify-end mt-1">
                <button
                  onClick={updateResponseTemplate}
                  className="rounded bg-dark px-3 py-1 text-xs font-medium text-primary hover:bg-dark/80"
                >
                  Validate JSON
                </button>
              </div>
              <p className="text-xs text-secondary mt-1">
                Use {"{parameter_name}"} syntax to map parameters to the response template
              </p>
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="rounded border border-border px-4 py-2 text-sm font-medium text-secondary hover:text-primary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-dark hover:bg-accent/80"
          >
            {isEditing ? 'Update API Call' : 'Add API Call'}
          </button>
        </div>
      </div>
    </div>
  );
} 