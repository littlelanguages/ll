import { writeAll } from "https://deno.land/std@0.181.0/streams/write_all.ts";

const writeFile = async (path: string, lines: string[]) => {
  const file = await Deno.create(path);
  await writeAll(file, new TextEncoder().encode(lines.join("\n")));
  file.close();

  await Deno.chmod(path, 0o755);
};

const homeDir = `${
  Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "."
}/.ll`;

console.log(`Creating home directory: ${homeDir}`);
await Deno.mkdir(homeDir, { recursive: true });

console.log(`Creating bin and libs directories`);
await Deno.mkdir(`${homeDir}/bin`, { recursive: true });
await Deno.mkdir(`${homeDir}/libs`, { recursive: true });

console.log(`Creating ${homeDir}/bin/ll`);
await writeFile(`${homeDir}/bin/ll`, [
  "#!/bin/bash",
  "",
  "deno run --allow-all --reload https://raw.githubusercontent.com/littlelanguages/ll/main/setup.ts $*",
  "",
]);

console.log(`Creating ${homeDir}/bin/ll-tlca`);
await writeFile(`${homeDir}/bin/ll-tlca`, [
  "#!/bin/bash",
  "",
  "deno run --allow-all https://raw.githubusercontent.com/littlelanguages/ll/v1.0.0/bin/tlca.ts $*",
  "",
]);

console.log(`Downloading ${homeDir}/bin/ll-tlca assets`);
await Deno.run({ cmd: [`${homeDir}/bin/ll-tlca`, "setup"] }).status();
