declare module "*.svg" {
  const content: string;
  export default content;
}

// Add Vite's HMR API type definitions
interface ImportMeta {
  hot?: {
    data: Record<string, any>;
    accept(): void;
    accept(cb: (mod: any) => void): void;
    accept(dep: string, cb: (mod: any) => void): void;
    accept(deps: string[], cb: (mods: any[]) => void): void;
    prune(cb: () => void): void;
    dispose(cb: (data: Record<string, any>) => void): void;
    decline(): void;
    invalidate(): void;
    on(event: string, cb: (...args: any[]) => void): void;
  };
}
