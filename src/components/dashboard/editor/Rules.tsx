'use client';

import { useState, useEffect } from 'react';
import { Rule } from '../ChatbotEditor';

interface RulesProps {
  initialRules?: Rule[];
  onUpdate?: (rules: Rule[]) => void;
  onPreviewUpdate?: (rules: Rule[]) => void;
  isSaving?: boolean;
}

export default function Rules({ 
  initialRules = [], 
  onUpdate,
  onPreviewUpdate,
  isSaving = false
}: RulesProps) {
  const [rules, setRules] = useState<Rule[]>(initialRules.length > 0 ? 
    initialRules : [
      { id: '1', text: 'Be friendly and helpful', enabled: true },
      { id: '2', text: 'Do not share personal information', enabled: true },
      { id: '3', text: 'Keep responses concise', enabled: true }
    ]
  );
  const [newRule, setNewRule] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Update local state when initialRules change
  useEffect(() => {
    if (initialRules && initialRules.length > 0) {
      setRules(initialRules);
    }
  }, [initialRules]);

  const updateRules = (updatedRules: Rule[]) => {
    setRules(updatedRules);
    
    // Update preview immediately
    if (onPreviewUpdate) {
      onPreviewUpdate(updatedRules);
    }
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.trim()) return;

    const newRuleObj: Rule = {
      id: Date.now().toString(),
      text: newRule.trim(),
      enabled: true
    };

    const updatedRules = [...rules, newRuleObj];
    updateRules(updatedRules);
    setNewRule('');
  };

  const handleDeleteRule = (id: string) => {
    const updatedRules = rules.filter(rule => rule.id !== id);
    updateRules(updatedRules);
  };

  const handleToggleRule = (id: string) => {
    const updatedRules = rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    );
    updateRules(updatedRules);
  };

  const handleStartEdit = (rule: Rule) => {
    setIsEditing(rule.id);
    setEditText(rule.text);
  };

  const handleSaveEdit = () => {
    if (!isEditing) return;
    
    const updatedRules = rules.map(rule => 
      rule.id === isEditing ? { ...rule, text: editText.trim() } : rule
    );
    
    updateRules(updatedRules);
    setIsEditing(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setEditText('');
  };

  const handleReorderRule = (id: string, direction: 'up' | 'down') => {
    const currentIndex = rules.findIndex(r => r.id === id);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === rules.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newRules = [...rules];
    
    // Swap the rules
    [newRules[currentIndex], newRules[newIndex]] = 
    [newRules[newIndex], newRules[currentIndex]];
    
    updateRules(newRules);
  };

  const handleApplyChanges = () => {
    // Save changes to the database
    if (onUpdate) {
      onUpdate(rules);
    }
  };

  return (
    <div className="space-y-6 pb-16 relative">
      <div>
        <h3 className="text-lg font-medium text-primary">
          Chatbot Rules
        </h3>
        <p className="text-sm text-secondary">
          Define rules that will guide how your chatbot responds to users
        </p>
      </div>

      <form onSubmit={handleAddRule} className="flex space-x-2">
        <input
          type="text"
          value={newRule}
          onChange={(e) => setNewRule(e.target.value)}
          placeholder="Add a new rule..."
          className="flex-1 rounded-md border border-border bg-dark px-3 py-2 text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={!newRule.trim() || isSaving}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-dark hover:bg-accent/80 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      <div className="space-y-2">
        {rules.length === 0 ? (
          <div className="rounded-md border border-border bg-dark p-4 text-center text-secondary">
            No rules yet. Add some to guide your chatbot behavior.
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`flex items-center justify-between rounded-md border border-border p-3 ${
                  rule.enabled ? 'bg-dark' : 'bg-dark/50'
                }`}
              >
                {isEditing === rule.id ? (
                  <div className="flex flex-1 items-center space-x-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 rounded-md border border-border bg-card px-3 py-1 text-primary focus:border-accent focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveEdit}
                      disabled={!editText.trim() || isSaving}
                      className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-dark hover:bg-accent/80 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="rounded-md bg-dark px-2 py-1 text-xs font-medium text-secondary hover:bg-card"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        disabled={isSaving}
                        className={`mr-3 h-5 w-5 rounded ${
                          rule.enabled 
                            ? 'bg-accent text-dark' 
                            : 'bg-dark border border-border text-secondary'
                        } flex items-center justify-center transition-colors disabled:opacity-50`}
                      >
                        {rule.enabled && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <span className={`text-sm ${rule.enabled ? 'text-primary' : 'text-secondary line-through'}`}>
                        {rule.text}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleReorderRule(rule.id, 'up')}
                        disabled={rules.indexOf(rule) === 0 || isSaving}
                        className="rounded p-1 text-secondary hover:bg-card disabled:opacity-30"
                        title="Move up"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleReorderRule(rule.id, 'down')}
                        disabled={rules.indexOf(rule) === rules.length - 1 || isSaving}
                        className="rounded p-1 text-secondary hover:bg-card disabled:opacity-30"
                        title="Move down"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleStartEdit(rule)}
                        disabled={isSaving}
                        className="rounded p-1 text-secondary hover:bg-card disabled:opacity-30"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        disabled={isSaving}
                        className="rounded p-1 text-red-400 hover:bg-card disabled:opacity-30"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
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