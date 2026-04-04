import type { ComponentSchema } from '../types.js';

const SYSTEM_PROMPT = `You generate concise prop descriptions for UI component schemas. These descriptions will be consumed by an LLM to generate correct component props.

Rules:
- Each description should be 1 sentence, max 15 words
- Be specific about what the prop controls
- Mention valid values or units when relevant
- Do not repeat the prop name in the description
- Return valid JSON only`;

function buildPrompt(schemas: ComponentSchema[]): string {
  const components = schemas.map((schema) => {
    const props = schema.props
      .filter((p) => !p.description)
      .map((p) => {
        const parts = [`name: ${p.name}`, `type: ${p.type}`];
        if (p.options) parts.push(`options: ${p.options.join(', ')}`);
        if (p.defaultValue !== undefined) parts.push(`default: ${p.defaultValue}`);
        return `    { ${parts.join(', ')} }`;
      });
    return `  ${schema.name}:\n${props.join('\n')}`;
  });

  return `Generate short descriptions for these UI component props that are missing descriptions.

${components.join('\n\n')}

Return a JSON object mapping component names to prop descriptions:
{"ComponentName": {"propName": "description", ...}, ...}`;
}

export async function enrichBatch(
  schemas: ComponentSchema[],
): Promise<ComponentSchema[]> {
  // Collect schemas that have props needing descriptions
  const needsEnrichment = schemas.filter(
    (s) => s.props.some((p) => !p.description),
  );

  if (needsEnrichment.length === 0) {
    return schemas;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('\n  ⚠ ANTHROPIC_API_KEY not set — skipping enrichment\n');
    return schemas;
  }

  let Anthropic: any;
  try {
    const mod = await import('@anthropic-ai/sdk');
    Anthropic = mod.default || mod.Anthropic;
  } catch {
    throw new Error(
      'The --enrich flag requires @anthropic-ai/sdk. Install it with: npm install @anthropic-ai/sdk',
    );
  }

  const client = new Anthropic({ apiKey });

  // Process in batches of 10
  const BATCH_SIZE = 10;
  const enrichedMap = new Map<string, Record<string, string>>();

  for (let i = 0; i < needsEnrichment.length; i += BATCH_SIZE) {
    const batch = needsEnrichment.slice(i, i + BATCH_SIZE);
    const prompt = buildPrompt(batch);

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = response.content
        .filter((block: any) => block.type === 'text')
        .map((block: any) => block.text)
        .join('');

      // Extract JSON from response (may be wrapped in markdown code block)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        for (const [componentName, props] of Object.entries(parsed)) {
          enrichedMap.set(componentName, props as Record<string, string>);
        }
      }
    } catch (err) {
      console.warn(`\n  ⚠ LLM enrichment failed for batch ${Math.floor(i / BATCH_SIZE) + 1}: ${(err as Error).message}`);
    }
  }

  // Merge descriptions back into schemas
  return schemas.map((schema) => {
    const descriptions = enrichedMap.get(schema.name);
    if (!descriptions) return schema;

    return {
      ...schema,
      props: schema.props.map((prop) => {
        if (!prop.description && descriptions[prop.name]) {
          return { ...prop, description: descriptions[prop.name] };
        }
        return prop;
      }),
    };
  });
}
