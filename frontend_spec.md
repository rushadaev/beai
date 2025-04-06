
# Agent Constructor API Specification

## Base URL
```
http://localhost:8000
```

## Authentication
No authentication required for local development. Add your own authentication mechanism for production deployment.

## Endpoints

### List All Agents
Get a list of all registered agent IDs.

**Endpoint:** `GET /api/agents`

**Response:**
```json
{
  "agent_ids": ["customer_support", "financial_advisor"]
}
```

### Get Agent Configuration
Get the configuration for a specific agent.

**Endpoint:** `GET /api/agents/{agent_id}`

**Path Parameters:**
- `agent_id` (string, required): ID of the agent

**Response:**
```json
{
  "config": {
    "system_name": "CustomerSupport",
    "context_class": {
      "name": "CustomerContext",
      "attributes": [
        {"name": "user_id", "type": "str"},
        {"name": "conversation_history", "type": "str", "default": ""}
      ]
    },
    "agents": [...],
    "router_agent_id": "router",
    "default_model": "gpt-4o-mini"
  }
}
```

### Register New Agent
Register a new agent configuration.

**Endpoint:** `POST /api/agents/{agent_id}`

**Path Parameters:**
- `agent_id` (string, required): ID for the new agent system

**Request Body:**
```json
{
  "config": {
    "system_name": "AgentName",
    "context_class": {
      "name": "ContextName",
      "attributes": [
        {"name": "attribute_name", "type": "type", "default": "default_value"}
      ]
    },
    "agents": [
      {
        "id": "agent_id",
        "name": "Agent Name",
        "instructions": "Agent instructions",
        "model": "model_name",
        "tools": ["tool_name"],
        "handoffs": ["other_agent_id"]
      }
    ],
    "router_agent_id": "main_agent_id",
    "default_model": "default_model_name"
  }
}
```

**Response:**
```json
{
  "agent_id": "agent_id"
}
```

### Upload Agent Configuration
Upload an agent configuration file.

**Endpoint:** `POST /api/agents/upload`

**Form Parameters:**
- `file` (file, required): JSON configuration file
- `agent_id` (string, optional): ID for the agent system. If not provided, the filename will be used

**Response:**
```json
{
  "agent_id": "agent_id"
}
```

### Delete Agent
Delete an agent configuration.

**Endpoint:** `DELETE /api/agents/{agent_id}`

**Path Parameters:**
- `agent_id` (string, required): ID of the agent to delete

**Response:**
```json
{
  "agent_id": "agent_id"
}
```

### Process Message
Process a message through a specified agent system.

**Endpoint:** `POST /api/message`

**Request Body:**
```json
{
  "agent_id": "agent_id",
  "message": "User message",
  "user_id": "optional_user_id",
  "stream": false
}
```

**Regular Response (stream: false):**
```json
{
  "response": "Agent response"
}
```

**Streaming Response (stream: true):**
Server-sent events (SSE) with the following format:
```
data: First part of response

data: Next part of response

data: Final part of response

data: [DONE]
```

## Schema Definitions

### Agent Configuration Schema

```json
{
  "system_name": "string",
  "context_class": {
    "name": "string",
    "attributes": [
      {
        "name": "string",
        "type": "string",
        "default": "any (optional)"
      }
    ]
  },
  "agents": [
    {
      "id": "string",
      "name": "string",
      "instructions": "string",
      "model": "string (optional, defaults to default_model)",
      "handoff_description": "string (optional)",
      "tools": [
        "string" or {
          "name": "string",
          "description": "string",
          "parameters": {
            "type": "object",
            "properties": {
              "param_name": {
                "type": "string|integer|boolean|etc",
                "description": "string",
                "enum": ["possible", "values"] // optional
              }
            },
            "required": ["param_name"]
          }
        }
      ],
      "handoffs": ["string (agent_ids)"]
    }
  ],
  "router_agent_id": "string (must match an agent's id)",
  "default_model": "string (e.g., gpt-4o-mini)"
}
```

### Valid Types for Context Attributes
- `str`
- `int`
- `float`
- `bool`
- `list`
- `dict`
- `List[str]`
- `Dict[str, Any]`

## Example Frontend Integration

### JavaScript Code to Process a Message

```javascript
// Regular request
async function sendMessage(agentId, message, userId) {
  const response = await fetch('/api/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_id: agentId,
      message: message,
      user_id: userId,
      stream: false
    })
  });
  
  const data = await response.json();
  return data.response;
}

// Streaming request
function streamMessage(agentId, message, userId, onChunk, onComplete, onError) {
  const eventSource = new EventSource(`/api/message?agent_id=${agentId}&message=${encodeURIComponent(message)}&user_id=${userId}&stream=true`);
  
  eventSource.onmessage = (event) => {
    if (event.data === '[DONE]') {
      eventSource.close();
      if (onComplete) onComplete();
    } else {
      if (onChunk) onChunk(event.data);
    }
  };
  
  eventSource.onerror = (error) => {
    eventSource.close();
    if (onError) onError(error);
  };
  
  return eventSource; // Return so it can be closed manually if needed
}
```

### UI for Creating New Agent Configuration

For building a UI to create agent configurations, you should include forms for:

1. System name and default model
2. Context class definition with attributes
3. Agent definitions including:
   - Basic info (ID, name, instructions)
   - Tool selection/creation
   - Handoff relationships
4. Router agent selection

The form should validate that:
- Each agent has a unique ID
- The router agent ID matches one of the defined agents
- Required fields are present 
- Tool parameters have valid structure
