import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import * as t from '@babel/types';
import { basename } from 'node:path';

// Handle ESM/CJS interop for @babel/traverse
const traverse = (typeof _traverse === 'function' ? _traverse : (_traverse as any).default) as typeof _traverse;

interface ExtractedArgTypes {
  componentName: string;
  argTypes: Record<string, any>;
  description?: string;
}

/**
 * Sanitize a filename into a valid PascalCase identifier.
 * e.g. "carbon-Button" → "CarbonButton"
 */
function sanitizeComponentName(fileName: string): string {
  return fileName
    .replace(/\.stories\.(tsx?|jsx?|mdx)$/, '')
    .replace(/(^|[-_])(\w)/g, (_m, _sep, c) => c.toUpperCase());
}

/**
 * Evaluate a static AST node into a JS value.
 * Handles strings, numbers, booleans, arrays, objects, null, undefined.
 */
function evaluateNode(node: t.Node): any {
  if (t.isStringLiteral(node)) return node.value;
  if (t.isNumericLiteral(node)) return node.value;
  if (t.isBooleanLiteral(node)) return node.value;
  if (t.isNullLiteral(node)) return null;
  if (t.isIdentifier(node) && node.name === 'undefined') return undefined;
  if (t.isTemplateLiteral(node) && node.expressions.length === 0) {
    return node.quasis[0]?.value.cooked ?? node.quasis[0]?.value.raw;
  }

  if (t.isArrayExpression(node)) {
    return node.elements
      .filter((el): el is t.Expression => el !== null && !t.isSpreadElement(el))
      .map(evaluateNode);
  }

  if (t.isObjectExpression(node)) {
    const obj: Record<string, any> = {};
    for (const prop of node.properties) {
      if (t.isObjectProperty(prop)) {
        const key = t.isIdentifier(prop.key)
          ? prop.key.name
          : t.isStringLiteral(prop.key)
            ? prop.key.value
            : null;
        if (key && t.isExpression(prop.value)) {
          obj[key] = evaluateNode(prop.value);
        }
      }
    }
    return obj;
  }

  // Can't evaluate — return undefined
  return undefined;
}

/**
 * Resolve a variable binding in the file scope.
 * Looks for `const varName = { ... }` or `const varName = expr`.
 */
function resolveBinding(
  ast: t.File,
  varName: string,
): t.Expression | null {
  let resolved: t.Expression | null = null;

  traverse(ast, {
    VariableDeclarator(path) {
      if (
        t.isIdentifier(path.node.id) &&
        path.node.id.name === varName &&
        path.node.init
      ) {
        resolved = path.node.init as t.Expression;
        path.stop();
      }
    },
  });

  return resolved;
}

/**
 * Extract argTypes from an ObjectExpression AST node.
 * Recursively resolves variable references in the same file.
 */
function extractArgTypesFromObject(
  node: t.ObjectExpression,
  ast: t.File,
): Record<string, any> {
  const argTypes: Record<string, any> = {};

  for (const prop of node.properties) {
    // Handle spread: ...sharedArgTypes
    if (t.isSpreadElement(prop)) {
      if (t.isIdentifier(prop.argument)) {
        const resolved = resolveBinding(ast, prop.argument.name);
        if (resolved && t.isObjectExpression(resolved)) {
          Object.assign(argTypes, extractArgTypesFromObject(resolved, ast));
        }
      }
      continue;
    }

    if (!t.isObjectProperty(prop)) continue;

    const key = t.isIdentifier(prop.key)
      ? prop.key.name
      : t.isStringLiteral(prop.key)
        ? prop.key.value
        : null;

    if (!key) continue;

    if (t.isObjectExpression(prop.value)) {
      argTypes[key] = evaluateNode(prop.value);
    } else if (t.isIdentifier(prop.value)) {
      // Could be a variable reference for the prop config
      const resolved = resolveBinding(ast, prop.value.name);
      if (resolved) {
        argTypes[key] = evaluateNode(resolved);
      }
    }
  }

  return argTypes;
}

