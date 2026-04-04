export type PropType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'object'
  | 'array'
  | 'any';

export interface PropSchema {
  name: string;
  type: PropType;
  description?: string;
  required: boolean;
  defaultValue?: unknown;
  options?: string[];
}

export interface SkippedProp {
  name: string;
  reason: string;
}

export interface ComponentExample {
  name: string;
  props: Record<string, any>;
}

export interface ComponentSchema {
  name: string;
  description?: string;
  props: PropSchema[];
  skippedProps?: SkippedProp[];
  examples?: ComponentExample[];
}

export interface GeneratedSchemas {
  componentName: string;
  description?: string;
  zodSchema: string;
  pydanticModel: string;
  timestamp: number;
  examples?: ComponentExample[];
}

export interface ExportConfig {
  outputDir: {
    typescript: string;
    python: string;
  };
  includeVercelAISDK: boolean;
  includeTamboRegistration: boolean;
  generateIndex: boolean;
  fileHeader: string;
}

export interface CliConfig {
  stories: string[];
  output: {
    typescript: string;
    python: string;
  };
  includeVercelAISDK: boolean;
  includeTamboRegistration: boolean;
  generateIndex: boolean;
  fileHeader: string;
  exclude: string[];
  maxExamplesPerComponent: number;
}
