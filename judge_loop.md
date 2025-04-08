
# Judge Loop Pattern Frontend Specification

Here's a specification for creating a frontend interface that allows users to configure judge loop agents similar to the one defined in `judge_loop.json`.

## 1. Main Workflow Configuration UI

### Basic Agent System Settings Section
- **System Name** (text field)
  - Label: "System Name"
  - Default: "Story Generator System"
  - Description: "A descriptive name for your agent system"

- **Workflow Type** (dropdown)
  - Label: "Workflow Type"
  - Options: ["simple_router", "judge_loop"]
  - Default: "judge_loop"
  - Description: "Determines how agent interactions are handled"

### Judge Loop Configuration Section
*Appears when "judge_loop" is selected as workflow type*

- **Generator Agent** (dropdown)
  - Label: "Generator Agent"
  - Options: [List of created agents]
  - Description: "Agent that produces content based on user input"

- **Evaluator Agent** (dropdown)
  - Label: "Evaluator Agent"
  - Options: [List of created agents]
  - Description: "Agent that evaluates the generator's output"

- **Maximum Iterations** (number input)
  - Label: "Maximum Iterations"
  - Default: 5
  - Min: 1, Max: 10
  - Description: "Maximum number of improvement cycles before returning result"

- **Pass Field** (text field)
  - Label: "Evaluation Pass Field"
  - Default: "score"
  - Description: "Field name in evaluator output that indicates pass/fail status"

- **Pass Value** (text field)
  - Label: "Pass Value"
  - Default: "pass"
  - Description: "Value that indicates a passing evaluation"

- **Feedback Field** (text field)
  - Label: "Feedback Field"
  - Default: "feedback"
  - Description: "Field name in evaluator output that contains improvement feedback"

## 2. Agent Creation UI

### Generator Agent Configuration
- **ID** (text field)
  - Label: "Agent ID"
  - Default: "story_generator"
  - Description: "Unique identifier for this agent"

- **Name** (text field)
  - Label: "Agent Name"
  - Default: "Story Generator"
  - Description: "Human-readable name"

- **Instructions** (textarea)
  - Label: "Instructions"
  - Default: "You generate a very short story outline based on the user's input. If there is any feedback provided, use it to improve the outline. Not more than 100 words."
  - Description: "Instructions that define the agent's behavior"

- **Model** (dropdown)
  - Label: "Model"
  - Options: ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo", etc.]
  - Default: "gpt-4o-mini"
  - Description: "The underlying AI model"

### Evaluator Agent Configuration
- **ID** (text field)
  - Label: "Agent ID"
  - Default: "story_evaluator"
  - Description: "Unique identifier for this agent"

- **Name** (text field)
  - Label: "Agent Name"
  - Default: "Story Evaluator"
  - Description: "Human-readable name"

- **Instructions** (textarea)
  - Label: "Instructions"
  - Default: "You evaluate a story outline and decide if it's good enough. If it's not good enough, you provide feedback on what needs to be improved. Never give it a pass on the first try."
  - Description: "Instructions that define the agent's behavior"

- **Model** (dropdown)
  - Label: "Model"
  - Options: ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo", etc.]
  - Default: "gpt-4o-mini"
  - Description: "The underlying AI model"

- **Output Type Configuration** (structured form)
  - Label: "Output Type"
  - Description: "Structured schema for evaluator responses"
  - Fields:
    - **Type Name** (text field)
      - Default: "EvaluationFeedback"
    - **Properties** (repeating section)
      - Property name (text field): e.g., "feedback"
      - Property type (dropdown): ["string", "number", "boolean", etc.]
      - Description (text field): e.g., "Feedback on how to improve the story outline"
      - Enum values (comma-separated, for string type): e.g., "pass, needs_improvement, fail"
    - UI should include "Add Property" button
    - Default properties configuration:
      1. "feedback" (string): "Feedback on how to improve the story outline"
      2. "score" (string with enum): "pass, needs_improvement, fail"

### Router Agent Configuration
- **ID** (text field)
  - Label: "Agent ID"
  - Default: "router_agent"
  - Description: "Unique identifier for this agent"

- **Name** (text field)
  - Label: "Agent Name"
  - Default: "Router"
  - Description: "Human-readable name"

- **Instructions** (textarea)
  - Label: "Instructions"
  - Default: "You route user requests to the appropriate agent."
  - Description: "Instructions that define the agent's behavior"

- **Model** (dropdown)
  - Label: "Model"
  - Options: ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo", etc.]
  - Default: "gpt-4o-mini"
  - Description: "The underlying AI model"

## 3. Context Configuration
- **Context Class Name** (text field)
  - Label: "Context Class Name"
  - Default: "UserContext"
  - Description: "Name of the context class"

- **Context Attributes** (repeating section)
  - Attribute name (text field): e.g., "user_id"
  - Attribute type (dropdown): ["str", "int", "float", "bool", "list", "dict", etc.]
  - Default value (optional text field)
  - UI should include "Add Attribute" button

## 4. JSON Preview

A read-only section that shows the complete JSON configuration being generated, updating in real-time as the user makes changes to the form fields above.

## 5. Testing Interface

A simple interface for testing the created judge loop agent:
- Text input field for user message
- Submit button
- Response display area with:
  - Final response
  - "View Trace" button that opens a modal showing the full trace with iterations
  - Iteration statistics (e.g., "Generated in 3 iterations")

## 6. API Integration

The frontend should interact with these endpoints:
- `POST /api/agents/{agent_id}` - Create/update an agent configuration
- `GET /api/agents/{agent_id}` - Retrieve an agent configuration
- `POST /api/message` - Send a message to an agent
- Ensure that the JSON structure matches what's expected by the backend

## Implementation Guidelines

1. **Component Structure**:
   - Split the form into logical sections
   - Use tabs for different configuration areas
   - Show/hide relevant configuration fields based on the workflow type

2. **Validation**:
   - Ensure all required fields are filled in
   - Validate that IDs are unique
   - Check that the evaluator's output type includes the fields specified in the workflow config

3. **User Experience**:
   - Provide tooltips explaining each field
   - Include "Presets" dropdown for common configurations
   - Show real-time feedback as the configuration is built
   - Preview generated configuration in JSON format

4. **Progressive Disclosure**:
   - Start with basic configuration
   - Expand to advanced options when users need them
   - Include "Quick Setup" wizard for first-time users

5. **Responsive Design**:
   - Ensure the interface works on desktop and tablet devices
   - Consider collapsible sections for mobile views

This specification provides a complete framework for building a frontend that allows users to create judge loop agents with the same capabilities as your current JSON configuration.
