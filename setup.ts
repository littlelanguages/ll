const writeFile = async (path: string, lines: string[]) => {
    const file = await Deno.open(path, { create: true, write: true });
    await Deno.writeAll(file, new TextEncoder().encode(lines.join("\n")));
    file.close();

    await Deno.chmod(path, 0o755);
};

const homeDir = `${Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "."
    }/.ll`;

console.log(`Creating home directory: ${homeDir}`);
await Deno.mkdir(homeDir, { recursive: true });

console.log(`Creating bin and libs directories`);
await Deno.mkdir(`${homeDir}/bin`, { recursive: true });
await Deno.mkdir(`${homeDir}/libs`, { recursive: true });

console.log(`Creating ${homeDir}/bin/tlca`);
await writeFile(`${homeDir}/bin/tlca`, [
    "#!/bin/bash",
    "",
    'deno run --allow-allhttps://raw.githubusercontent.com/littlelanguages/ll/v1.0.0/bin/tlca.ts $*',
    ""
]);
