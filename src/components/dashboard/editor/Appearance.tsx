'use client';

import { useState, useEffect, useRef } from 'react';
import { AppearanceSettings } from '../ChatbotEditor';

interface AppearanceProps {
  initialSettings?: AppearanceSettings;
  onUpdate?: (settings: AppearanceSettings) => void;
  onPreviewUpdate?: (settings: AppearanceSettings) => void;
  isSaving?: boolean;
}

export default function Appearance({ 
  initialSettings,
  onUpdate,
  onPreviewUpdate,
  isSaving = false
}: AppearanceProps) {
  const [settings, setSettings] = useState<AppearanceSettings>(
    initialSettings || {
      headerText: 'Chat with us',
      primaryColor: '#3b82f6',
      secondaryColor: '#1e3a8a',
      buttonColor: '#3b82f6',
      buttonTextColor: '#ffffff',
      placement: 'right',
      size: 'medium'
    }
  );
  
  // Debounce timer for color changes
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update local state when initialSettings change
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);
  
  // Cleanup function for debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleChange = (field: keyof AppearanceSettings, value: string) => {
    const updatedSettings = { ...settings, [field]: value };
    setSettings(updatedSettings);
    
    // For color fields, debounce to avoid excessive updates during dragging
    if (field.includes('Color')) {
      // Clear any existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Set a new timer
      debounceTimerRef.current = setTimeout(() => {
        if (onPreviewUpdate) {
          onPreviewUpdate(updatedSettings);
        }
      }, 50); // 50ms debounce
    } else {
      // For non-color fields, update immediately
      if (onPreviewUpdate) {
        onPreviewUpdate(updatedSettings);
      }
    }
  };

  const handleApplyChanges = () => {
    // Only save to database when Apply button is clicked
    if (onUpdate) {
      onUpdate(settings);
    }
  };

  return (
    <div className="space-y-6 pb-16 relative">
      <div>
        <h3 className="text-lg font-medium text-primary">
          Appearance Settings
        </h3>
        <p className="text-sm text-secondary">
          Customize how your chatbot appears to users
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label htmlFor="headerText" className="block text-sm font-medium text-primary">
              Header Text
            </label>
            <input
              id="headerText"
              type="text"
              value={settings.headerText}
              onChange={(e) => handleChange('headerText', e.target.value)}
              className="mt-1 block w-full rounded-md border border-border bg-dark px-3 py-2 text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary">
              Size
            </label>
            <div className="mt-1 flex space-x-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleChange('size', size)}
                  className={`rounded-md px-3 py-1 text-sm ${
                    settings.size === size
                      ? 'bg-accent text-dark'
                      : 'border border-border bg-dark text-primary hover:bg-dark/50'
                  }`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary">
              Placement
            </label>
            <div className="mt-1 flex space-x-2">
              {(['left', 'center', 'right'] as const).map((placement) => (
                <button
                  key={placement}
                  type="button"
                  onClick={() => handleChange('placement', placement)}
                  className={`rounded-md px-3 py-1 text-sm ${
                    settings.placement === placement
                      ? 'bg-accent text-dark'
                      : 'border border-border bg-dark text-primary hover:bg-dark/50'
                  }`}
                >
                  {placement.charAt(0).toUpperCase() + placement.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium text-primary">
              Primary Color
            </label>
            <div className="mt-1 flex">
              <input
                id="primaryColor"
                type="color"
                value={settings.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="h-10 w-10 rounded-l-md border border-border bg-dark p-1"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="flex-1 rounded-r-md border-y border-r border-border bg-dark px-3 py-2 text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="secondaryColor" className="block text-sm font-medium text-primary">
              Secondary Color
            </label>
            <div className="mt-1 flex">
              <input
                id="secondaryColor"
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="h-10 w-10 rounded-l-md border border-border bg-dark p-1"
              />
              <input
                type="text"
                value={settings.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="flex-1 rounded-r-md border-y border-r border-border bg-dark px-3 py-2 text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="buttonColor" className="block text-sm font-medium text-primary">
              Button Color
            </label>
            <div className="mt-1 flex">
              <input
                id="buttonColor"
                type="color"
                value={settings.buttonColor}
                onChange={(e) => handleChange('buttonColor', e.target.value)}
                className="h-10 w-10 rounded-l-md border border-border bg-dark p-1"
              />
              <input
                type="text"
                value={settings.buttonColor}
                onChange={(e) => handleChange('buttonColor', e.target.value)}
                className="flex-1 rounded-r-md border-y border-r border-border bg-dark px-3 py-2 text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="buttonTextColor" className="block text-sm font-medium text-primary">
              Button Text Color
            </label>
            <div className="mt-1 flex">
              <input
                id="buttonTextColor"
                type="color"
                value={settings.buttonTextColor}
                onChange={(e) => handleChange('buttonTextColor', e.target.value)}
                className="h-10 w-10 rounded-l-md border border-border bg-dark p-1"
              />
              <input
                type="text"
                value={settings.buttonTextColor}
                onChange={(e) => handleChange('buttonTextColor', e.target.value)}
                className="flex-1 rounded-r-md border-y border-r border-border bg-dark px-3 py-2 text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed footer with Apply Changes button */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card py-3 px-4">
        <div className="flex justify-between items-center">
          <p className="text-xs text-secondary italic">
            Changes appear in the preview immediately.
          </p>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleApplyChanges}
              disabled={isSaving}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-dark hover:bg-accent/80 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Apply Changes'}
            </button>
            <button
              type="button"
              className="rounded-md bg-dark border border-accent px-4 py-2 text-sm font-medium text-accent hover:bg-dark/80"
              onClick={() => window.dispatchEvent(new CustomEvent('open-install-modal'))}
            >
              Install
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 