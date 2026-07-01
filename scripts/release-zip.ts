import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import { join, relative, resolve } from "node:path";
import { deflateRawSync } from "node:zlib";

const root = process.cwd();
const distDir = join(root, "dist");
const archivePath = resolve(root, "dist-yandex.zip");
const utf8FileNameFlag = 0x0800;
const dosEpochDate = 0x0021;
const dosEpochTime = 0x0000;

type ZipEntry = {
  compressed: Buffer;
  crc32: number;
  dataSize: number;
  method: number;
  name: string;
  nameBuffer: Buffer;
  offset: number;
};

function buildCrc32Table() {
  const table: number[] = [];

  for (let index = 0; index < 256; index += 1) {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value =
        value & 1 ? (0xedb88320 ^ (value >>> 1)) >>> 0 : value >>> 1;
    }

    table[index] = value >>> 0;
  }

  return table;
}

const crc32Table = buildCrc32Table();

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc = (crc >>> 8) ^ crc32Table[(crc ^ byte) & 0xff];
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value: number) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function u32(value: number) {
  if (value > 0xffffffff) {
    throw new Error("ZIP64 archives are not supported by release:zip");
  }

  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value);
  return buffer;
}

function shouldExclude(entry: string) {
  const parts = entry.split("/");
  const fileName = parts.at(-1) ?? "";

  return (
    fileName === ".DS_Store" ||
    parts.includes("__MACOSX") ||
    parts.some((part) => part.startsWith("._")) ||
    entry.endsWith(".map") ||
    parts.includes(".git") ||
    parts.includes("node_modules")
  );
}

function collectFiles(dir: string) {
  const files: string[] = [];

  for (const name of readdirSync(dir).sort()) {
    const filePath = join(dir, name);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      files.push(...collectFiles(filePath));
    } else if (stats.isFile()) {
      const entry = relative(distDir, filePath).replace(/\\/g, "/");

      if (!shouldExclude(entry)) {
        files.push(filePath);
      }
    }
  }

  return files;
}

function createEntry(filePath: string, offset: number): ZipEntry {
  const data = readFileSync(filePath);
  const deflated = deflateRawSync(data, { level: 9 });
  const useDeflated = deflated.length < data.length;
  const name = relative(distDir, filePath).replace(/\\/g, "/");

  return {
    compressed: useDeflated ? deflated : data,
    crc32: crc32(data),
    dataSize: data.length,
    method: useDeflated ? 8 : 0,
    name,
    nameBuffer: Buffer.from(name),
    offset
  };
}

function createLocalHeader(entry: ZipEntry) {
  return Buffer.concat([
    u32(0x04034b50),
    u16(entry.method === 8 ? 20 : 10),
    u16(utf8FileNameFlag),
    u16(entry.method),
    u16(dosEpochTime),
    u16(dosEpochDate),
    u32(entry.crc32),
    u32(entry.compressed.length),
    u32(entry.dataSize),
    u16(entry.nameBuffer.length),
    u16(0),
    entry.nameBuffer
  ]);
}

function createCentralDirectoryHeader(entry: ZipEntry) {
  return Buffer.concat([
    u32(0x02014b50),
    u16(20),
    u16(entry.method === 8 ? 20 : 10),
    u16(utf8FileNameFlag),
    u16(entry.method),
    u16(dosEpochTime),
    u16(dosEpochDate),
    u32(entry.crc32),
    u32(entry.compressed.length),
    u32(entry.dataSize),
    u16(entry.nameBuffer.length),
    u16(0),
    u16(0),
    u16(0),
    u16(0),
    u32(0),
    u32(entry.offset),
    entry.nameBuffer
  ]);
}

function createEndOfCentralDirectory(
  entryCount: number,
  centralDirectorySize: number,
  centralDirectoryOffset: number
) {
  if (entryCount > 0xffff) {
    throw new Error("ZIP64 archives are not supported by release:zip");
  }

  return Buffer.concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(entryCount),
    u16(entryCount),
    u32(centralDirectorySize),
    u32(centralDirectoryOffset),
    u16(0)
  ]);
}

function writeZip() {
  const chunks: Buffer[] = [];
  const entries: ZipEntry[] = [];
  let offset = 0;

  for (const filePath of collectFiles(distDir)) {
    const entry = createEntry(filePath, offset);
    const localHeader = createLocalHeader(entry);

    entries.push(entry);
    chunks.push(localHeader, entry.compressed);
    offset += localHeader.length + entry.compressed.length;
  }

  const centralDirectoryOffset = offset;
  const centralDirectory = entries.map(createCentralDirectoryHeader);
  const centralDirectorySize = centralDirectory.reduce(
    (size, header) => size + header.length,
    0
  );

  chunks.push(
    ...centralDirectory,
    createEndOfCentralDirectory(
      entries.length,
      centralDirectorySize,
      centralDirectoryOffset
    )
  );

  writeFileSync(archivePath, Buffer.concat(chunks));
  return entries.map((entry) => entry.name);
}

if (!existsSync(join(distDir, "index.html"))) {
  throw new Error("dist/index.html is missing. Run pnpm build before pnpm release:zip.");
}

if (existsSync(archivePath)) {
  rmSync(archivePath);
}

const entries = writeZip();

const forbidden = entries.filter(
  (entry) =>
    entry === "dist/" ||
    entry.startsWith("dist/") ||
    entry.includes("__MACOSX") ||
    entry.endsWith(".DS_Store") ||
    entry.split("/").some((part) => part.startsWith("._")) ||
    entry.endsWith(".map")
);

if (!entries.includes("index.html")) {
  throw new Error("index.html is not at the ZIP root");
}

if (forbidden.length > 0) {
  throw new Error(`ZIP contains forbidden entries:\n${forbidden.join("\n")}`);
}

console.log(`Created ${archivePath}`);
console.log(`ZIP entries: ${entries.length}`);
