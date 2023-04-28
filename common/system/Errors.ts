import * as Logging from "./Logging.ts";

export const panic = (msg: string, exitCode = 1) => {
  Logging.error(msg);
  Deno.exit(exitCode);
};
