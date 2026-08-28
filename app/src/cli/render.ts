/**
 * Render CLI.
 *
 * Usage:
 *   node --import tsx/esm src/cli/render.ts --business <file> --out <dir> [--id <uuid>] [--theme-override <json>]
 *
 * Loads a Business JSON, composes a WebsiteSpec, validates it, renders the
 * site, and writes:
 *   <out>/index.html
 *   <out>/styles.css
 *   <out>/structured-data.json
 *
 * This is the live-preview path for Milestone 1.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";
import { parseBusiness } from "../business/business-schema.js";
import { composeWebsiteSpec } from "../profiles/category-profiles.js";
import { renderWebsite } from "../renderer/render.js";

interface CliArgs {
  business: string;
  out: string;
  id: string | undefined;
  themeOverride: string | undefined;
  seoOverride: string | undefined;
  help: boolean | undefined;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { business: "", out: "", id: undefined, themeOverride: undefined, seoOverride: undefined, help: undefined };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--business" || a === "-b") {
      const v = argv[++i];
      args.business = v ?? "";
    } else if (a === "--out" || a === "-o") {
      const v = argv[++i];
      args.out = v ?? "";
    } else if (a === "--id") {
      args.id = argv[++i];
    } else if (a === "--theme-override") {
      args.themeOverride = argv[++i];
    } else if (a === "--seo-override") {
      args.seoOverride = argv[++i];
    } else if (a === "--help" || a === "-h") {
      args.help = true;
    }
  }
  return args;
}

function printHelp(): void {
  console.log(
    `Usage: render --business <file> --out <dir> [--id <uuid>] [--theme-override <json>] [--seo-override <json>]

Options:
  -b, --business <path>      Path to business JSON file
  -o, --out <path>           Output directory
      --id <uuid>            Optional business id to embed in spec
      --theme-override <json> JSON to override theme fields
      --seo-override <json>   JSON to override SEO fields
  -h, --help                  Show this help

Example:
  render --business ../samples/restaurant.json --out ../../dist/restaurant
`,
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.business || !args.out) {
    printHelp();
    if (!args.help) {
      console.error("error: --business and --out are required");
      process.exit(1);
    }
    return;
  }

  const businessPath = isAbsolute(args.business)
    ? args.business
    : resolve(process.cwd(), args.business);
  const outPath = isAbsolute(args.out) ? args.out : resolve(process.cwd(), args.out);

  const raw = await readFile(businessPath, "utf8");
  const businessRaw = JSON.parse(raw);
  const business = parseBusiness(businessRaw);

  const themeOverride = args.themeOverride ? JSON.parse(args.themeOverride) : undefined;
  const seoOverride = args.seoOverride ? JSON.parse(args.seoOverride) : undefined;

  const spec = composeWebsiteSpec(business, {
    businessId: args.id,
    themeOverride,
    seoOverride,
  });

  const rendered = renderWebsite(spec, business);

  await mkdir(outPath, { recursive: true });
  await writeFile(resolve(outPath, "index.html"), rendered.html, "utf8");
  await writeFile(resolve(outPath, "styles.css"), rendered.css, "utf8");
  await writeFile(
    resolve(outPath, "structured-data.json"),
    rendered.structuredData,
    "utf8",
  );

  // Also write the composed spec for inspection / future editor UI.
  await writeFile(
    resolve(outPath, "spec.json"),
    JSON.stringify(spec, null, 2),
    "utf8",
  );

  const fileUrl = pathToFileUrl(resolve(outPath, "index.html"));
  console.log(`Rendered: ${business.identity.name} (${business.category})`);
  console.log(`  ${outPath}`);
  console.log(`  Open:  ${fileUrl}`);
}

function pathToFileUrl(p: string): string {
  return pathToFileURL(p).toString();
}

main().catch((err) => {
  console.error("render failed:", err);
  if (err && typeof err === "object" && "issues" in err) {
    console.error(JSON.stringify((err as { issues: unknown }).issues, null, 2));
  }
  process.exit(1);
});
