'use client';

import { ReactNode, useState, useEffect } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../i18n';

interface I18nProviderProps {
  children: ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  // SSR hydration fix - ensure we use a consistent language for initial render
  const [isMounted, setIsMounted] = useState(false);
  const [detectedLang, setDetectedLang] = useState('');

  // Save the detected language and force English for hydration
  useEffect(() => {
    // Save the detected language before switching to English
    if (typeof window !== 'undefined' && !isMounted) {
      setDetectedLang(i18n.language);
      i18n.changeLanguage('en');
    }
  }, [isMounted]);

  useEffect(() => {
    // Mark as mounted after hydration is complete
    setIsMounted(true);

    // Restore the detected language after hydration
    if (detectedLang && detectedLang !== 'en') {
      setTimeout(() => {
        i18n.changeLanguage(detectedLang);
      }, 0);
    }
  }, [detectedLang]);

  return (
    <I18nextProvider i18n={i18n}>
      <div data-hydrated={isMounted ? "true" : "false"}>
        {children}
      </div>
    </I18nextProvider>
  );
}

// Return type of our safe translation function
interface SafeTranslationReturn {
  t: (key: string, options?: Record<string, unknown>) => string;
  i18n: typeof i18n;
  isMounted: boolean;
}

/**
 * Hook to get the translation function that works safely with SSR
 * Use this instead of the standard useTranslation hook in components
 */
export function useSafeTranslation(): SafeTranslationReturn {
  const { t, i18n } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Wrapper function that returns English during SSR and actual translation after mount
  const safeT = (key: string, options?: Record<string, unknown>): string => {
    if (!isMounted) {
      // Return fallback values during SSR
      return getFallbackText(key);
    }
    
    // Ensure we return a string, not an object
    const translation = t(key, options);
    return typeof translation === 'string' ? translation : key;
  };

  return { 
    t: safeT,
    i18n,
    isMounted
  };
}

