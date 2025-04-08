'use client';

import { useState, useEffect } from 'react';
import { AgentDefinition } from './Agent';
import { useSafeTranslation } from '@/components/I18nProvider';

export interface JudgeLoopSettings {
  generator_agent_id: string;
  evaluator_agent_id: string;
  max_iterations: number;
  pass_field: string;
  pass_value: string;
  feedback_field: string;
}

interface JudgeLoopConfigProps {
  settings: JudgeLoopSettings;
  agents: AgentDefinition[];
  onUpdate: (settings: JudgeLoopSettings) => void;
}

export default function JudgeLoopConfig({
  settings,
  agents,
  onUpdate
}: JudgeLoopConfigProps) {
  const { t } = useSafeTranslation();
  const [localSettings, setLocalSettings] = useState<JudgeLoopSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (field: keyof JudgeLoopSettings, value: string | number) => {
    const updatedSettings = {
      ...localSettings,
      [field]: value
    };
    
    // If the evaluator agent has changed, ensure it has the right output type
    if (field === 'evaluator_agent_id' && value) {
      // Find the evaluator agent
      const evaluatorAgent = agents.find(agent => agent.id === value);
      
      // Check if it needs an output type
      if (evaluatorAgent) {
        if (!evaluatorAgent.output_type) {
          // Notify the user that an output type will be applied
          alert('An output type will be applied to the evaluator agent');
          
          // The OutputTypeConfig in ActiveAgentEditor will show for this agent
          // and apply the default schema automatically when they view that agent
        }
        
        // Ensure pass_field and feedback_field match the evaluator output schema if it exists
        if (evaluatorAgent.output_type) {
          const schema = evaluatorAgent.output_type.schema;
          const properties = Object.keys(schema.properties);
          
          // Try to find a good default for pass_field if not set or doesn't exist in schema
          if (!updatedSettings.pass_field || !properties.includes(updatedSettings.pass_field)) {
            // Look for a field with 'score', 'rating', 'status', 'result' in the name
            const scoreField = properties.find(p => 
              p.toLowerCase().includes('score') || 
              p.toLowerCase().includes('rating') ||
              p.toLowerCase().includes('status') ||
              p.toLowerCase().includes('result')
            );
            
            if (scoreField) {
              updatedSettings.pass_field = scoreField;
            } else if (properties.length > 0) {
              // Use the first property as fallback
              updatedSettings.pass_field = properties[0];
            }
          }
          
          // Try to find a good default for feedback_field if not set or doesn't exist in schema
          if (!updatedSettings.feedback_field || !properties.includes(updatedSettings.feedback_field)) {
            // Look for a field with 'feedback', 'comment', 'explanation', 'reason' in the name
            const feedbackField = properties.find(p => 
              p.toLowerCase().includes('feedback') || 
              p.toLowerCase().includes('comment') ||
              p.toLowerCase().includes('explanation') ||
              p.toLowerCase().includes('reason')
            );
            
            if (feedbackField) {
              updatedSettings.feedback_field = feedbackField;
            } else if (properties.length > 1) {
              // Use the second property as fallback
              updatedSettings.feedback_field = properties[1];
            } else if (properties.length > 0 && properties[0] !== updatedSettings.pass_field) {
              // Use the first property if it's not already used for pass_field
              updatedSettings.feedback_field = properties[0];
            }
          }
          
          // If the pass_field has enum values, try to set a default pass_value
          const passFieldSchema = schema.properties[updatedSettings.pass_field];
          if (passFieldSchema && passFieldSchema.enum && passFieldSchema.enum.length > 0) {
            // Look for values that suggest "pass" or "success"
            const positiveValues = ['pass', 'success', 'ok', 'good', 'yes', 'true', '1'];
            const passValue = passFieldSchema.enum.find(v => 
              positiveValues.some(pos => v.toLowerCase().includes(pos))
            );
            
            if (passValue) {
              updatedSettings.pass_value = passValue;
            } else {
              // Use the first enum value as default
              updatedSettings.pass_value = passFieldSchema.enum[0];
            }
          }
        }
      }
    }
    
    setLocalSettings(updatedSettings);
    onUpdate(updatedSettings);
  };

  return (
    <div className="space-y-4 rounded-md border border-border p-4 mt-4">
      <h3 className="font-medium text-primary">{t('dashboard.editor.agent.systemSettings.judgeLoop.title')}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Generator Agent Selection */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            {t('dashboard.editor.agent.systemSettings.judgeLoop.generatorAgentLabel')}
          </label>
          <select
            value={localSettings.generator_agent_id}
            onChange={(e) => handleChange('generator_agent_id', e.target.value)}
            className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
          >
            <option value="">Select Generator Agent</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
          <p className="text-xs text-secondary mt-1">
            {t('dashboard.editor.agent.systemSettings.judgeLoop.generatorAgentDescription')}
          </p>
        </div>
        
        {/* Evaluator Agent Selection */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            {t('dashboard.editor.agent.systemSettings.judgeLoop.evaluatorAgentLabel')}
          </label>
          <select
            value={localSettings.evaluator_agent_id}
            onChange={(e) => handleChange('evaluator_agent_id', e.target.value)}
            className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
          >
            <option value="">Select Evaluator Agent</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
          <p className="text-xs text-secondary mt-1">
            {t('dashboard.editor.agent.systemSettings.judgeLoop.evaluatorAgentDescription')}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Maximum Iterations */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            {t('dashboard.editor.agent.systemSettings.judgeLoop.maxIterationsLabel')}
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={localSettings.max_iterations}
            onChange={(e) => handleChange('max_iterations', parseInt(e.target.value, 10))}
            className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
          />
          <p className="text-xs text-secondary mt-1">
            {t('dashboard.editor.agent.systemSettings.judgeLoop.maxIterationsDescription')}
          </p>
        </div>
        
        {/* Pass Field */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            {t('dashboard.editor.agent.systemSettings.judgeLoop.passFieldLabel')}
          </label>
          <input
            type="text"
            value={localSettings.pass_field}
            onChange={(e) => handleChange('pass_field', e.target.value)}
            className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
          />
          <p className="text-xs text-secondary mt-1">
            {t('dashboard.editor.agent.systemSettings.judgeLoop.passFieldDescription')}
          </p>
        </div>
        
        {/* Pass Value */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            {t('dashboard.editor.agent.systemSettings.judgeLoop.passValueLabel')}
          </label>
          <input
            type="text"
            value={localSettings.pass_value}
            onChange={(e) => handleChange('pass_value', e.target.value)}
            className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
          />
          <p className="text-xs text-secondary mt-1">
            {t('dashboard.editor.agent.systemSettings.judgeLoop.passValueDescription')}
          </p>
        </div>
      </div>
      
      {/* Feedback Field */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-1">
          {t('dashboard.editor.agent.systemSettings.judgeLoop.feedbackFieldLabel')}
        </label>
        <input
          type="text"
          value={localSettings.feedback_field}
          onChange={(e) => handleChange('feedback_field', e.target.value)}
          className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-secondary mt-1">
          {t('dashboard.editor.agent.systemSettings.judgeLoop.feedbackFieldDescription')}
        </p>
      </div>
    </div>
  );
} 