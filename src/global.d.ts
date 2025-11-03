/**
 * Global type declarations for runtime environment configuration
 */

interface RuntimeEnv {
  [key: string]: string;
}

interface Window {
  _env_?: RuntimeEnv;
}