// Simple fallback function to return English text for common keys during SSR
function getFallbackText(key: string): string {
  const fallbacks: Record<string, string> = {
    'hero.title.line1': 'Multi-Agent',
    'hero.title.accent': 'Constructor',
    'hero.title.line2': 'Powerful API Integrations',
    'hero.subtitle': 'Build advanced AI agent systems with powerful API integrations, multi-agent collaboration, and custom tools - all through an intuitive no-code interface.',
    'hero.cta.create': 'Create Your Agent System',
    'hero.cta.tryFree': 'Try for Free',
    
    'header.nav.features': 'Features',
    'header.nav.howItWorks': 'How It Works',
    'header.nav.faq': 'FAQ',
    'header.auth.dashboard': 'Dashboard',
    'header.auth.login': 'Login',
    'header.auth.signUp': 'Sign Up',
    
    // Visual Builder
    'visualBuilder.header.eyebrow': 'Agent Constructor',
    'visualBuilder.header.title': 'Build Your Agent Systems Visually',
    'visualBuilder.windowTitle': 'Agent Builder Interface',
    'visualBuilder.placeholder.title': 'Visual Workflow Builder',
    'visualBuilder.placeholder.description': 'Drag and drop components to create your agent system',
    
    // Features
    'features.header.eyebrow': 'Features',
    'features.header.title': 'Everything You Need',
    'features.header.description': 'Powerful tools to build complex agent systems without code',
    
    // How It Works
    'howItWorks.header.eyebrow': 'How It Works',
    'howItWorks.header.title': 'Simple Three-Step Process',
    'howItWorks.header.description': 'Get started in minutes with our intuitive builder',
    
    // FAQ
    'faq.header.eyebrow': 'FAQ',
    'faq.header.title': 'Common Questions',
    'faq.header.description': 'See how our platform can help you build powerful AI agents',
    
    // CTA
    'cta.title.part1': 'Ready to build your',
    'cta.title.accent': 'AI Agent System',
    'cta.subtitle': 'Get started today with our powerful no-code builder',
    'cta.button': 'Start Building Now',
    
    // Footer
    'footer.copyright': '© 2023 VibeCraft. All rights reserved.',
    
    // Dashboard Layout
    'dashboard.layout.loading': 'Loading your dashboard...',
    'dashboard.layout.title': 'Dashboard',
    'dashboard.layout.logout': 'Logout',
    
    // Dashboard Sidebar
    'dashboard.sidebar.home': 'Home',
    'dashboard.sidebar.insights': 'Insights',
    'dashboard.sidebar.history': 'History',
    'dashboard.sidebar.chatbots': 'Chatbots',
    
    // Chatbot Editor
    'dashboard.editor.tabs.agent': 'Agent',
    'dashboard.editor.tabs.appearance': 'Appearance',
    'dashboard.editor.tabs.rules': 'Rules',
    'dashboard.editor.tabs.suggestions': 'Suggestions',
    'dashboard.editor.preview.title': 'Live Preview',
    
    // Appearance Editor
    'dashboard.editor.appearance.title': 'Appearance Settings',
    'dashboard.editor.appearance.description': 'Customize how your chatbot appears to users',
    'dashboard.editor.appearance.defaults.headerText': 'Chat with us',
    'dashboard.editor.appearance.headerTextLabel': 'Header Text',
    'dashboard.editor.appearance.sizeLabel': 'Size',
    'dashboard.editor.appearance.size.small': 'Small',
    'dashboard.editor.appearance.size.medium': 'Medium',
    'dashboard.editor.appearance.size.large': 'Large',
    'dashboard.editor.appearance.placementLabel': 'Placement',
    'dashboard.editor.appearance.placement.left': 'Left',
    'dashboard.editor.appearance.placement.center': 'Center',
    'dashboard.editor.appearance.placement.right': 'Right',
    'dashboard.editor.appearance.primaryColorLabel': 'Primary Color',
    'dashboard.editor.appearance.secondaryColorLabel': 'Secondary Color',
    'dashboard.editor.appearance.buttonColorLabel': 'Button Color',
    'dashboard.editor.appearance.buttonTextColorLabel': 'Button Text Color',
    'dashboard.editor.appearance.previewNote': 'Changes appear in the preview immediately.',
    'dashboard.editor.appearance.applyButton': 'Apply Changes',
    'dashboard.editor.appearance.savingButton': 'Saving...',
    'dashboard.editor.appearance.installButton': 'Install',
    
    // Rules Editor
    'dashboard.editor.rules.title': 'Chatbot Rules',
    'dashboard.editor.rules.description': 'Define rules that will guide how your chatbot responds to users',
    'dashboard.editor.rules.defaults.0': 'Be friendly and helpful',
    'dashboard.editor.rules.defaults.1': 'Do not share personal information',
    'dashboard.editor.rules.defaults.2': 'Keep responses concise',
    'dashboard.editor.rules.addPlaceholder': 'Add a new rule...',
    'dashboard.editor.rules.addButton': 'Add',
    'dashboard.editor.rules.noRules': 'No rules yet. Add some to guide your chatbot behavior.',
    'dashboard.editor.rules.saveEditButton': 'Save',
    'dashboard.editor.rules.cancelEditButton': 'Cancel',
    'dashboard.editor.rules.moveUpTitle': 'Move up',
    'dashboard.editor.rules.moveDownTitle': 'Move down',
    'dashboard.editor.rules.editTitle': 'Edit',
    'dashboard.editor.rules.deleteTitle': 'Delete',
    'dashboard.editor.rules.previewNote': 'Changes appear in the preview immediately.',
    'dashboard.editor.rules.applyButton': 'Apply Changes',
    'dashboard.editor.rules.savingButton': 'Saving...',
    'dashboard.editor.rules.installButton': 'Install',

    // Suggestion Questions Editor
    'dashboard.editor.suggestions.title': 'Suggested Questions',
    'dashboard.editor.suggestions.description': 'Add questions that will appear as suggestions to your users',
    'dashboard.editor.suggestions.defaults.0': 'How can I get started?',
    'dashboard.editor.suggestions.defaults.1': 'What are your business hours?',
    'dashboard.editor.suggestions.defaults.2': 'Do you offer support?',
    'dashboard.editor.suggestions.addPlaceholder': 'Add a new suggested question...',
    'dashboard.editor.suggestions.addButton': 'Add',
    'dashboard.editor.suggestions.noSuggestions': 'No suggested questions yet. Add some to help your users get started.',
    'dashboard.editor.suggestions.saveEditButton': 'Save',
    'dashboard.editor.suggestions.cancelEditButton': 'Cancel',
    'dashboard.editor.suggestions.moveUpTitle': 'Move up',
    'dashboard.editor.suggestions.moveDownTitle': 'Move down',
    'dashboard.editor.suggestions.editTitle': 'Edit',
    'dashboard.editor.suggestions.deleteTitle': 'Delete',
    'dashboard.editor.suggestions.previewNote': 'Changes appear in the preview immediately.',
    'dashboard.editor.suggestions.applyButton': 'Apply Changes',
    'dashboard.editor.suggestions.savingButton': 'Saving...',
    'dashboard.editor.suggestions.installButton': 'Install',

    // Agent Editor - System Settings
    'dashboard.editor.agent.title': 'Agent Configuration',
    'dashboard.editor.agent.systemSettings.title': 'System Settings',
    'dashboard.editor.agent.systemSettings.systemNameLabel': 'System Name',
    'dashboard.editor.agent.systemSettings.defaultModelLabel': 'Default Model',
    'dashboard.editor.agent.systemSettings.contextClassTitle': 'Context Class',
    'dashboard.editor.agent.systemSettings.contextClassNameLabel': 'Context Class Name',
    'dashboard.editor.agent.systemSettings.contextAttributesTitle': 'Context Attributes',
    'dashboard.editor.agent.systemSettings.addAttributeButton': '+ Add Attribute',
    'dashboard.editor.agent.systemSettings.noAttributes': 'No attributes defined',
    'dashboard.editor.agent.systemSettings.attributeNamePlaceholder': 'Name',
    'dashboard.editor.agent.systemSettings.attributeDefaultPlaceholder': 'Default (optional)',
    'dashboard.editor.agent.systemSettings.removeAttributeTitle': 'Remove Attribute',

    // Agent Editor - Agents Section
    'dashboard.editor.agent.agentsSection.title': 'Agents',
    'dashboard.editor.agent.agentsSection.addAgentButton': '+ Add Agent',
    'dashboard.editor.agent.agentsSection.routerAgentLabel': 'Router Agent',
    'dashboard.editor.agent.agentsSection.deleteAgentTitle': 'Delete Agent',
    'dashboard.editor.agent.agentsSection.deleteAgentButton': 'Delete',
    'dashboard.editor.agent.agentsSection.instructionsLabel': 'Instructions',
    'dashboard.editor.agent.agentsSection.modelLabel': 'Model (optional, defaults to system default)',
    'dashboard.editor.agent.agentsSection.modelUseDefaultOption': 'Use Default ({{model}})',
    'dashboard.editor.agent.agentsSection.handoffDescriptionLabel': 'Handoff Description (optional)',
    'dashboard.editor.agent.agentsSection.handoffDescriptionPlaceholder': 'Description of when to hand off to this agent',
    'dashboard.editor.agent.agentsSection.availableHandoffsLabel': 'Available Handoffs',
    'dashboard.editor.agent.agentsSection.noHandoffsAvailable': 'No other agents available for handoff',

    // Agent Editor - Tools Section
    'dashboard.editor.agent.toolsSection.title': 'Agent Tools',
    'dashboard.editor.agent.toolsSection.addBuiltInButton': '+ Built-in Tool',
    'dashboard.editor.agent.toolsSection.addApiCallButton': '+ API Call',
    'dashboard.editor.agent.toolsSection.addAgentToolButton': '+ Agent Tool',
    'dashboard.editor.agent.toolsSection.noTools': 'No tools defined',
    'dashboard.editor.agent.toolsSection.agentToolType': 'Agent',
    'dashboard.editor.agent.toolsSection.builtInToolType': 'Built-in',
    'dashboard.editor.agent.toolsSection.apiCallToolType': 'API Call',
    'dashboard.editor.agent.toolsSection.editToolTitle': 'Edit Tool',
    'dashboard.editor.agent.toolsSection.removeToolTitle': 'Remove Tool',
    'dashboard.editor.agent.toolsSection.parametersLabel': 'Parameters',
    'dashboard.editor.agent.toolsSection.apiLabel': 'API',

    // Agent Editor - Testing Section
    'dashboard.editor.agent.testingSection.title': 'Test Agent',
    'dashboard.editor.agent.testingSection.noteLabel': 'Note',
    'dashboard.editor.agent.testingSection.saveNote': 'You must save your agent configuration before testing.',
    'dashboard.editor.agent.testingSection.warningLabel': 'Warning',
    'dashboard.editor.agent.testingSection.unsavedWarning': 'You have unsaved changes. Save your configuration to test with the latest changes.',
    'dashboard.editor.agent.testingSection.testMessageLabel': 'Test Message',
    'dashboard.editor.agent.testingSection.testMessagePlaceholder': 'Enter a message to test with the agent...',
    'dashboard.editor.agent.testingSection.testButton': 'Test',
    'dashboard.editor.agent.testingSection.testingButton': 'Testing...',
    'dashboard.editor.agent.testingSection.saveFirstTooltip': 'Save configuration first',
    'dashboard.editor.agent.testingSection.responseLabel': 'Response',
    'dashboard.editor.agent.testingSection.testError': 'Error: Failed to get response from agent',

    // Add more fallbacks for common keys as needed
    'dashboard.editor.agent.apiEndpoints.copyTooltip': 'Copy to clipboard',

    // Agent Editor - Tool Selection Modal
    'dashboard.editor.agent.toolModal.addTitle': 'Add Tool',
    'dashboard.editor.agent.toolModal.editTitle': 'Edit Tool',
    'dashboard.editor.agent.toolModal.closeTooltip': 'Close',
    'dashboard.editor.agent.toolModal.toolTypeLabel': 'Tool Type',
    'dashboard.editor.agent.toolModal.builtInButton': 'Built-in Tool',
    'dashboard.editor.agent.toolModal.apiCallButton': 'API Call',
    'dashboard.editor.agent.toolModal.agentToolButton': 'Agent Tool',
    'dashboard.editor.agent.toolModal.selectBuiltInLabel': 'Select Built-in Tool',
    'dashboard.editor.agent.toolModal.selectToolOption': 'Select a tool...',
    'dashboard.editor.agent.toolModal.selectAgentToolLabel': 'Select Agent to Use as Tool',
    'dashboard.editor.agent.toolModal.selectAgentOption': 'Select an agent...',
    
    // Agent Editor - Save Button
    'dashboard.editor.agent.saveButtonSaving': 'Saving...',
    'dashboard.editor.agent.saveButtonUnsaved': 'Save Configuration',
    'dashboard.editor.agent.saveButtonSaved': 'Configuration Saved',
    
    // Agent Editor - API Config Modal
    'dashboard.editor.agent.apiConfigModal.addTitle': 'Add API Call',
    'dashboard.editor.agent.apiConfigModal.editTitle': 'Edit API Call',
    'dashboard.editor.agent.apiConfigModal.closeTooltip': 'Close',
    'dashboard.editor.agent.apiConfigModal.tabs.basicInfo': 'Basic Info',
    'dashboard.editor.agent.apiConfigModal.tabs.parameters': 'Parameters',
    'dashboard.editor.agent.apiConfigModal.tabs.apiConfiguration': 'API Configuration',
    'dashboard.editor.agent.apiConfigModal.basicInfo.toolNameLabel': 'Tool Name',
    'dashboard.editor.agent.apiConfigModal.basicInfo.toolNamePlaceholder': 'create_task',
    'dashboard.editor.agent.apiConfigModal.basicInfo.toolNameHelpText': 'The name should be in snake_case and describe what the API call does',
    'dashboard.editor.agent.apiConfigModal.basicInfo.descriptionLabel': 'Description',
    'dashboard.editor.agent.apiConfigModal.basicInfo.descriptionPlaceholder': 'Create a new task for a user',
    'dashboard.editor.agent.apiConfigModal.basicInfo.descriptionHelpText': 'Clearly describe what this API call does and when it should be used',
    'dashboard.editor.agent.apiConfigModal.parameters.title': 'Parameters',
    'dashboard.editor.agent.apiConfigModal.parameters.allowAdditionalLabel': 'Allow additional parameters',
    'dashboard.editor.agent.apiConfigModal.parameters.table.headerParam': 'Parameter',
    'dashboard.editor.agent.apiConfigModal.parameters.table.headerType': 'Type',
    'dashboard.editor.agent.apiConfigModal.parameters.table.headerRequired': 'Required',
    'dashboard.editor.agent.apiConfigModal.parameters.table.headerDescription': 'Description',
    'dashboard.editor.agent.apiConfigModal.parameters.table.requiredYes': 'Yes',
    'dashboard.editor.agent.apiConfigModal.parameters.table.requiredNo': 'No',
    'dashboard.editor.agent.apiConfigModal.parameters.table.removeParamTitle': 'Remove Parameter',
    'dashboard.editor.agent.apiConfigModal.parameters.table.noParams': 'No parameters defined yet',
    'dashboard.editor.agent.apiConfigModal.parameters.addParamForm.title': 'Add Parameter',
    'dashboard.editor.agent.apiConfigModal.parameters.addParamForm.nameLabel': 'Name',
    'dashboard.editor.agent.apiConfigModal.parameters.addParamForm.namePlaceholder': 'user_id',
    'dashboard.editor.agent.apiConfigModal.parameters.addParamForm.typeLabel': 'Type',
    'dashboard.editor.agent.apiConfigModal.parameters.addParamForm.descriptionLabel': 'Description',
    'dashboard.editor.agent.apiConfigModal.parameters.addParamForm.descriptionPlaceholder': 'User identifier',
    'dashboard.editor.agent.apiConfigModal.parameters.addParamForm.enumLabel': 'Enum Values (comma-separated)',
    'dashboard.editor.agent.apiConfigModal.parameters.addParamForm.enumPlaceholder': 'low, medium, high',
    'dashboard.editor.agent.apiConfigModal.parameters.addParamForm.requiredLabel': 'Required parameter',
    'dashboard.editor.agent.apiConfigModal.parameters.addParamForm.addButton': 'Add Parameter',
    'dashboard.editor.agent.apiConfigModal.apiConfig.methodLabel': 'HTTP Method',
    'dashboard.editor.agent.apiConfigModal.apiConfig.urlLabel': 'API URL',
    'dashboard.editor.agent.apiConfigModal.apiConfig.urlPlaceholder': 'https://api.example.com/users/{user_id}',
    'dashboard.editor.agent.apiConfigModal.apiConfig.urlHelpText': 'Use "{parameter_name}" syntax to include parameter values in the URL',
    'dashboard.editor.agent.apiConfigModal.apiConfig.headersTitle': 'Headers',
    'dashboard.editor.agent.apiConfigModal.apiConfig.headersTable.headerName': 'Name',
    'dashboard.editor.agent.apiConfigModal.apiConfig.headersTable.headerValue': 'Value',
    'dashboard.editor.agent.apiConfigModal.apiConfig.headersTable.removeHeaderTitle': 'Remove Header',
    'dashboard.editor.agent.apiConfigModal.apiConfig.headersTable.noHeaders': 'No headers defined yet',
    'dashboard.editor.agent.apiConfigModal.apiConfig.addHeaderForm.namePlaceholder': 'Header name',
    'dashboard.editor.agent.apiConfigModal.apiConfig.addHeaderForm.valuePlaceholder': 'Header value',
    'dashboard.editor.agent.apiConfigModal.apiConfig.addHeaderForm.addButton': 'Add',
    'dashboard.editor.agent.apiConfigModal.apiConfig.queryParamsTitle': 'Query Parameters',
    'dashboard.editor.agent.apiConfigModal.apiConfig.queryParamsTable.headerName': 'Name',
    'dashboard.editor.agent.apiConfigModal.apiConfig.queryParamsTable.headerValue': 'Value',
    'dashboard.editor.agent.apiConfigModal.apiConfig.queryParamsTable.removeParamTitle': 'Remove Query Parameter',
    'dashboard.editor.agent.apiConfigModal.apiConfig.queryParamsTable.noParams': 'No query parameters defined yet',
    'dashboard.editor.agent.apiConfigModal.apiConfig.addQueryParamForm.namePlaceholder': 'Parameter name',
    'dashboard.editor.agent.apiConfigModal.apiConfig.addQueryParamForm.valuePlaceholder': 'Parameter value or {template}',
    'dashboard.editor.agent.apiConfigModal.apiConfig.addQueryParamForm.addButton': 'Add',
    'dashboard.editor.agent.apiConfigModal.apiConfig.queryParamsHelpText': 'Use "{parameter_name}" syntax to include parameter values in query parameters',
    'dashboard.editor.agent.apiConfigModal.apiConfig.bodyTemplateTitle': 'Body Template (JSON)',
    'dashboard.editor.agent.apiConfigModal.apiConfig.bodyTemplatePlaceholder': '{ \
  "name": "{task_name}", \
  "priority": "{priority}" \
}',
    'dashboard.editor.agent.apiConfigModal.apiConfig.validateJsonButton': 'Validate JSON',
    'dashboard.editor.agent.apiConfigModal.apiConfig.bodyTemplateHelpText': 'Use "{parameter_name}" syntax to include parameter values in the body template',
    'dashboard.editor.agent.apiConfigModal.apiConfig.responseTemplateTitle': 'Response Template (JSON)',
    'dashboard.editor.agent.apiConfigModal.apiConfig.responseTemplatePlaceholder': '{ \
  "id": "task_123", \
  "name": "{task_name}", \
  "user_id": "{user_id}" \
}',
    'dashboard.editor.agent.apiConfigModal.apiConfig.responseTemplateHelpText': 'Use "{parameter_name}" syntax to map parameters to the response template',
    'dashboard.editor.agent.apiConfigModal.actions.cancelButton': 'Cancel',
    'dashboard.editor.agent.apiConfigModal.actions.addButton': 'Add API Call',
    'dashboard.editor.agent.apiConfigModal.actions.updateButton': 'Update API Call',
    'dashboard.editor.agent.apiConfigModal.alerts.invalidBodyJson': 'Invalid JSON for body template: {{message}}',
    'dashboard.editor.agent.apiConfigModal.alerts.invalidResponseJson': 'Invalid JSON for response template: {{message}}',
    'dashboard.editor.agent.apiConfigModal.alerts.toolNameRequired': 'Tool name is required',
    'dashboard.editor.agent.apiConfigModal.alerts.apiUrlRequired': 'API URL is required',
    'dashboard.editor.agent.apiConfigModal.alerts.invalidTemplateJson': 'Invalid JSON in templates: {{message}}',
    "chatWidget.initialMessage": "Hello! How can I help you today?",
    "chatWidget.errorMessage": "Sorry, I encountered an error processing your request.",
    "chatWidget.resetButton": "Reset",
    "chatWidget.inputPlaceholder": "Type your message...",
    "chatWidget.sendButton": "Send",

    // Dashboard Overview (/dashboard)
    "dashboard.overview.welcome": "Welcome, {{name}}",
    "dashboard.overview.defaultUser": "User",
    "dashboard.overview.subtitle": "Dashboard overview and quick actions",
    "dashboard.overview.stats.activeChatbots": "Active Chatbots",
    "dashboard.overview.stats.totalConversations": "Total Conversations",
    "dashboard.overview.stats.userSatisfaction": "User Satisfaction",
    "dashboard.overview.stats.messagesExchanged": "Messages Exchanged",
    "dashboard.overview.quickActions.title": "Quick Actions",
    "dashboard.overview.quickActions.editChatbot": "Edit Chatbot",
    "dashboard.overview.quickActions.viewInsights": "View Insights",
    "dashboard.overview.quickActions.addKnowledge": "Add Knowledge Source",
    "dashboard.overview.progress.title": "Progress Tracker",
    "dashboard.overview.progress.setup.label": "Setup Your AI Chatbot",
    "dashboard.overview.progress.setup.status": "{{completed}}/{{total}} completed",
    "dashboard.overview.progress.share.label": "Share Your Chatbot To The World",
    "dashboard.overview.progress.share.status": "{{completed}}/{{total}} completed",
    "dashboard.overview.progress.track.label": "Track Your Chatbot Insights",
    "dashboard.overview.progress.track.status": "{{completed}}/{{total}} completed",
    "dashboard.overview.progress.continueButton": "Continue Setup",
    "dashboard.overview.recentConversations.title": "Recent Conversations",
    "dashboard.overview.recentConversations.header.user": "User",
    "dashboard.overview.recentConversations.header.date": "Date",
    "dashboard.overview.recentConversations.header.messages": "Messages",
    "dashboard.overview.recentConversations.header.action": "Action",
    "dashboard.overview.recentConversations.viewButton": "View",
    "dashboard.overview.recentConversations.viewAllLink": "View all conversations",

    // Chatbots Page (/dashboard/chatbots)
    "dashboard.chatbots.title": "My Chatbots",
    "dashboard.chatbots.subtitle": "Create and manage your AI chatbots",
    "dashboard.chatbots.createButton": "Create New Chatbot",
    "dashboard.chatbots.deleteConfirm": "Are you sure you want to delete this chatbot?",
    "dashboard.chatbots.lastUpdated": "Last updated: {{date}}",
    "dashboard.chatbots.editButtonTitle": "Edit Chatbot",
    "dashboard.chatbots.deleteButtonTitle": "Delete Chatbot",
    "dashboard.chatbots.createForm.title": "Create New Chatbot",
    "dashboard.chatbots.createForm.nameLabel": "Chatbot Name",
    "dashboard.chatbots.createForm.namePlaceholder": "Enter a name for your chatbot",
    "dashboard.chatbots.createForm.createButton": "Create Chatbot",
    "dashboard.chatbots.createForm.creatingButton": "Creating...",
    "dashboard.chatbots.createForm.cancelButton": "Cancel",
    "dashboard.chatbots.noChatbots.title": "No Chatbots Yet",
    "dashboard.chatbots.noChatbots.description": "Create your first chatbot to start engaging with your visitors",
    "dashboard.chatbots.noChatbots.createButton": "Create Your First Chatbot",
    "dashboard.chatbots.errors.load": "Failed to load chatbots. Please try again.",
    "dashboard.chatbots.errors.create": "Failed to create chatbot. Please try again.",
    "dashboard.chatbots.errors.delete": "Failed to delete chatbot. Please try again.",
    "dashboard.chatbots.errors.generic": "An error occurred. Please try again.",
    
    // History Page (/dashboard/history)
    "dashboard.history.title": "Conversation History",
    "dashboard.history.subtitle": "View and analyze past user interactions with your chatbot",
    "dashboard.history.filters.status.all": "All",
    "dashboard.history.filters.status.completed": "Completed",
    "dashboard.history.filters.status.abandoned": "Abandoned",
    "dashboard.history.filters.searchPlaceholder": "Search conversations...",
    "dashboard.history.filters.sort.recent": "Recent First",
    "dashboard.history.filters.sort.oldest": "Oldest First",
    "dashboard.history.filters.sort.duration": "Duration (Longest)",
    "dashboard.history.filters.sort.messages": "Messages (Most)",
    "dashboard.history.table.header.user": "User",
    "dashboard.history.table.header.started": "Started",
    "dashboard.history.table.header.duration": "Duration",
    "dashboard.history.table.header.messages": "Messages",
    "dashboard.history.table.header.status": "Status",
    "dashboard.history.table.header.actions": "Actions",
    "dashboard.history.table.status.completed": "Completed",
    "dashboard.history.table.status.abandoned": "Abandoned",
    "dashboard.history.table.actions.view": "View",
    "dashboard.history.table.actions.export": "Export",
    "dashboard.history.pagination.showing": "Showing {{start}} to {{end}} of {{total}} conversations",
    "dashboard.history.pagination.previous": "Previous",
    "dashboard.history.pagination.next": "Next",
    "dashboard.history.preview.title": "Conversation with {{user}}",
    "dashboard.history.preview.viewTranscriptButton": "View Full Transcript",
    "dashboard.history.preview.startedLabel": "Started",
    "dashboard.history.preview.durationLabel": "Duration",
    "dashboard.history.preview.messagesLabel": "Messages",
    "dashboard.history.preview.statusLabel": "Status",
    "dashboard.history.preview.status.completed": "Completed",
    "dashboard.history.preview.status.abandoned": "Abandoned", // Although not used in preview example, added for consistency
    "dashboard.history.preview.message.user": "User",
    "dashboard.history.preview.message.bot": "Bot",

    // Insights Page (/dashboard/insights)
    "dashboard.insights.title": "Insights",
    "dashboard.insights.subtitle": "Analytics and performance metrics for your chatbot",
    "dashboard.insights.overview.title": "Performance Overview",
    "dashboard.insights.overview.timeRanges.day": "Day",
    "dashboard.insights.overview.timeRanges.week": "Week",
    "dashboard.insights.overview.timeRanges.month": "Month",
    "dashboard.insights.overview.timeRanges.year": "Year",
    "dashboard.insights.stats.totalConversations": "Total Conversations",
    "dashboard.insights.stats.avgLength": "Avg. Conversation Length",
    "dashboard.insights.stats.satisfaction": "User Satisfaction",
    "dashboard.insights.stats.responseRate": "Response Rate",
    "dashboard.insights.stats.changeTimeRange": "{{change}} from last {{timeRange}}",
    "dashboard.insights.charts.volume.title": "Conversation Volume",
    "dashboard.insights.charts.volume.tooltip": "{{count}} conversations",
    "dashboard.insights.charts.volume.days.mon": "Mon",
    "dashboard.insights.charts.volume.days.tue": "Tue",
    "dashboard.insights.charts.volume.days.wed": "Wed",
    "dashboard.insights.charts.volume.days.thu": "Thu",
    "dashboard.insights.charts.volume.days.fri": "Fri",
    "dashboard.insights.charts.volume.days.sat": "Sat",
    "dashboard.insights.charts.volume.days.sun": "Sun",
    "dashboard.insights.charts.satisfaction.title": "User Satisfaction",
    "dashboard.insights.charts.satisfaction.label": "Satisfied Users",
    "dashboard.insights.topQuestions.title": "Top Questions",
    "dashboard.insights.topQuestions.table.header.question": "Question",
    "dashboard.insights.topQuestions.table.header.frequency": "Frequency",
    "dashboard.insights.topQuestions.table.header.responseTime": "Avg. Response Time",
    "dashboard.insights.topQuestions.table.header.satisfaction": "Satisfaction",

    // Account Page (/dashboard/account)
    "dashboard.account.title": "Account Settings",
    "dashboard.account.subtitle": "Manage your account preferences and settings",
    "dashboard.account.tabs.profile": "Profile",
    "dashboard.account.tabs.security": "Security",
    "dashboard.account.tabs.preferences": "Preferences",
    "dashboard.account.messages.saveSuccess": "Changes saved successfully!",
    "dashboard.account.buttons.saving": "Saving...",
    "dashboard.account.buttons.saveChanges": "Save Changes",
    "dashboard.account.buttons.updating": "Updating...",
    "dashboard.account.buttons.updatePassword": "Update Password",
    "dashboard.account.buttons.loggingOut": "Logging Out...",
    "dashboard.account.buttons.logOutAll": "Log Out All Devices",
    "dashboard.account.buttons.savePreferences": "Save Preferences",
    // Profile Tab
    "dashboard.account.profile.title": "Personal Information",
    "dashboard.account.profile.defaultUser": "User",
    "dashboard.account.profile.memberSince": "Member since {{date}}",
    "dashboard.account.profile.firstNameLabel": "First Name",
    "dashboard.account.profile.firstNamePlaceholder": "Enter your first name",
    "dashboard.account.profile.lastNameLabel": "Last Name",
    "dashboard.account.profile.lastNamePlaceholder": "Enter your last name",
    "dashboard.account.profile.emailLabel": "Email Address",
    "dashboard.account.profile.emailHelpText": "Your email address cannot be changed",
    "dashboard.account.profile.companyNameLabel": "Company Name",
    "dashboard.account.profile.companyNamePlaceholder": "Enter your company name",
    // Security Tab
    "dashboard.account.security.changePasswordTitle": "Change Password",
    "dashboard.account.security.currentPasswordLabel": "Current Password",
    "dashboard.account.security.currentPasswordPlaceholder": "Enter your current password",
    "dashboard.account.security.newPasswordLabel": "New Password",
    "dashboard.account.security.newPasswordPlaceholder": "Enter your new password",
    "dashboard.account.security.passwordComplexityHelpText": "Must be at least 8 characters and include a letter, a number, and a special character",
    "dashboard.account.security.confirmPasswordLabel": "Confirm New Password",
    "dashboard.account.security.confirmPasswordPlaceholder": "Confirm your new password",
    "dashboard.account.security.twoFactor.title": "Two-Factor Authentication",
    "dashboard.account.security.twoFactor.subtitle": "Enhance your account security",
    "dashboard.account.security.twoFactor.description": "Enable two-factor authentication to add an extra layer of security to your account",
    "dashboard.account.security.twoFactor.comingSoonButton": "Coming Soon",
    "dashboard.account.security.access.title": "Account Access",
    "dashboard.account.security.access.deviceInfo": "{{browser}} on {{os}}",
    "dashboard.account.security.access.lastActive": "Last active: {{date}}",
    "dashboard.account.security.access.currentDevice": "Current",
    "dashboard.account.security.access.logoutNote": "Note: This will sign you out from your current session",
    "dashboard.account.security.googleAccount.title": "Google Account Detected",
    "dashboard.account.security.googleAccount.message": "Your account uses Google authentication. To change your password, please visit your Google account settings.",
    "dashboard.account.security.googleAccount.link": "Go to Google Account Settings",
    "dashboard.account.security.messages.passwordUpdateSuccess": "Password updated successfully!",
    "dashboard.account.security.errors.currentPasswordRequired": "Current password is required",
    "dashboard.account.security.errors.newPasswordRequired": "New password is required",
    "dashboard.account.security.errors.passwordsDoNotMatch": "New passwords do not match",
    "dashboard.account.security.errors.passwordComplexity": "Password must be at least 8 characters and include a letter, a number, and a special character",
    "dashboard.account.security.errors.updateFailed": "Failed to update password",
    "dashboard.account.security.errors.unexpectedError": "An unexpected error occurred",
    // Preferences Tab
    "dashboard.account.preferences.title": "Notification Settings",
    "dashboard.account.preferences.notifications.newChats.title": "New Conversations",
    "dashboard.account.preferences.notifications.newChats.description": "Receive notifications when users start new conversations",
    "dashboard.account.preferences.notifications.chatUpdates.title": "Chat Updates",
    "dashboard.account.preferences.notifications.chatUpdates.description": "Get notified about new messages in your conversations",
    "dashboard.account.preferences.notifications.monthlyReport.title": "Monthly Report",
    "dashboard.account.preferences.notifications.monthlyReport.description": "Receive a monthly summary of your account activity",
    "dashboard.account.preferences.notifications.productUpdates.title": "Product Updates",
    "dashboard.account.preferences.notifications.productUpdates.description": "Get notified about new features and improvements",

    // Install Modal
    "dashboard.installModal.title": "Install Your Chatbot",
    "dashboard.installModal.description": "Copy the code below and paste it into your website to install the chatbot.",
    "dashboard.installModal.copyButton": "Copy",
    "dashboard.installModal.copiedButton": "Copied!",
    "dashboard.installModal.codePlacementHelp": "Add this code to the <head> or <body> section of your website.",
    "dashboard.installModal.integrations.title": "Integration Options",
    "dashboard.installModal.integrations.point1": "Works with any website or platform that allows custom HTML",
    "dashboard.installModal.integrations.point2": "Real-time conversation with your AI agent",
    "dashboard.installModal.integrations.point3": "All your configured appearance settings and tools are applied",
    "dashboard.installModal.closeButton": "Close"
  };

  // Try to find the exact key, or return a placeholder
  return fallbacks[key] || key.split('.').pop() || key;
} 