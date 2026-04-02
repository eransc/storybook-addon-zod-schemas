import React, { useMemo, useState } from 'react';
import { useStorybookApi } from '@storybook/manager-api';
import { TabsState, Placeholder } from '@storybook/components';
import { parseArgTypes } from '../../generators/argTypesParser';
import { generateZodSchema } from '../../generators/zodGenerator';
import { generatePydanticModel } from '../../generators/pydanticGenerator';
import { SchemaDisplay } from './SchemaDisplay';

export const Panel: React.FC = () => {
  const api = useStorybookApi();
  const storyData = api.getCurrentStoryData();

  const schemas = useMemo(() => {
    if (!storyData || storyData.type !== 'story') {
      return null;
    }

    const argTypes = (storyData as any).argTypes;
    if (!argTypes || Object.keys(argTypes).length === 0) {
      return null;
    }

    // Extract component name from the story title (last segment)
    const titleParts = storyData.title.split('/');
    const componentName = titleParts[titleParts.length - 1].replace(/\s/g, '');

    const componentSchema = parseArgTypes(componentName, argTypes);
    const zodSchema = generateZodSchema(componentSchema);
    const pydanticModel = generatePydanticModel(componentSchema);

    return { componentName, zodSchema, pydanticModel };
  }, [storyData?.id, (storyData as any)?.argTypes]);

  if (!schemas) {
    return (
      <Placeholder>
        <p>No ArgTypes found for this story.</p>
        <p>Add argTypes to your story meta to generate schemas.</p>
      </Placeholder>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600 }}>
        Component: {schemas.componentName}
      </h3>

      <TabsState initial="zod">
        <div id="zod" title="TypeScript (Zod)">
          <SchemaDisplay
            code={schemas.zodSchema}
            language="typescript"
            filename={`${schemas.componentName}.ts`}
          />
        </div>
        <div id="pydantic" title="Python (Pydantic)">
          <SchemaDisplay
            code={schemas.pydanticModel}
            language="python"
            filename={`${schemas.componentName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()}.py`}
          />
        </div>
      </TabsState>
    </div>
  );
};
