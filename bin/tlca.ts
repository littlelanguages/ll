import * as CLI from "https://raw.githubusercontent.com/littlelanguages/deno-lib-console-cli/0.1.2/mod.ts";
import { writeAll } from "https://deno.land/std@0.175.0/streams/write_all.ts";

const version = "v1.0.0";

// compile
// run -i (bci)
// dis (bci)
// asm (bci)
// setup

const panic = (msg: string) => {
  console.error(msg);
  Deno.exit(1);
};

const binaryName = () => {
  const arch = Deno.build.arch;
  const os = Deno.build.os;

  return `tlca-bci-c-${os}-${arch}`;
};

const jarName = () => "tlca.jar";

const downloadLatest = async (name: string) => {
  console.log(`Downloading ${name}...`);
  const artifact =
    await (await fetch(`https://lltlca.blob.core.windows.net/bin/${name}`))
      .arrayBuffer();
  const file = await Deno.open(libPath(name), { create: true, write: true });
  await writeAll(file, new Uint8Array(artifact));
  file.close();
};

const libPath = (name: string) =>
  `${
    Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "."
  }/.ll/libs/${name}`;

const denoName = (script: string) =>
  `https://raw.githubusercontent.com/littlelanguages/ll-tlca/${version}/components/${script}`;

const fileDateTime = async (name: string): Promise<number> => {
  try {
    const lstat = await Deno.lstat(name);
    return lstat?.mtime?.getTime() || 0;
  } catch (_) {
    return 0;
  }
};

const compile = async (file: string) => {
  const cmd: Array<string> = [
    "java",
    "-jar",
    libPath(jarName()),
    file,
    file.replace(".tlca", ".tlca.bin"),
  ];

  await Deno.run({ cmd }).status();
};

const compileCmd = new CLI.ValueCommand(
  "compile",
  "Compile a .tlca source file to a .tlca.bin bytecode file",
  [],
  {
    name: "FILE",
    optional: true,
    help:
      "Compiles FILE to a binary file which can be submitted to a bytecode interpreter",
  },
  async (
    _: CLI.Definition,
    file: string | undefined,
    _vals: Map<string, unknown>,
  ) => {
    if (file === undefined) {
      panic("Error: Source file has not been supplied");
      file = "fred"; // to stop the compiler complaining
    }
    if (!file.endsWith(".tlca")) {
      panic(`Error: Source file does not have a .tlca extension: ${file}`);
    }

    await compile(file);
  },
);

const disCmd = new CLI.ValueCommand(
  "dis",
  "Disassemble a compiled .tlca bytecode file",
  [
    new CLI.ValueOption(
      ["--implementation", "-i"],
      "The implementation to be used - options are deno, c for the Deno and C implementations respectively.  The default is Deno.",
    ),
  ],
  {
    name: "FILE",
    optional: true,
    help: "The bytecode file to disassemble",
  },
  async (
    _: CLI.Definition,
    file: string | undefined,
    vals: Map<string, unknown>,
  ) => {
    if (file === undefined) {
      panic("Error: No file has been supplied");
      file = "fred"; // to stop the compiler complaining
    }

    if (!file.endsWith(".tlca") && !file.endsWith(".tlca.bin")) {
      panic(
        `Error: Bytecode file does not end with a .tlca or .tlca.bin extension: ${file}`,
      );
    }

    const implementation = vals.get("implementation") || "deno";

    let cmd: Array<string> = [];
    if (implementation === "c") {
      cmd = [
        libPath(binaryName()),
        "dis",
      ];
    } else if (implementation === "deno") {
      cmd = [
        "deno",
        "run",
        "--allow-read",
        denoName("bci-deno/bci.ts"),
        "dis",
      ];
    } else {
      panic(`Error: Unknown implementation: ${implementation}`);
    }

    if (file !== undefined) {
      cmd.push(
        file.endsWith(".tlca") ? file.replace(".tlca", ".tlca.bin") : file,
      );
    }
    await Deno.run({ cmd }).status();
  },
);

