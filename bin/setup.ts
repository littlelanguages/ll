import * as CLI from "https://raw.githubusercontent.com/littlelanguages/deno-lib-console-cli/0.1.2/mod.ts";
import { performSetup } from "./setup_cmds.ts";

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
    await performSetup();
  },
);

const cli = {
  name: "ll",
  help: "CLI to manage littlelanguages implementations",
  options: [CLI.helpFlag],
  cmds: [setupCmd, CLI.helpCmd],
};

CLI.process(cli);