/**
 * Find the argTypes object from the default export meta or from story-level assignments.
 */
function findArgTypesInAST(ast: t.File): t.ObjectExpression | null {
  let argTypesNode: t.ObjectExpression | null = null;

  traverse(ast, {
    // Handle: export default { argTypes: { ... } }
    ExportDefaultDeclaration(path) {
      const decl = path.node.declaration;
      let metaObj: t.ObjectExpression | null = null;

      if (t.isObjectExpression(decl)) {
        metaObj = decl;
      } else if (t.isIdentifier(decl)) {
        const resolved = resolveBinding(ast, decl.name);
        if (resolved && t.isObjectExpression(resolved)) {
          metaObj = resolved;
        }
      }

      if (!metaObj) return;

      for (const prop of metaObj.properties) {
        if (
          t.isObjectProperty(prop) &&
          t.isIdentifier(prop.key) &&
          prop.key.name === 'argTypes'
        ) {
          if (t.isObjectExpression(prop.value)) {
            argTypesNode = prop.value;
          } else if (t.isIdentifier(prop.value)) {
            // argTypes: sharedArgTypes → resolve the variable
            const resolved = resolveBinding(ast, prop.value.name);
            if (resolved && t.isObjectExpression(resolved)) {
              argTypesNode = resolved;
            }
          }
          path.stop();
          return;
        }
      }
    },

    // Handle: Story.argTypes = { ... }
    AssignmentExpression(path) {
      if (argTypesNode) return; // Already found one

      const left = path.node.left;
      if (
        t.isMemberExpression(left) &&
        t.isIdentifier(left.property) &&
        left.property.name === 'argTypes' &&
        t.isObjectExpression(path.node.right)
      ) {
        argTypesNode = path.node.right;
      }
    },
  });

  return argTypesNode;
}

/**
 * Extract component name from meta's title field.
 * e.g. title: 'Components/Button' → 'Button'
 */
function findTitleInAST(ast: t.File): string | null {
  let title: string | null = null;

  traverse(ast, {
    ExportDefaultDeclaration(path) {
      const decl = path.node.declaration;
      let metaObj: t.ObjectExpression | null = null;

      if (t.isObjectExpression(decl)) {
        metaObj = decl;
      } else if (t.isIdentifier(decl)) {
        const resolved = resolveBinding(ast, decl.name);
        if (resolved && t.isObjectExpression(resolved)) {
          metaObj = resolved;
        }
      }

      if (!metaObj) return;

      for (const prop of metaObj.properties) {
        if (
          t.isObjectProperty(prop) &&
          t.isIdentifier(prop.key) &&
          prop.key.name === 'title' &&
          t.isStringLiteral(prop.value)
        ) {
          title = prop.value.value;
          path.stop();
          return;
        }
      }
    },
  });

  return title;
}

/**
 * Parse a story file and extract argTypes using Babel AST.
 */
export function extractArgTypesAST(
  source: string,
  filePath: string,
): ExtractedArgTypes | null {
  const fileName = basename(filePath);

  let ast: t.File;
  try {
    ast = parse(source, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators'],
      errorRecovery: true,
    });
  } catch {
    return null;
  }

  // Find argTypes node in the AST
  const argTypesNode = findArgTypesInAST(ast);
  if (!argTypesNode) {
    return null;
  }

  // Extract the argTypes with variable resolution
  const argTypes = extractArgTypesFromObject(argTypesNode, ast);
  if (Object.keys(argTypes).length === 0) {
    return null;
  }

  // Determine component name: prefer meta title, fallback to filename
  const title = findTitleInAST(ast);
  let componentName: string;
  if (title) {
    const parts = title.split('/');
    componentName = parts[parts.length - 1].replace(/\s/g, '');
  } else {
    componentName = sanitizeComponentName(fileName);
  }

  return {
    componentName,
    argTypes,
  };
}
