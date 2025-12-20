/**
 * Type declarations for asset imports
 * Allows TypeScript to recognize image imports from assets directory
 */

declare module '*.png' {
  const value: number;
  export default value;
}

declare module '*.jpg' {
  const value: number;
  export default value;
}

declare module '*.jpeg' {
  const value: number;
  export default value;
}

declare module '*.gif' {
  const value: number;
  export default value;
}

declare module '*.webp' {
  const value: number;
  export default value;
}

declare module '*.svg' {
  const value: number;
  export default value;
}
