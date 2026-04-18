function collectStaticStrings(node, acc = []) {
  if (!node || typeof node !== "object") return acc;

  switch (node.type) {
    case "Literal":
      if (typeof node.value === "string") acc.push({ node, value: node.value });
      return acc;
    case "TemplateLiteral":
      acc.push({
        node,
        value: node.quasis.map((q) => q.value.cooked ?? "").join(" ${...} "),
      });
      return acc;
    case "ArrayExpression":
      node.elements.forEach((element) => collectStaticStrings(element, acc));
      return acc;
    case "ObjectExpression":
      node.properties.forEach((property) => {
        if (property && property.type === "Property") {
          collectStaticStrings(property.value, acc);
        }
      });
      return acc;
    case "ConditionalExpression":
      collectStaticStrings(node.consequent, acc);
      collectStaticStrings(node.alternate, acc);
      return acc;
    case "LogicalExpression":
      collectStaticStrings(node.left, acc);
      collectStaticStrings(node.right, acc);
      return acc;
    case "CallExpression":
      node.arguments.forEach((arg) => collectStaticStrings(arg, acc));
      return acc;
    case "SequenceExpression":
      node.expressions.forEach((expr) => collectStaticStrings(expr, acc));
      return acc;
    case "JSXExpressionContainer":
      collectStaticStrings(node.expression, acc);
      return acc;
    default:
      return acc;
  }
}

const RAW_COLOR_LITERAL =
  /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|(?:rgb|rgba|hsl|hsla|oklch|oklab|color-mix)\(/;

const TAILWIND_PALETTE_CLASS =
  /(?:^|\s)(?:bg|text|border|from|to|via|ring|stroke|fill|outline|decoration|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}(?:\/\d{1,3})?(?=\s|$)/;

const SURFACE_SHELL_PATTERN =
  /rounded-(?:lg|xl|2xl|3xl)/;

function looksLikeRawSurfaceShell(value) {
  return (
    SURFACE_SHELL_PATTERN.test(value) &&
    /\bborder\b/.test(value) &&
    /\b(?:bg-card|bg-muted|bg-background|bg-popover|bg-white)\b/.test(value) &&
    /\b(?:p-\d+|px-\d+|py-\d+)\b/.test(value)
  );
}

function isFeatureLocalFile(filename) {
  return (
    filename.includes("/src/app/") ||
    filename.includes("/src/components/notebook/") ||
    filename.includes("/src/components/landing/")
  );
}

const noHardcodedColorsRule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Audit hardcoded UI colors and explicit Tailwind palette classes in JSX UI code.",
    },
    schema: [],
    messages: {
      rawColor:
        "Avoid hardcoded color values in UI code. Prefer tokens from src/app/globals.css or semantic utility classes.",
      paletteClass:
        "Avoid explicit Tailwind palette colors in feature UI. Prefer semantic tokens, CSS variables, or shared pattern/component APIs.",
    },
  },
  create(context) {
    function inspectValue(node, value) {
      if (!value) return;

      if (RAW_COLOR_LITERAL.test(value)) {
        context.report({ node, messageId: "rawColor" });
      }

      if (TAILWIND_PALETTE_CLASS.test(value)) {
        context.report({ node, messageId: "paletteClass" });
      }
    }

    return {
      JSXAttribute(node) {
        if (node.name?.type !== "JSXIdentifier") return;

        if (node.name.name === "className" && node.value) {
          const values = collectStaticStrings(node.value, []);
          values.forEach(({ node: valueNode, value }) => inspectValue(valueNode, value));
        }

        if (
          node.name.name === "style" &&
          node.value?.type === "JSXExpressionContainer" &&
          node.value.expression?.type === "ObjectExpression"
        ) {
          const values = collectStaticStrings(node.value.expression, []);
          values.forEach(({ node: valueNode, value }) => inspectValue(valueNode, value));
        }
      },
    };
  },
};

const noRawSurfaceShellsRule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Audit repeated raw surface-shell className blocks that should likely become shared patterns/components.",
    },
    schema: [],
    messages: {
      surfaceShell:
        "This looks like a repeated surface/card shell. Prefer a shared pattern/component instead of copying utility structure.",
    },
  },
  create(context) {
    const filename = context.filename ?? "";
    if (!isFeatureLocalFile(filename)) {
      return {};
    }

    return {
      JSXAttribute(node) {
        if (node.name?.type !== "JSXIdentifier" || node.name.name !== "className" || !node.value) {
          return;
        }

        const values = collectStaticStrings(node.value, []);
        values.forEach(({ node: valueNode, value }) => {
          if (looksLikeRawSurfaceShell(value)) {
            context.report({ node: valueNode, messageId: "surfaceShell" });
          }
        });
      },
    };
  },
};

const uiAuditPlugin = {
  meta: {
    name: "ui-audit",
  },
  rules: {
    "no-hardcoded-colors": noHardcodedColorsRule,
    "no-raw-surface-shells": noRawSurfaceShellsRule,
  },
};

export default uiAuditPlugin;
