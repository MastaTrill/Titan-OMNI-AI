/// <reference types="vite/client" />

// Declare CSS module imports
declare module '*.css' {
  const content: string;
  export default content;
}
