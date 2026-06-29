import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import ts from "typescript";

type ChapterId = "northern-route" | "sand-meridian" | "emerald-meridian";

type HitShape =
  | { kind: "circle"; cx: number; cy: number; radius: number }
  | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number }
  | { kind: "polygon"; points: Array<{ x: number; y: number }> };

type DifferenceDefinition = {
  id: string;
  hitAreaA: HitShape;
  hitAreaB: HitShape;
  hintArea: HitShape;
  difficulty: 1 | 2 | 3;
};

export type HitboxSourceWriteRequest = {
  levelId: string;
  chapterId: ChapterId;
  order: number;
  differences: DifferenceDefinition[];
};

export type HitboxSourceWriteResult = {
  file: string;
  levelId: string;
  differenceCount: number;
};

type Replacement = {
  start: number;
  end: number;
  text: string;
};

export async function writeHitboxesToSource(
  root: string,
  request: HitboxSourceWriteRequest
): Promise<HitboxSourceWriteResult> {
  validateRequest(request);

  if (request.chapterId === "northern-route") {
    return replaceNorthernDifferences(root, request);
  }
  if (request.chapterId === "sand-meridian") {
    return replaceSandMeridianSpecs(root, request);
  }
  return replaceEmeraldMeridianSpecs(root, request);
}

async function replaceNorthernDifferences(root: string, request: HitboxSourceWriteRequest) {
  const file = "src/content/levels.ts";
  const filePath = join(root, file);
  const source = await readFile(filePath, "utf8");
  const sourceFile = createSourceFile(filePath, source);
  const levelObject = findObjectLiteral(sourceFile, (node) => getStringProperty(node, "id") === request.levelId);
  if (!levelObject) throw new Error(`Could not find level ${request.levelId} in ${file}`);

  const differences = getPropertyInitializer(levelObject, "differences");
  if (!differences || !ts.isArrayLiteralExpression(differences)) {
    throw new Error(`Could not find differences array for ${request.levelId} in ${file}`);
  }

  await writeReplacement(filePath, source, {
    start: differences.getStart(sourceFile),
    end: differences.getEnd(),
    text: formatDifferencesArray(request.differences, 4)
  });

  return { file, levelId: request.levelId, differenceCount: request.differences.length };
}

async function replaceSandMeridianSpecs(root: string, request: HitboxSourceWriteRequest) {
  const file = "src/content/sandMeridianLevels.ts";
  const filePath = join(root, file);
  const source = await readFile(filePath, "utf8");
  const sourceFile = createSourceFile(filePath, source);
  const overrides = findVariableObject(sourceFile, "sandMeridianDifferenceOverrides");
  if (!overrides) throw new Error(`Could not find sandMeridianDifferenceOverrides in ${file}`);

  const property = getObjectProperty(overrides, String(request.order));
  if (!property || !property.initializer || !ts.isArrayLiteralExpression(property.initializer)) {
    throw new Error(`Could not find Sand Meridian level ${request.order} differences in ${file}`);
  }

  await writeReplacement(filePath, source, {
    start: property.initializer.getStart(sourceFile),
    end: property.initializer.getEnd(),
    text: formatSandSpecsArray(request.differences, request.order, 4)
  });

  return { file, levelId: request.levelId, differenceCount: request.differences.length };
}

async function replaceEmeraldMeridianSpecs(root: string, request: HitboxSourceWriteRequest) {
  const file = "src/content/emeraldMeridianLevels.ts";
  const filePath = join(root, file);
  const source = await readFile(filePath, "utf8");
  const sourceFile = createSourceFile(filePath, source);
  const perLevelDiffs = findVariableArray(sourceFile, "perLevelDiffs");
  if (!perLevelDiffs) throw new Error(`Could not find perLevelDiffs in ${file}`);

  const levelArray = perLevelDiffs.elements[request.order - 1];
  if (!levelArray || !ts.isArrayLiteralExpression(levelArray)) {
    throw new Error(`Could not find Emerald Meridian level ${request.order} differences in ${file}`);
  }

  await writeReplacement(filePath, source, {
    start: levelArray.getStart(sourceFile),
    end: levelArray.getEnd(),
    text: formatEmeraldSpecsArray(request.differences, 4)
  });

  return { file, levelId: request.levelId, differenceCount: request.differences.length };
}

