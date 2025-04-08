'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { AgentDefinition, AgentTool, BuiltInTool } from './Agent';
import { useSafeTranslation } from '@/components/I18nProvider';

// Helper function for deep cloning (to avoid modifying state directly)
// You might want to use a library like lodash.cloneDeep in a real app
const deepClone = (obj: unknown) => JSON.parse(JSON.stringify(obj));

interface AgentToolsSectionProps {
  agent: AgentDefinition;
  chatbotId: string;
  addTool: (agentId: string, toolType: 'built-in' | 'api-call' | 'agent') => void;
  editTool: (agentId: string, toolIndex: number) => void;
  removeTool: (agentId: string, toolIndex: number) => void;
  onUpdateAgent: (updatedAgent: AgentDefinition) => void;
}

// --- Determine Tool Type Function ---
// Helper to determine the type and name for display, accommodating different structures
const getToolInfo = (tool: AgentTool | BuiltInTool | string): { type: string; name: string; isFileSearch: boolean, vectorStoreId?: string } => {
  if (typeof tool === 'string') {
    const isAgentTool = tool.startsWith('agent_');
    return {
      type: isAgentTool ? 'agent' : 'built-in',
      name: isAgentTool ? tool.substring(6) : tool,
      isFileSearch: tool === 'file_search',
      vectorStoreId: undefined // Strings can't hold vector_store_id
    };
  }
  
  if ('api_config' in tool) {
    return { type: 'api-call', name: tool.name, isFileSearch: false, vectorStoreId: undefined };
  }
  
  // Safe check for the BuiltInTool type
  if ('type' in tool && tool.type === 'built-in') {
    return {
      type: 'built-in',
      name: tool.name,
      isFileSearch: tool.name === 'file_search',
      vectorStoreId: tool.vector_store_id
    };
  }
  
  // Must be an agent tool then
  return { 
    type: 'agent', 
    name: tool.name, 
    isFileSearch: false, 
    vectorStoreId: undefined 
  };
};

