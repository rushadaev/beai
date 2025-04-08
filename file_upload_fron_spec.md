# Frontend Specification: File Upload for File Search Tool

This document outlines the frontend requirements for implementing the file upload functionality associated with the `file_search` tool in the Agent Editor.

## 1. Context

The backend provides an endpoint `/api/agents/{agent_id}/files` (POST) that accepts multiple file uploads (`multipart/form-data`) for a specific agent. It uploads these files to OpenAI, creates an OpenAI Vector Store, adds the files to it, and returns a `{ vector_store_id: "vs_..." }` JSON response upon success.

This `vector_store_id` is required by the `file_search` tool configuration within the agent definition.

## 2. Triggering the Feature

The file upload functionality should be accessible when a user adds or edits a tool and selects the `file_search` (or equivalent built-in) tool type for an agent within the `AgentToolsSection.tsx` component (or its associated modal/editing interface).

## 3. UI Elements

When the `file_search` tool is selected or being configured, the following UI elements should be presented:

1.  **Vector Store ID Display:**
    *   A read-only text field or display area showing the current `vector_store_id` associated with this tool for the agent (if one exists).
    *   Label: "Vector Store ID" or similar.
    *   Placeholder/Default Text: "No vector store associated" or "Upload files to create one".
2.  **Upload Button:**
    *   A button labeled "Upload Files" or "Create/Update Vector Store".
    *   Clicking this button should trigger the file selection dialog.
3.  **File Input:**
    *   A hidden `<input type="file" multiple>` element, triggered by the Upload Button.
4.  **Status/Feedback Area:**
    *   A text area or element to display feedback to the user, such as:
        *   "Uploading files..."
        *   "Vector Store created/updated successfully. ID: vs_..."
        *   "Error uploading files: [Error message from API]"
        *   "No files selected."

## 4. Workflow

1.  **Initiation:** User selects the `file_search` tool for an agent or edits an existing one.
2.  **File Selection:** User clicks the "Upload Files" button. The browser's file selection dialog opens.
3.  **File Submission:** User selects one or more files and confirms.
4.  **API Call:**
    *   The frontend gathers the selected `File` objects.
    *   If no files are selected, display an appropriate message in the feedback area and do nothing further.
    *   If files are selected, display "Uploading files..." in the feedback area.
    *   Initiate a `POST` request to `/api/agents/{agent_id}/files`.
    *   The request body must be `multipart/form-data`, containing the selected files under the key `files`.
    *   The `{agent_id}` in the URL corresponds to the agent currently being edited.
5.  **Handling Response:**
    *   **Success (200 OK):**
        *   The API returns `{"vector_store_id": "vs_..."}`.
        *   Update the agent's configuration state to include/update the `vector_store_id` for this specific `file_search` tool instance.
        *   Display the new `vector_store_id` in the dedicated UI element.
        *   Show a success message in the feedback area (e.g., "Vector Store created successfully. ID: vs_...").
    *   **Failure (4xx/5xx):**
        *   The API returns an error response (e.g., `{"detail": "Error message"}`).
        *   Display the error message from the API response in the feedback area.
        *   Do not update the `vector_store_id` in the state.

## 5. State Management

*   The component responsible for editing the agent's tools needs to manage the `vector_store_id` associated with each `file_search` tool instance.
*   When a file upload is successful, this state must be updated with the new `vector_store_id` received from the API.
*   This `vector_store_id` should be saved as part of the agent's overall configuration when the user saves their changes. The `file_search` tool configuration should store this ID (e.g., within the `tool` object in the `agent.tools` array).

## 6. Component Implementation

*   This functionality can be integrated into the existing tool editing modal or form used by `AgentToolsSection.tsx`.
*   When the tool type is `file_search`, the specific UI elements (Vector Store ID display, Upload button) should be rendered.
*   Standard fetch/axios or a library like `react-query` / `swr` can be used for the API call. Ensure correct handling of `multipart/form-data`. 