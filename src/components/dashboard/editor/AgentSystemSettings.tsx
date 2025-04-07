'use client';

import { AgentConfig, AgentAttribute } from './Agent'; // Assuming types are exported from Agent.tsx initially
import { useSafeTranslation } from '@/components/I18nProvider';

const VALID_TYPES = ["str", "int", "float", "bool", "list", "dict", "List[str]", "Dict[str, Any]"];
const MODEL_OPTIONS = ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo", "claude-3-opus", "claude-3-sonnet"];

interface AgentSystemSettingsProps {
  config: AgentConfig;
  updateSystemName: (name: string) => void;
  updateDefaultModel: (model: string) => void;
  updateContextClassName: (name: string) => void;
  addContextAttribute: () => void;
  updateContextAttribute: (index: number, attr: AgentAttribute) => void;
  removeContextAttribute: (index: number) => void;
}

export default function AgentSystemSettings({ 
  config, 
  updateSystemName,
  updateDefaultModel,
  updateContextClassName,
  addContextAttribute,
  updateContextAttribute,
  removeContextAttribute
}: AgentSystemSettingsProps) {
  const { t } = useSafeTranslation();

  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <h3 className="font-medium text-primary">{t('dashboard.editor.agent.systemSettings.title')}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            {t('dashboard.editor.agent.systemSettings.systemNameLabel')}
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
            {t('dashboard.editor.agent.systemSettings.defaultModelLabel')}
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
          <h4 className="text-sm font-medium text-primary">{t('dashboard.editor.agent.systemSettings.contextClassTitle')}</h4>
        </div>
        
        <div className="mb-2">
          <label className="block text-sm font-medium text-secondary mb-1">
            {t('dashboard.editor.agent.systemSettings.contextClassNameLabel')}
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
              {t('dashboard.editor.agent.systemSettings.contextAttributesTitle')}
            </label>
            <button
              onClick={addContextAttribute}
              className="text-xs px-2 py-1 rounded bg-dark hover:bg-dark/80 text-primary"
            >
              {t('dashboard.editor.agent.systemSettings.addAttributeButton')}
            </button>
          </div>
          
          {config.context_class.attributes.length === 0 ? (
            <p className="text-sm text-secondary italic">{t('dashboard.editor.agent.systemSettings.noAttributes')}</p>
          ) : (
            <div className="space-y-2">
              {config.context_class.attributes.map((attr, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={attr.name}
                    onChange={(e) => updateContextAttribute(index, { ...attr, name: e.target.value })}
                    placeholder={t('dashboard.editor.agent.systemSettings.attributeNamePlaceholder')}
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
                    placeholder={t('dashboard.editor.agent.systemSettings.attributeDefaultPlaceholder')}
                    className="flex-1 rounded-md border border-border bg-dark px-3 py-1 text-sm text-primary focus:border-accent focus:outline-none"
                  />
                  
                  <button
                    onClick={() => removeContextAttribute(index)}
                    className="text-red-400 hover:text-red-300"
                    title={t('dashboard.editor.agent.systemSettings.removeAttributeTitle')}
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
  );
} 