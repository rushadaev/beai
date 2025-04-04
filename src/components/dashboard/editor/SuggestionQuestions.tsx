'use client';

import { useState, useEffect } from 'react';
import { Question } from '../ChatbotEditor';

interface SuggestionQuestionsProps {
  initialQuestions?: Question[];
  onUpdate?: (questions: Question[]) => void;
  onPreviewUpdate?: (questions: Question[]) => void;
  isSaving?: boolean;
}

export default function SuggestionQuestions({ 
  initialQuestions = [], 
  onUpdate,
  onPreviewUpdate,
  isSaving = false
}: SuggestionQuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions.length > 0 ? 
    initialQuestions : [
      { id: '1', text: 'How can I get started?' },
      { id: '2', text: 'What are your business hours?' },
      { id: '3', text: 'Do you offer support?' }
    ]
  );
  const [newQuestion, setNewQuestion] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Update local state when initialQuestions change
  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
    }
  }, [initialQuestions]);

  const updateQuestions = (updatedQuestions: Question[]) => {
    setQuestions(updatedQuestions);

    
    // Update preview immediately
    if (onPreviewUpdate) {
      onPreviewUpdate(updatedQuestions);
    }
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const newQuestionObj: Question = {
      id: Date.now().toString(),
      text: newQuestion.trim()
    };

    const updatedQuestions = [...questions, newQuestionObj];
    updateQuestions(updatedQuestions);
    setNewQuestion('');
  };

  const handleDeleteQuestion = (id: string) => {
    const updatedQuestions = questions.filter(question => question.id !== id);
    updateQuestions(updatedQuestions);
  };

  const handleStartEdit = (question: Question) => {
    setIsEditing(question.id);
    setEditText(question.text);
  };

  const handleSaveEdit = () => {
    if (!isEditing) return;
    
    const updatedQuestions = questions.map(question => 
      question.id === isEditing ? { ...question, text: editText.trim() } : question
    );
    
    updateQuestions(updatedQuestions);
    setIsEditing(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setEditText('');
  };

  const handleReorderQuestion = (id: string, direction: 'up' | 'down') => {
    const currentIndex = questions.findIndex(q => q.id === id);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === questions.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newQuestions = [...questions];
    
    // Swap the questions
    [newQuestions[currentIndex], newQuestions[newIndex]] = 
    [newQuestions[newIndex], newQuestions[currentIndex]];
    
    updateQuestions(newQuestions);
  };

  const handleApplyChanges = () => {
    // Save changes to the database
    if (onUpdate) {
      onUpdate(questions);
    }
  };

  return (
    <div className="space-y-6 pb-16 relative">
      <div>
        <h3 className="text-lg font-medium text-primary">
          Suggested Questions
        </h3>
        <p className="text-sm text-secondary">
          Add questions that will appear as suggestions to your users
        </p>
      </div>

      <form onSubmit={handleAddQuestion} className="flex space-x-2">
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Add a new suggested question..."
          className="flex-1 rounded-md border border-border bg-dark px-3 py-2 text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={!newQuestion.trim() || isSaving}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-dark hover:bg-accent/80 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      <div className="space-y-2">
        {questions.length === 0 ? (
          <div className="rounded-md border border-border bg-dark p-4 text-center text-secondary">
            No suggested questions yet. Add some to help your users get started.
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((question) => (
              <div
                key={question.id}
                className="flex items-center justify-between rounded-md border border-border bg-dark p-3"
              >
                {isEditing === question.id ? (
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
                    <span className="text-primary">{question.text}</span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleReorderQuestion(question.id, 'up')}
                        disabled={questions.indexOf(question) === 0 || isSaving}
                        className="rounded p-1 text-secondary hover:bg-card disabled:opacity-30"
                        title="Move up"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleReorderQuestion(question.id, 'down')}
                        disabled={questions.indexOf(question) === questions.length - 1 || isSaving}
                        className="rounded p-1 text-secondary hover:bg-card disabled:opacity-30"
                        title="Move down"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleStartEdit(question)}
                        disabled={isSaving}
                        className="rounded p-1 text-secondary hover:bg-card disabled:opacity-30"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
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