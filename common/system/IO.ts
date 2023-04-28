import { writeAll } from "https://deno.land/std@0.175.0/streams/write_all.ts";
import * as Logging from "./Logging.ts";

export const downloadAndSave = async (source: string, saveFileName: string) => {
  Logging.info(`Downloading ${source}...`);

  const artifact = await (await fetch(source))
    .arrayBuffer();
  const file = await Deno.open(saveFileName, { create: true, write: true });
  await writeAll(file, new Uint8Array(artifact));
  file.close();
};

export const fileDateTime = async (name: string): Promise<number> => {
  try {
    const lstat = await Deno.lstat(name);
    return lstat?.mtime?.getTime() || 0;
  } catch (_) {
    return 0;
  }
};