const runCmd = new CLI.ValueCommand(
  "run",
  "Run a compiled .tlca bytecode file",
  [
    new CLI.ValueOption(
      ["--implementation", "-i"],
      "The implementation to be used - options are deno, c for the Deno and C implementations respectively.  The default is C.",
    ),
  ],
  {
    name: "FILE",
    optional: true,
    help: "The bytecode file to run",
  },
  async (
    _: CLI.Definition,
    file: string | undefined,
    vals: Map<string, unknown>,
  ) => {
    if (file === undefined) {
      panic("Error: No file has been supplied");
      file = "fred"; // to stop the compiler complaining
    }

    if (!file.endsWith(".tlca") && !file.endsWith(".tlca.bin")) {
      panic(
        `Error: Bytecode file does not end with a .tlca or .tlca.bin extension: ${file}`,
      );
    }

    const srcFile = file.endsWith(".tlca")
      ? file
      : file.replace(".tlca.bin", ".tlca");
    const targetFile = `${srcFile}.bin`;

    const srcFileDataTime = (await fileDateTime(srcFile))!;
    const targetFileDataTime = await fileDateTime(targetFile);
    if (srcFileDataTime > targetFileDataTime) {
      await compile(srcFile);
    }

    const implementation = vals.get("implementation") || "c";
    let cmd: Array<string> = [];
    if (implementation === "c") {
      cmd = [
        libPath(binaryName()),
        "run",
      ];
    } else if (implementation === "deno") {
      cmd = [
        "deno",
        "run",
        "--allow-read",
        denoName("bci-deno/bci.ts"),
        "run",
      ];
    } else {
      panic(`Error: Unknown implementation: ${implementation}`);
    }

    if (file !== undefined) {
      cmd.push(
        file.endsWith(".tlca") ? file.replace(".tlca", ".tlca.bin") : file,
      );
    }
    await Deno.run({ cmd }).status();
  },
);

const replCmd = new CLI.ValueCommand(
  "repl",
  "A REPL for TLCA",
  [
    new CLI.ValueOption(
      ["--implementation", "-i"],
      "The implementation to be used - options are deno, kotlin for the Deno and Kotlin implementations respectively.  The default is Kotlin.",
    ),
  ],
  {
    name: "FILE",
    optional: true,
    help:
      "If this argument is supplied then the contents of this file will be executed directly by the REPL",
  },
  async (
    _: CLI.Definition,
    file: string | undefined,
    vals: Map<string, unknown>,
  ) => {
    const implementation = vals.get("implementation") || "kotlin";

    let cmd: Array<string> = [];

    if (implementation === "kotlin") {
      cmd = [
        "java",
        "-jar",
        libPath(jarName()),
      ];
    } else if (implementation === "deno") {
      cmd = [
        "deno",
        "run",
        "--allow-read",
        denoName("deno/Repl.ts"),
      ];
    } else {
      panic(`Error: Unknown implementation: ${implementation}`);
    }

    if (file !== undefined) {
      cmd.push(file);
    }
    await Deno.run({ cmd }).status();
  },
);

const setupCmd = new CLI.ValueCommand(
  "setup",
  "Downloads and installs the required components",
  [],
  {
    name: "FILE",
    optional: true,
    help: "",
  },
  async (
    _: CLI.Definition,
    _file: string | undefined,
    _vals: Map<string, unknown>,
  ) => {
    const homeDir = `${
      Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "."
    }/.ll`;

    await Deno.mkdir(homeDir, { recursive: true });
    await Deno.mkdir(`${homeDir}/bin`, { recursive: true });
    await Deno.mkdir(`${homeDir}/libs`, { recursive: true });

    await downloadLatest(binaryName());
    await downloadLatest(jarName());

    await Deno.chmod(libPath(binaryName()), 0o755);
  },
);

const cli = {
  name: "tlca",
  help: "Typed Lambda Calculus with ADT's CLI",
  options: [CLI.helpFlag],
  cmds: [compileCmd, disCmd, replCmd, runCmd, setupCmd, CLI.helpCmd],
};

CLI.process(cli);
