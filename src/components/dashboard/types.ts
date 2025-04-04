// Types for the chatbot editor components

export interface AppearanceSettings {
  headerText: string;
  primaryColor: string;
  bubbleColor: string;
  textColor: string;
  welcomeMessage: string;
  placement: 'left' | 'right';
  size: 'small' | 'medium' | 'large';
}

export interface AppearanceProps {
  onUpdate?: (settings: AppearanceSettings) => void;
  initialSettings?: AppearanceSettings;
}

export interface Rule {
  id: string;
  rule: string;
}

export interface Question {
  id: string;
  text: string;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
} 