// Firebase app and auth config
export { app } from "./config";

// For backward compatibility, export db
export { db } from "./config";

// Re-export API functions to replace Firestore operations
// This approach allows us to smoothly migrate without updating all imports at once
export * from "../api";