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
            "required": ["param_name"],
            "additionalProperties": false
          },
          "api_config": {
            "method": "GET|POST|PUT|DELETE",
            "url": "string (can include {parameter} templates)",
            "headers": {
              "header_name": "header_value"
            },
            "query_params": {
              "param_name": "value (can include {parameter} templates)"
            },
            "body_template": {
              "key": "value (can include {parameter} templates)"
            },
            "response_template": {
              "key": "value (can include {parameter} templates)"
            }
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

### Tool Types
The system supports three types of tools:

1. **Built-in Tools**: String references like `"web_search"`
2. **Function Tools**: Custom function definitions with parameters and API configs
3. **Agent-as-Tool**: References to other agents in the format `"agent_<agent_id>"`

## Frontend Constructor UI Specification

### Agent System Constructor

Create a multi-step form with these sections:

1. **Basic System Information**
   - System Name (text input)
   - Default Model (dropdown - gpt-4o, gpt-4o-mini, etc.)
   - Context Class Definition (dynamic form)

2. **Agents Definition**
   - List of agents with ability to add, edit, remove
   - For each agent:
     - ID (text input)
     - Name (text input)
     - Instructions (textarea)
     - Model (dropdown, default from system)
     - Handoff Description (text input, optional)
     - Tools section (see Tools UI below)
     - Handoffs section (multi-select from other defined agents)

3. **Router Selection**
   - Dropdown to select which agent is the router
   - This should only show agents defined in step 2

4. **JSON Preview**
   - Live preview of the JSON being constructed
   - Copy to clipboard button
   - Download JSON button

### Tools UI

Create a dynamic tool builder with these options:

1. **Tool Type Selector**
   - Radio or dropdown to select tool type:
     - Built-in Tool
     - Custom Function Tool
     - Agent-as-Tool

2. **Built-in Tool Form**
   - Dropdown with built-in tools:
     - `web_search`
     - `file_search` (with settings for vector store IDs and max results)

3. **Agent-as-Tool Form**
   - Dropdown to select from other defined agents
   - Description field (text input)

4. **Custom Function Tool Form**
   - Tool Name (text input)
   - Description (text input)
   - Parameters Builder (see below)
   - API Configuration Builder (see below)

### Parameters Builder

Create a dynamic form for building parameter schemas:

1. **Parameter List**
   - List of defined parameters with ability to add, edit, remove
   - For each parameter:
     - Name (text input)
     - Type (dropdown - string, number, boolean, etc.)
     - Description (text input)
     - Required (checkbox, should be checked by default)
     - Default Value (optional, depends on type)
     - Enum Values (optional, comma-separated list)

2. **Parameters JSON Preview**
   - Live preview of the parameters JSON schema
   - Validation to ensure all properties listed in the `required` array
   - Validation to ensure `additionalProperties` is set to `false`

### API Configuration Builder

Create a dynamic form for building API configs:

1. **Basic API Settings**
   - HTTP Method (dropdown - GET, POST, PUT, DELETE)
   - URL (text input with template syntax helper)
   - Helper text: "Use {parameter_name} to include parameter values in the URL"

2. **Headers Builder**
   - Dynamic key-value pairs for headers
   - Option to add environment variable references like `API_KEY_FROM_ENV`

3. **Query Parameters Builder**
   - Dynamic key-value pairs for query parameters
   - Helper text: "Use {parameter_name} to include parameter values in query params"

4. **Body Template Builder (for POST/PUT)**
   - JSON editor for body template
   - Helper text: "Use {parameter_name} to include parameter values in the body"

5. **Response Template Builder**
   - JSON editor for response template
   - Helper text: "Use {parameter_name} to include parameter values in the response"

6. **API Config JSON Preview**
   - Live preview of the API configuration JSON

## Template Variable Usage

Throughout the UI, provide clear instructions about how to use template variables:

1. **URL Templates**
   - Format: `https://api.example.com/users/{user_id}`
   - Parameters used in URL templates must be in the parameters definition and required array

2. **Query Parameter Templates**
   - Format: `"q": "{search_term}"`
   - Parameters used in query params must be in the parameters definition and required array

3. **Body Template Variables**
   - Format: `"customer_name": "{name}"`
   - Parameters used in body template must be in the parameters definition and required array

4. **Response Template Variables**
   - Format: `"customerId": "{customer_id}"`
   - Parameters used in response template must be in the parameters definition and required array

## Example Function Tool Configurations

### Example 1: Simple GET Request

```json
{
  "name": "get_user_info",
  "description": "Get information about a user",
  "parameters": {
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string",
        "description": "User identifier"
      }
    },
    "required": ["user_id"],
    "additionalProperties": false
  },
  "api_config": {
    "method": "GET",
    "url": "https://api.example.com/users/{user_id}",
    "headers": {
      "Authorization": "Bearer API_KEY_FROM_ENV",
      "Content-Type": "application/json"
    },
    "response_template": {
      "id": "{user_id}",
      "name": "User Name",
      "email": "user@example.com"
    }
  }
}
```

### Example 2: POST Request with Template Variables

```json
{
  "name": "create_task",
  "description": "Create a new task for a user",
  "parameters": {
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string",
        "description": "User identifier"
      },
      "task_name": {
        "type": "string",
        "description": "Name of the task"
      },
      "priority": {
        "type": "string",
        "description": "Task priority",
        "enum": ["low", "medium", "high"]
      }
    },
    "required": ["user_id", "task_name", "priority"],
    "additionalProperties": false
  },
  "api_config": {
    "method": "POST",
    "url": "https://api.example.com/users/{user_id}/tasks",
    "headers": {
      "Authorization": "Bearer API_KEY_FROM_ENV",
      "Content-Type": "application/json"
    },
    "body_template": {
      "name": "{task_name}",
      "priority": "{priority}",
      "created_at": "2023-07-14T00:00:00Z"
    },
    "response_template": {
      "id": "task_123",
      "name": "{task_name}",
      "priority": "{priority}",
      "user_id": "{user_id}",
      "status": "created"
    }
  }
}
```

### Example 3: Search API with Query Parameters

```json
{
  "name": "search_products",
  "description": "Search for products",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Search query"
      },
      "category": {
        "type": "string",
        "description": "Product category"
      },
      "limit": {
        "type": "integer",
        "description": "Maximum number of results"
      }
    },
    "required": ["query", "category", "limit"],
    "additionalProperties": false
  },
  "api_config": {
    "method": "GET",
    "url": "https://api.example.com/products/search",
    "headers": {
      "Content-Type": "application/json"
    },
    "query_params": {
      "q": "{query}",
      "category": "{category}",
      "limit": "{limit}"
    },
    "response_template": {
      "products": [
        {
          "id": "product_123",
          "name": "Example Product",
          "category": "{category}",
          "price": 99.99
        }
      ],
      "total": 1,
      "query": "{query}"
    }
  }
}
```

## JavaScript Code for Tool Builder Component

```javascript
// Example React component for building API configuration
function ApiConfigBuilder({ parameters, onChange, initialConfig = {} }) {
  const [method, setMethod] = useState(initialConfig.method || 'GET');
  const [url, setUrl] = useState(initialConfig.url || '');
  const [headers, setHeaders] = useState(initialConfig.headers || {});
  const [queryParams, setQueryParams] = useState(initialConfig.query_params || {});
  const [bodyTemplate, setBodyTemplate] = useState(initialConfig.body_template || {});
  const [responseTemplate, setResponseTemplate] = useState(initialConfig.response_template || {});
  
  // Extract parameter names for template suggestions
  const parameterNames = Object.keys(parameters?.properties || {});
  
  // Update parent component when configuration changes
  useEffect(() => {
    const config = {
      method,
      url,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      query_params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      body_template: Object.keys(bodyTemplate).length > 0 ? bodyTemplate : undefined,
      response_template: Object.keys(responseTemplate).length > 0 ? responseTemplate : undefined
    };
    
    // Remove undefined values
    Object.keys(config).forEach(key => {
      if (config[key] === undefined) {
        delete config[key];
      }
    });
    
    onChange(config);
  }, [method, url, headers, queryParams, bodyTemplate, responseTemplate]);
  
  // Add a template variable to a string
  const addTemplateVariable = (text, variable) => {
    return text + `{${variable}}`;
  };
  
  return (
    <div className="api-config-builder">
      <h3>API Configuration</h3>
      
      <div className="form-group">
        <label>HTTP Method</label>
        <select value={method} onChange={e => setMethod(e.target.value)}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>URL</label>
        <div className="input-with-suggestions">
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://api.example.com/endpoint/{parameter}"
          />
          <div className="parameter-suggestions">
            {parameterNames.map(param => (
              <button
                key={param}
                onClick={() => setUrl(addTemplateVariable(url, param))}
                title={`Add ${param} template variable`}
              >
                {param}
              </button>
            ))}
          </div>
        </div>
        <small className="help-text">
          Use {'{parameter}'} syntax to include parameter values in the URL
        </small>
      </div>
      
      {/* Headers builder UI */}
      <KeyValueEditor
        title="Headers"
        keyPlaceholder="Header Name"
        valuePlaceholder="Header Value"
        values={headers}
        onChange={setHeaders}
      />
      
      {/* Query parameters builder UI */}
      <KeyValueEditor
        title="Query Parameters"
        keyPlaceholder="Parameter Name"
        valuePlaceholder="Parameter Value"
        values={queryParams}
        onChange={setQueryParams}
        parameterNames={parameterNames}
      />
      
      {/* Body template builder (for POST/PUT) */}
      {(method === 'POST' || method === 'PUT') && (
        <JsonEditor
          title="Body Template"
          value={bodyTemplate}
          onChange={setBodyTemplate}
          parameterNames={parameterNames}
          helpText="Use {parameter} syntax to include parameter values in the body"
        />
      )}
      
      {/* Response template builder */}
      <JsonEditor
        title="Response Template"
        value={responseTemplate}
        onChange={setResponseTemplate}
        parameterNames={parameterNames}
        helpText="Use {parameter} syntax to include parameter values in the response"
      />
      
      {/* Preview of the API configuration */}
      <div className="json-preview">
        <h4>API Configuration Preview</h4>
        <pre>{JSON.stringify({
          method,
          url,
          headers: Object.keys(headers).length > 0 ? headers : undefined,
          query_params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
          body_template: Object.keys(bodyTemplate).length > 0 ? bodyTemplate : undefined,
          response_template: Object.keys(responseTemplate).length > 0 ? responseTemplate : undefined
        }, null, 2)}</pre>
      </div>
    </div>
  );
}
```

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
