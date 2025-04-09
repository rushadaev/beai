'use client';

import { useState, useEffect } from 'react';
import { useSafeTranslation } from '@/components/I18nProvider';

// Export the interface so it can be imported by other components
export interface OutputTypeSchema {
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
}

interface OutputTypeConfigProps {
  outputType: OutputTypeSchema | undefined;
  onUpdate: (outputType: OutputTypeSchema | undefined | null) => void;  // Accept null as well
  isEvaluator?: boolean;
}

const DEFAULT_EMPTY_SCHEMA: OutputTypeSchema = {
  name: 'Output',
  schema: {
    type: 'object',
    properties: {},
    required: []
  }
};

const DEFAULT_EVALUATOR_SCHEMA: OutputTypeSchema = {
  name: 'EvaluationFeedback',
  schema: {
    type: 'object',
    properties: {
      feedback: {
        type: 'string',
        description: 'Feedback on how to improve the content'
      },
      score: {
        type: 'string',
        enum: ['pass', 'needs_improvement', 'fail'],
        description: 'Evaluation score'
      }
    },
    required: ['feedback', 'score']
  }
};

export default function OutputTypeConfig({
  outputType,
  onUpdate,
  isEvaluator = false
}: OutputTypeConfigProps) {
  const { t } = useSafeTranslation();
  const [localOutputType, setLocalOutputType] = useState<OutputTypeSchema | undefined>(outputType);
  const [showForm, setShowForm] = useState(false);
  const [propertyName, setPropertyName] = useState('');
  const [propertyType, setPropertyType] = useState('string');
  const [propertyDescription, setPropertyDescription] = useState('');
  const [propertyEnumValues, setPropertyEnumValues] = useState('');
  const [propertyRequired, setPropertyRequired] = useState(true);

  // Sync local state when the prop changes (e.g., agent switch)
  useEffect(() => {
    setLocalOutputType(outputType);
    // Close the add property form if the output type is removed or changed
    if (!outputType) {
      setShowForm(false);
    }
  }, [outputType]);

  const handleUpdate = (updatedSchema: OutputTypeSchema | undefined) => {
    setLocalOutputType(updatedSchema);
    // If schema is undefined, pass null to parent component to avoid Firebase issues with undefined
    onUpdate(updatedSchema === undefined ? null : updatedSchema);
  };

  const handleNameChange = (name: string) => {
    if (!localOutputType) return; // Should not happen if name input is visible
    const updated = {
      ...localOutputType,
      name
    };
    handleUpdate(updated);
  };

  const addProperty = () => {
    if (!propertyName || !localOutputType) return;

    const newProperty = {
      type: propertyType,
      description: propertyDescription || `Description for ${propertyName}`,
      ...(propertyType === 'string' && propertyEnumValues.trim() && { enum: propertyEnumValues.split(',').map(v => v.trim()) })
    };

    const updatedProperties = {
      ...localOutputType.schema.properties,
      [propertyName]: newProperty
    };

    const updatedRequired = propertyRequired
      ? [...localOutputType.schema.required.filter(p => p !== propertyName), propertyName] // Avoid duplicates
      : localOutputType.schema.required.filter(p => p !== propertyName);

    const updated = {
      ...localOutputType,
      schema: {
        ...localOutputType.schema,
        properties: updatedProperties,
        required: updatedRequired
      }
    };

    handleUpdate(updated);

    // Reset form
    setPropertyName('');
    setPropertyType('string');
    setPropertyDescription('');
    setPropertyEnumValues('');
    setPropertyRequired(true);
    setShowForm(false);
  };

  const removeProperty = (propName: string) => {
    if (!localOutputType) return;

    const updatedProperties = { ...localOutputType.schema.properties };
    delete updatedProperties[propName];

    const updatedRequired = localOutputType.schema.required.filter(name => name !== propName);

    const updated = {
      ...localOutputType,
      schema: {
        ...localOutputType.schema,
        properties: updatedProperties,
        required: updatedRequired
      }
    };
    handleUpdate(updated);
  };

  const useDefaultEvaluatorSchema = () => {
    handleUpdate(DEFAULT_EVALUATOR_SCHEMA);
  };

  const defineOutputType = () => {
    handleUpdate(DEFAULT_EMPTY_SCHEMA);
  };

  const removeOutputType = () => {
    // Send null instead of undefined to avoid Firebase issues
    handleUpdate(undefined);
  };

  return (
    <div className="space-y-4 border border-border rounded-md p-4">
      {!localOutputType ? (
        // State when no output type is defined
        <div className="flex justify-center items-center py-4">
          <button
            onClick={defineOutputType}
            className="text-sm px-3 py-1.5 rounded bg-accent hover:bg-accent/80 text-dark"
          >
            {t('dashboard.editor.agent.agentsSection.outputType.defineButton')}
          </button>
        </div>
      ) : (
        // State when an output type IS defined
        <>
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-primary">{t('dashboard.editor.agent.agentsSection.outputType.title')}</h4>
            <div className="flex items-center space-x-2">
              {isEvaluator && (
                <button
                  onClick={useDefaultEvaluatorSchema}
                  className="text-xs px-2 py-1 rounded bg-accent/80 hover:bg-accent text-dark"
                  title={t('dashboard.editor.agent.agentsSection.outputType.useTemplateTooltip')}
                >
                  {t('dashboard.editor.agent.agentsSection.outputType.useTemplate')}
                </button>
              )}
              <button
                onClick={removeOutputType}
                className="text-xs px-2 py-1 rounded bg-red-800/60 hover:bg-red-700/60 text-red-300"
                title={t('dashboard.editor.agent.agentsSection.outputType.removeTooltip')}
              >
                {t('dashboard.editor.agent.agentsSection.outputType.removeButton')}
              </button>
            </div>
          </div>

          {/* Type Name Input */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              {t('dashboard.editor.agent.agentsSection.outputType.typeName')}
            </label>
            <input
              type="text"
              value={localOutputType.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={t('dashboard.editor.agent.agentsSection.outputType.typeNamePlaceholder')}
              className="w-full rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
            />
            <p className="text-xs text-secondary mt-1">
              {t('dashboard.editor.agent.agentsSection.outputType.typeNameHelp')}
            </p>
          </div>

          {/* Properties Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-secondary">
                {t('dashboard.editor.agent.agentsSection.outputType.properties')}
              </label>
              <button
                onClick={() => setShowForm(true)}
                className="text-xs px-2 py-1 rounded bg-dark hover:bg-dark/80 text-primary"
                disabled={showForm} // Disable if form is already shown
              >
                {t('dashboard.editor.agent.agentsSection.outputType.addProperty')}
              </button>
            </div>

            {/* Add Property Form */}
            {showForm && (
              <div className="space-y-3 p-3 mb-3 border border-border/50 rounded-md bg-dark/30">
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">
                    {t('dashboard.editor.agent.agentsSection.outputType.propertyForm.name')}
                  </label>
                  <input
                    type="text"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    placeholder={t('dashboard.editor.agent.agentsSection.outputType.propertyForm.namePlaceholder')}
                    className="w-full rounded-md border border-border bg-dark px-3 py-1 text-sm text-primary focus:border-accent focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-secondary mb-1">
                      {t('dashboard.editor.agent.agentsSection.outputType.propertyForm.type')}
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full rounded-md border border-border bg-dark px-3 py-1 text-sm text-primary focus:border-accent focus:outline-none"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="object">Object</option>
                      <option value="array">Array</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-secondary mb-1">
                      {t('dashboard.editor.agent.agentsSection.outputType.propertyForm.description')}
                    </label>
                    <input
                      type="text"
                      value={propertyDescription}
                      onChange={(e) => setPropertyDescription(e.target.value)}
                      placeholder={t('dashboard.editor.agent.agentsSection.outputType.propertyForm.descriptionPlaceholder')}
                      className="w-full rounded-md border border-border bg-dark px-3 py-1 text-sm text-primary focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
                {propertyType === 'string' && (
                  <div>
                    <label className="block text-xs font-medium text-secondary mb-1">
                      {t('dashboard.editor.agent.agentsSection.outputType.propertyForm.enumValues')}
                    </label>
                    <input
                      type="text"
                      value={propertyEnumValues}
                      onChange={(e) => setPropertyEnumValues(e.target.value)}
                      placeholder={t('dashboard.editor.agent.agentsSection.outputType.propertyForm.enumValuesPlaceholder')}
                      className="w-full rounded-md border border-border bg-dark px-3 py-1 text-sm text-primary focus:border-accent focus:outline-none"
                    />
                    <p className="text-xs text-secondary mt-1">
                      {t('dashboard.editor.agent.agentsSection.outputType.propertyForm.enumValuesHelp')}
                    </p>
                  </div>
                )}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="property-required"
                    checked={propertyRequired}
                    onChange={(e) => setPropertyRequired(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="property-required" className="text-xs text-primary">
                    {t('dashboard.editor.agent.agentsSection.outputType.propertyForm.required')}
                  </label>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-xs px-3 py-1 rounded bg-dark hover:bg-dark/80 text-primary"
                  >
                    {t('dashboard.editor.agent.agentsSection.outputType.propertyForm.cancel')}
                  </button>
                  <button
                    onClick={addProperty}
                    disabled={!propertyName}
                    className="text-xs px-3 py-1 rounded bg-accent hover:bg-accent/80 text-dark disabled:opacity-50"
                  >
                    {t('dashboard.editor.agent.agentsSection.outputType.propertyForm.add')}
                  </button>
                </div>
              </div>
            )}

            {/* Display Properties List */}
            {Object.keys(localOutputType.schema.properties).length === 0 && !showForm ? (
              <p className="text-sm text-secondary italic">
                {t('dashboard.editor.agent.agentsSection.outputType.noProperties')}
              </p>
            ) : (
              <div className="space-y-2 mt-2">
                {Object.entries(localOutputType.schema.properties).map(([name, prop]) => (
                  <div key={name} className="flex justify-between items-center p-2 border border-border/30 rounded bg-dark/20">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                        <span className="font-mono text-xs bg-dark/40 px-1 py-0.5 rounded text-primary break-all">{name}</span>
                        <span className="text-xs text-accent font-medium">{prop.type}</span>
                        {prop.enum && (
                          <span className="text-xs text-secondary">(enum: {prop.enum.join(', ')})</span>
                        )}
                        {localOutputType.schema.required.includes(name) && (
                          <span className="text-xs bg-amber-900/30 text-amber-400 px-1 py-0.5 rounded">required</span>
                        )}
                      </div>
                      <p className="text-xs text-secondary mt-1 break-words">{prop.description}</p>
                    </div>
                    <button
                      onClick={() => removeProperty(name)}
                      className="text-red-400 hover:text-red-300 ml-2 flex-shrink-0"
                      title={t('dashboard.editor.agent.agentsSection.outputType.propertyForm.removePropertyTitle')}
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
        </>
      )}
    </div>
  );
} 