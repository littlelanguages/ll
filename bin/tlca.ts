import * as CLI from "https://raw.githubusercontent.com/littlelanguages/deno-lib-console-cli/0.1.2/mod.ts";
import * as Errors from "../common/system/Errors.ts";
import { FileNameValidator, libPath, NameConfiguration } from "./common.ts";
import * as IO from "../common/system/IO.ts";

const languageName = "tlca";
const version = "v1.0.0";

// compile
// run -i (bci)
// dis (bci)
// asm (bci)
// setup

const binaryName = () => {
  const arch = Deno.build.arch;
  const os = Deno.build.os;

  return `${languageName}-bci-zig-${os}-${arch}`;
};

const nameConfiguration: NameConfiguration = {
  sourceSuffix: `.${languageName}`,
  targetSuffix: `.${languageName}.bin`,
};

const jarName = () => `${languageName}.jar`;

const downloadLatest = async (name: string) => {
  const source = `https://lltlca.blob.core.windows.net/bin/${name}`;
  const saveFileName = libPath(name);

  await IO.downloadAndSave(source, saveFileName);
};

const denoName = (script: string) =>
  `https://raw.githubusercontent.com/littlelanguages/ll-${languageName}/${version}/components/${script}`;

const compile = async (file: string) => {
  const cmd: Array<string> = [
    "java",
    "-jar",
    libPath(jarName()),
    file,
    file.replace(`.${languageName}`, `.${languageName}.bin`),
  ];

  await Deno.run({ cmd }).status();
};

const compileCmd = new CLI.ValueCommand(
  "compile",
  `Compile a .${languageName} source file to a .${languageName}.bin bytecode file`,
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
    const validator = FileNameValidator(file, nameConfiguration);

    if (!validator.hasSourceSuffix) {
      Errors.panic(
        `Error: Source file does not have a .${languageName} extension: ${file}`,
      );
    }

    await compile(file!);
  },
);

const disCmd = new CLI.ValueCommand(
  "dis",
  `Disassemble a compiled .${languageName} bytecode file`,
  [
    new CLI.ValueOption(
      ["--implementation", "-i"],
      "The implementation to be used - options are deno, zig for the Deno and Zig implementations respectively.  The default is Deno.",
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
    const validator = FileNameValidator(file, nameConfiguration);

    if (!validator.hasSourceSuffix && !validator.hasTargetSuffix) {
      Errors.panic(
        `Error: Bytecode file does not end with a .${languageName} or .${languageName}.bin extension: ${file}`,
      );
    }

    const implementation = vals.get("implementation") || "deno";

    let cmd: Array<string> = [];
    if (implementation === "zig") {
      cmd = [libPath(binaryName()), "dis"];
    } else if (implementation === "deno") {
      cmd = ["deno", "run", "--allow-read", denoName("bci-deno/bci.ts"), "dis"];
    } else {
      Errors.panic(`Error: Unknown implementation: ${implementation}`);
    }

    cmd.push(validator.targetName());
    await Deno.run({ cmd }).status();
  },
);

const runCmd = new CLI.ValueCommand(
  "run",
  `Run a compiled .${languageName} bytecode file`,
  [
    new CLI.ValueOption(
      ["--implementation", "-i"],
      "The implementation to be used - options are deno, zig for the Deno and Zig implementations respectively.  The default is zig.",
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
    const validator = FileNameValidator(file, nameConfiguration);

    if (!validator.hasSourceSuffix && !validator.hasTargetSuffix) {
      Errors.panic(
        `Error: Bytecode file does not end with a .${languageName}} or .${languageName}.bin extension: ${file}`,
      );
    }

    if (await validator.mustRebuild()) {
      await compile(validator.sourceName());
    }

    const implementation = vals.get("implementation") || "zig";
    let cmd: Array<string> = [];
    if (implementation === "zig") {
      cmd = [libPath(binaryName()), "run"];
    } else if (implementation === "deno") {
      cmd = ["deno", "run", "--allow-read", denoName("bci-deno/bci.ts"), "run"];
    } else {
      Errors.panic(`Error: Unknown implementation: ${implementation}`);
    }

    cmd.push(validator.targetName());

    await Deno.run({ cmd }).status();
  },
);

const replCmd = new CLI.ValueCommand(
  "repl",
  `A REPL for ${languageName}`,
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
      Errors.panic(`Error: Unknown implementation: ${implementation}`);
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
  name: languageName,
  help: "Typed Lambda Calculus with ADT's CLI",
  options: [CLI.helpFlag],
  cmds: [compileCmd, disCmd, replCmd, runCmd, setupCmd, CLI.helpCmd],
};

CLI.process(cli);