export default function AgentToolsSection({
  agent,
  chatbotId,
  addTool,
  editTool,
  removeTool,
  onUpdateAgent
}: AgentToolsSectionProps) {
  const { t } = useSafeTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<{ [key: number]: string | null }>({}); // Status per tool index
  const [isUploading, setIsUploading] = useState<{ [key: number]: boolean }>({}); // Loading state per tool index

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>, toolIndex: number) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setUploadStatus(prev => ({ ...prev, [toolIndex]: t('dashboard.editor.agent.toolsSection.fileSearch.noFilesSelected') }));
      return;
    }

    setIsUploading(prev => ({ ...prev, [toolIndex]: true }));
    setUploadStatus(prev => ({ ...prev, [toolIndex]: t('dashboard.editor.agent.toolsSection.fileSearch.uploading') }));

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/agents/${chatbotId}/files`, {
        method: 'POST',
        body: formData,
        // Add headers if needed, e.g., for authentication
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || t('dashboard.editor.agent.toolsSection.fileSearch.uploadErrorGeneric'));
      }

      const vectorStoreId = result.vector_store_id;
      if (!vectorStoreId) {
        throw new Error(t('dashboard.editor.agent.toolsSection.fileSearch.missingVectorStoreId'));
      }

      // Update the agent state
      const updatedAgent = deepClone(agent); // Create a deep copy
      const tool = updatedAgent.tools[toolIndex];

      // Convert string tool to object if needed or update existing object
      if (typeof tool === 'string' && tool === 'file_search') {
        // Convert string to object with proper structure
        updatedAgent.tools[toolIndex] = {
          type: 'built-in',
          name: 'file_search',
          vector_store_id: vectorStoreId
        };
        onUpdateAgent(updatedAgent);
        setUploadStatus(prev => ({ ...prev, [toolIndex]: `${t('dashboard.editor.agent.toolsSection.fileSearch.uploadSuccess')} ID: ${vectorStoreId}` }));
      } 
      else if (typeof tool === 'object' && 
               ((tool.name === 'file_search') || 
                ('type' in tool && tool.type === 'built-in' && tool.name === 'file_search'))) {
        // Update existing object
        updatedAgent.tools[toolIndex] = {
          ...tool,
          type: 'built-in', // Ensure correct type
          name: 'file_search',
          vector_store_id: vectorStoreId
        };
        onUpdateAgent(updatedAgent);
        setUploadStatus(prev => ({ ...prev, [toolIndex]: `${t('dashboard.editor.agent.toolsSection.fileSearch.uploadSuccess')} ID: ${vectorStoreId}` }));
      } else {
        console.error("Tool structure mismatch or trying to update wrong tool type", tool);
        setUploadStatus(prev => ({...prev, [toolIndex]: t('dashboard.editor.agent.toolsSection.fileSearch.toolUpdateError')}));
      }

    } catch (error) {
      console.error("File upload error:", error);
      const errorMessage = error instanceof Error ? error.message : t('dashboard.editor.agent.toolsSection.fileSearch.uploadErrorGeneric');
      setUploadStatus(prev => ({ ...prev, [toolIndex]: `${t('dashboard.editor.agent.toolsSection.fileSearch.uploadErrorLabel')}: ${errorMessage}` }));
    } finally {
      setIsUploading(prev => ({ ...prev, [toolIndex]: false }));
      // Reset file input value so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
        <div className="space-y-3">
          {agent.tools.map((tool, index) => {
            const { type, name, isFileSearch, vectorStoreId } = getToolInfo(tool);
            const currentUploadStatus = uploadStatus[index];
            const currentIsUploading = isUploading[index] ?? false;

            // Get display type text based on type
            let displayType = t('dashboard.editor.agent.toolsSection.unknownToolType');
            if (type === 'built-in') displayType = t('dashboard.editor.agent.toolsSection.builtInToolType');
            else if (type === 'api-call') displayType = t('dashboard.editor.agent.toolsSection.apiCallToolType');
            else if (type === 'agent') displayType = t('dashboard.editor.agent.toolsSection.agentToolType');

            return (
              <div key={index} className="rounded-md border border-border bg-dark p-3 space-y-2">
                <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-2">
                     <span className="text-xs bg-accent/20 rounded px-2 py-1 text-accent whitespace-nowrap">
                       {displayType}
                     </span>
                     <span className="text-sm text-primary font-medium">{name}</span>
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

                {type === 'api-call' && typeof tool !== 'string' && (
                  <>
                    {(tool as AgentTool).description && (
                      <div className="text-sm text-secondary">
                        {(tool as AgentTool).description}
                      </div>
                    )}
                    {(tool as AgentTool).parameters && Object.keys((tool as AgentTool).parameters?.properties || {}).length > 0 && (
                      <div className="text-xs">
                        <span className="text-secondary">{t('dashboard.editor.agent.toolsSection.parametersLabel')}: </span>
                        <span className="text-primary">{Object.keys((tool as AgentTool).parameters?.properties || {}).join(", ")}</span>
                      </div>
                    )}
                    {(tool as AgentTool).api_config && (
                      <div className="text-xs">
                        <span className="text-secondary">{t('dashboard.editor.agent.toolsSection.apiLabel')}: </span>
                        <span className="text-primary">
                          {(tool as AgentTool).api_config?.method} {(tool as AgentTool).api_config?.url}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {isFileSearch && (
                  <div className="mt-2 pt-2 border-t border-border/50 space-y-2">
                    <div>
                       <label className="block text-xs font-medium text-secondary mb-1">
                         {t('dashboard.editor.agent.toolsSection.fileSearch.vectorStoreIdLabel')}
                       </label>
                       <div className="text-sm text-primary bg-dark/50 rounded px-2 py-1 border border-border/30 min-h-[24px]">
                         {vectorStoreId || <span className="text-secondary italic">{t('dashboard.editor.agent.toolsSection.fileSearch.noVectorStoreId')}</span>}
                       </div>
                    </div>

                    <div>
                      <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={(e) => handleFileChange(e, index)}
                        className="hidden"
                        accept="*" // Or specify accepted file types e.g. ".pdf,.txt,.md"
                      />
                      <button
                        onClick={handleUploadButtonClick}
                        disabled={currentIsUploading}
                        className={`text-xs px-2 py-1 rounded text-dark ${currentIsUploading ? 'bg-secondary cursor-not-allowed' : 'bg-accent hover:bg-accent/80'}`}
                      >
                        {currentIsUploading
                          ? t('dashboard.editor.agent.toolsSection.fileSearch.uploadingButton')
                          : vectorStoreId
                              ? t('dashboard.editor.agent.toolsSection.fileSearch.updateVectorStoreButton')
                              : t('dashboard.editor.agent.toolsSection.fileSearch.createVectorStoreButton')}
                      </button>
                    </div>

                    {currentUploadStatus && (
                      <div className={`text-xs mt-1 p-1 rounded ${currentUploadStatus.startsWith(t('dashboard.editor.agent.toolsSection.fileSearch.uploadErrorLabel')) ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
                         {currentUploadStatus}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 