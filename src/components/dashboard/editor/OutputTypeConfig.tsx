'use client';

import { useState } from 'react';
import { useSafeTranslation } from '@/components/I18nProvider';
import { nanoid } from 'nanoid';

interface OutputTypeSchema {
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
  onUpdate: (outputType: OutputTypeSchema) => void;
  isEvaluator?: boolean;
}

export default function OutputTypeConfig({
  outputType,
  onUpdate,
  isEvaluator = false
}: OutputTypeConfigProps) {
  const { t } = useSafeTranslation();
  const [showForm, setShowForm] = useState(false);
  const [propertyName, setPropertyName] = useState('');
  const [propertyType, setPropertyType] = useState('string');
  const [propertyDescription, setPropertyDescription] = useState('');
  const [propertyEnumValues, setPropertyEnumValues] = useState('');
  const [propertyRequired, setPropertyRequired] = useState(true);

  // Initialize with default evaluation feedback schema if it's an evaluator and no schema exists
  const defaultSchema: OutputTypeSchema = {
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

  // Use either the provided output type or the default if it's an evaluator
  const [localOutputType, setLocalOutputType] = useState<OutputTypeSchema>(
    outputType || (isEvaluator ? defaultSchema : {
      name: 'Output',
      schema: {
        type: 'object',
        properties: {},
        required: []
      }
    })
  );

  const handleNameChange = (name: string) => {
    const updated = {
      ...localOutputType,
      name
    };
    setLocalOutputType(updated);
    onUpdate(updated);
  };

  const addProperty = () => {
    if (!propertyName) return;

    // Create a new property
    const newProperty = {
      type: propertyType,
      description: propertyDescription || `Description for ${propertyName}`,
    };

    // Add enum values if type is string and enum values are provided
    if (propertyType === 'string' && propertyEnumValues.trim()) {
      (newProperty as any).enum = propertyEnumValues.split(',').map(v => v.trim());
    }

    // Update properties and required fields
    const updatedProperties = {
      ...localOutputType.schema.properties,
      [propertyName]: newProperty
    };

    const updatedRequired = propertyRequired 
      ? [...localOutputType.schema.required, propertyName] 
      : localOutputType.schema.required;

    const updated = {
      ...localOutputType,
      schema: {
        ...localOutputType.schema,
        properties: updatedProperties,
        required: updatedRequired
      }
    };

    // Update state and call prop callback
    setLocalOutputType(updated);
    onUpdate(updated);

    // Reset form fields
    setPropertyName('');
    setPropertyType('string');
    setPropertyDescription('');
    setPropertyEnumValues('');
    setPropertyRequired(true);
    setShowForm(false);
  };

  const removeProperty = (propName: string) => {
    // Create new properties without the removed one
    const updatedProperties = { ...localOutputType.schema.properties };
    delete updatedProperties[propName];

    // Remove from required array if it was required
    const updatedRequired = localOutputType.schema.required.filter(name => name !== propName);

    const updated = {
      ...localOutputType,
      schema: {
        ...localOutputType.schema,
        properties: updatedProperties,
        required: updatedRequired
      }
    };

    // Update state and call prop callback
    setLocalOutputType(updated);
    onUpdate(updated);
  };

  const useDefaultEvaluatorSchema = () => {
    setLocalOutputType(defaultSchema);
    onUpdate(defaultSchema);
  };

  return (
    <div className="space-y-4 border border-border rounded-md p-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-primary">{t('dashboard.editor.agent.agentsSection.outputType.title')}</h4>
        {isEvaluator && (
          <button
            onClick={useDefaultEvaluatorSchema}
            className="text-xs px-2 py-1 rounded bg-accent hover:bg-accent/80 text-dark"
          >
            {t('dashboard.editor.agent.agentsSection.outputType.useTemplate')}
          </button>
        )}
      </div>

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

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-secondary">
            {t('dashboard.editor.agent.agentsSection.outputType.properties')}
          </label>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs px-2 py-1 rounded bg-dark hover:bg-dark/80 text-primary"
          >
            {t('dashboard.editor.agent.agentsSection.outputType.addProperty')}
          </button>
        </div>

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
                className="text-xs px-3 py-1 rounded bg-accent hover:bg-accent/80 text-white disabled:opacity-50"
              >
                {t('dashboard.editor.agent.agentsSection.outputType.propertyForm.add')}
              </button>
            </div>
          </div>
        )}

        {Object.keys(localOutputType.schema.properties).length === 0 ? (
          <p className="text-sm text-secondary italic">
            {t('dashboard.editor.agent.agentsSection.outputType.noProperties')}
          </p>
        ) : (
          <div className="space-y-2">
            {Object.entries(localOutputType.schema.properties).map(([name, prop]) => (
              <div key={name} className="flex justify-between items-center p-2 border border-border/30 rounded bg-dark/20">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-mono text-xs bg-dark/40 px-1 py-0.5 rounded text-primary mr-2">{name}</span>
                    <span className="text-xs text-accent">{prop.type}</span>
                    {prop.enum && (
                      <span className="ml-2 text-xs text-secondary">(enum: {prop.enum.join(', ')})</span>
                    )}
                    {localOutputType.schema.required.includes(name) && (
                      <span className="ml-2 text-xs bg-amber-900/30 text-amber-400 px-1 py-0.5 rounded">required</span>
                    )}
                  </div>
                  <p className="text-xs text-secondary mt-0.5">{prop.description}</p>
                </div>
                <button
                  onClick={() => removeProperty(name)}
                  className="text-red-400 hover:text-red-300 ml-2"
                  title="Remove Property"
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
  );
} 