function validateRequest(request: HitboxSourceWriteRequest) {
  if (!request.levelId || typeof request.levelId !== "string") throw new Error("levelId is required");
  if (!["northern-route", "sand-meridian", "emerald-meridian"].includes(request.chapterId)) {
    throw new Error("chapterId is invalid");
  }
  if (!Number.isInteger(request.order) || request.order < 1 || request.order > 13) {
    throw new Error("order must be an integer from 1 to 13");
  }
  if (!Array.isArray(request.differences) || request.differences.length < 1) {
    throw new Error("differences must be a non-empty array");
  }
}

function createSourceFile(filePath: string, source: string) {
  return ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function findObjectLiteral(
  sourceFile: ts.SourceFile,
  predicate: (node: ts.ObjectLiteralExpression) => boolean
) {
  let match: ts.ObjectLiteralExpression | undefined;

  function visit(node: ts.Node) {
    if (match) return;
    if (ts.isObjectLiteralExpression(node) && predicate(node)) {
      match = node;
      return;
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return match;
}

function findVariableObject(sourceFile: ts.SourceFile, name: string) {
  const initializer = findVariableInitializer(sourceFile, name);
  if (!initializer) return undefined;
  if (ts.isObjectLiteralExpression(initializer)) return initializer;
  if (ts.isAsExpression(initializer) && ts.isObjectLiteralExpression(initializer.expression)) return initializer.expression;
  return undefined;
}

function findVariableArray(sourceFile: ts.SourceFile, name: string) {
  const initializer = findVariableInitializer(sourceFile, name);
  if (!initializer) return undefined;
  if (ts.isArrayLiteralExpression(initializer)) return initializer;
  if (ts.isAsExpression(initializer) && ts.isArrayLiteralExpression(initializer.expression)) return initializer.expression;
  return undefined;
}

function findVariableInitializer(sourceFile: ts.SourceFile, name: string) {
  let match: ts.Expression | undefined;

  function visit(node: ts.Node) {
    if (match) return;
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name) {
      match = node.initializer;
      return;
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return match;
}

function getObjectProperty(node: ts.ObjectLiteralExpression, name: string) {
  return node.properties.find((property): property is ts.PropertyAssignment => {
    if (!ts.isPropertyAssignment(property)) return false;
    const propertyName = property.name;
    if (ts.isIdentifier(propertyName) || ts.isStringLiteral(propertyName) || ts.isNumericLiteral(propertyName)) {
      return propertyName.text === name;
    }
    return false;
  });
}

function getPropertyInitializer(node: ts.ObjectLiteralExpression, name: string) {
  return getObjectProperty(node, name)?.initializer;
}

function getStringProperty(node: ts.ObjectLiteralExpression, name: string) {
  const initializer = getPropertyInitializer(node, name);
  return initializer && ts.isStringLiteral(initializer) ? initializer.text : undefined;
}

async function writeReplacement(filePath: string, source: string, replacement: Replacement) {
  const nextSource = source.slice(0, replacement.start) + replacement.text + source.slice(replacement.end);
  await writeFile(filePath, nextSource, "utf8");
}

function formatDifferencesArray(differences: DifferenceDefinition[], indent: number) {
  const pad = " ".repeat(indent);
  const itemPad = " ".repeat(indent + 2);
  const fieldsPad = " ".repeat(indent + 4);
  const items = differences.map((difference) => {
    return [
      `${itemPad}{`,
      `${fieldsPad}id: ${quote(difference.id)},`,
      `${fieldsPad}hitAreaA: ${formatShape(difference.hitAreaA)},`,
      `${fieldsPad}hitAreaB: ${formatShape(difference.hitAreaB)},`,
      `${fieldsPad}hintArea: ${formatShape(difference.hintArea)},`,
      `${fieldsPad}difficulty: ${difference.difficulty},`,
      `${itemPad}}`
    ].join("\n");
  });
  return `[\n${items.join(",\n")}\n${pad}]`;
}

function formatSandSpecsArray(differences: DifferenceDefinition[], order: number, indent: number) {
  const pad = " ".repeat(indent);
  const itemPad = " ".repeat(indent + 2);
  const items = differences.map((difference) => {
    const shape = shapeForCompactSpec(difference, 0.05, 0.05);
    const id = difference.id.endsWith(`-${order}`) ? difference.id.slice(0, -String(order).length - 1) : difference.id;
    if (shape.kind === "circle") {
      return `${itemPad}{ id: ${quote(id)}, x: ${numberLiteral(shape.cx)}, y: ${numberLiteral(shape.cy)}, radius: ${numberLiteral(shape.radius)} }`;
    }
    if (shape.kind === "ellipse") {
      return `${itemPad}{ id: ${quote(id)}, shape: ${formatSandShape(shape)} }`;
    }
    throw new Error("Sand Meridian compact specs do not support polygon hitboxes");
  });
  return `[\n${items.join(",\n")}\n${pad}]`;
}

function formatEmeraldSpecsArray(differences: DifferenceDefinition[], indent: number) {
  const pad = " ".repeat(indent);
  const itemPad = " ".repeat(indent + 2);
  const items = differences.map((difference) => {
    return `${itemPad}{ id: ${quote(difference.id)}, shape: ${formatEmeraldShape(shapeForCompactSpec(difference, 0.04, 0.035))} }`;
  });
  return `[\n${items.join(",\n")}\n${pad}]`;
}

function shapeForCompactSpec(difference: DifferenceDefinition, circleMargin: number, ellipseMargin: number): HitShape {
  const shape = difference.hintArea;
  if (shape.kind === "circle") {
    return { ...shape, radius: Math.max(0.005, shape.radius - circleMargin) };
  }
  if (shape.kind === "ellipse") {
    return {
      ...shape,
      rx: Math.max(0.005, shape.rx - ellipseMargin),
      ry: Math.max(0.005, shape.ry - ellipseMargin)
    };
  }
  return shape;
}

function formatSandShape(shape: Exclude<HitShape, { kind: "polygon" }>) {
  if (shape.kind === "circle") {
    return `{ kind: "circle", cx: ${numberLiteral(shape.cx)}, cy: ${numberLiteral(shape.cy)}, r: ${numberLiteral(shape.radius)} }`;
  }
  return `{ kind: "ellipse", cx: ${numberLiteral(shape.cx)}, cy: ${numberLiteral(shape.cy)}, rx: ${numberLiteral(shape.rx)}, ry: ${numberLiteral(shape.ry)} }`;
}

function formatEmeraldShape(shape: HitShape) {
  if (shape.kind === "circle") {
    return `{ kind: "circle", cx: ${numberLiteral(shape.cx)}, cy: ${numberLiteral(shape.cy)}, r: ${numberLiteral(shape.radius)} }`;
  }
  if (shape.kind === "ellipse") {
    return `{ kind: "ellipse", cx: ${numberLiteral(shape.cx)}, cy: ${numberLiteral(shape.cy)}, rx: ${numberLiteral(shape.rx)}, ry: ${numberLiteral(shape.ry)} }`;
  }
  throw new Error("Emerald Meridian compact specs do not support polygon hitboxes");
}

function formatShape(shape: HitShape): string {
  if (shape.kind === "circle") {
    return `{ kind: "circle", cx: ${numberLiteral(shape.cx)}, cy: ${numberLiteral(shape.cy)}, radius: ${numberLiteral(shape.radius)} }`;
  }
  if (shape.kind === "ellipse") {
    return `{ kind: "ellipse", cx: ${numberLiteral(shape.cx)}, cy: ${numberLiteral(shape.cy)}, rx: ${numberLiteral(shape.rx)}, ry: ${numberLiteral(shape.ry)} }`;
  }
  return `{ kind: "polygon", points: [${shape.points
    .map((point) => `{ x: ${numberLiteral(point.x)}, y: ${numberLiteral(point.y)} }`)
    .join(", ")}] }`;
}

function numberLiteral(value: number) {
  return Number(value.toFixed(4)).toString();
}

function quote(value: string) {
  return JSON.stringify(value);
}
