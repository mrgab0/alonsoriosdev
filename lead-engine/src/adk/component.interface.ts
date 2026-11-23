/**
 * lead-engine/src/adk/component.interface.ts
 * Contratos base para componentes especializados estilo Google ADK (Sección 13 de LEAD_ENGINE_SPEC.md).
 * Cada componente tiene una única responsabilidad, timeout estricto, métricas y manejo tipado de errores.
 */

export interface ComponentMetadata {
  name: string;
  version: string;
  responsibility: string;
  timeoutMs: number;
}

export interface ExecutionContext {
  traceId: string;
  startedAt: string;
  environment: "local" | "production" | "ci";
}

export interface ComponentExecutionResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    fatal: boolean;
  };
  durationMs: number;
  metadata: ComponentMetadata;
}

export interface BaseAgentComponent<TInput, TOutput> {
  readonly metadata: ComponentMetadata;
  execute(input: TInput, context?: Partial<ExecutionContext>): Promise<ComponentExecutionResult<TOutput>>;
}
