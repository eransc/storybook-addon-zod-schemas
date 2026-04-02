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

export interface ComponentSchema {
  name: string;
  description?: string;
  props: PropSchema[];
}

export interface GeneratedSchemas {
  componentName: string;
  description?: string;
  zodSchema: string;
  pydanticModel: string;
  timestamp: number;
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
}
