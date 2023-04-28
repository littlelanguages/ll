import * as Errors from "../common/system/Errors.ts";
import * as IO from "../common/system/IO.ts";

export const libPath = (name: string) =>
  `${
    Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "."
  }/.ll/libs/${name}`;

export type NameConfiguration = {
  sourceSuffix: string;
  targetSuffix: string;
};

export const FileNameValidator = (
  name: string | undefined,
  cfg: NameConfiguration,
) => {
  if (name === undefined) {
    Errors.panic("Error: No file has been supplied");
    name = "fred"; // to stop the compiler complaining
  }

  return {
    hasSourceSuffix: name.endsWith(cfg.sourceSuffix),
    hasTargetSuffix: name.endsWith(cfg.targetSuffix),
    sourceName: function (): string {
      if (this.hasTargetSuffix) {
        return name!.replace(cfg.targetSuffix, cfg.sourceSuffix);
      }
      return name!;
    },
    targetName: function (): string {
      if (this.hasTargetSuffix) {
        return name!;
      }
      if (this.hasSourceSuffix) {
        return name!.replace(cfg.sourceSuffix, cfg.targetSuffix);
      }
      return `${name}${cfg.targetSuffix}`;
    },
    mustRebuild: async function () {
      const srcFileDataTime = await IO.fileDateTime(this.sourceName());
      const targetFileDataTime = await IO.fileDateTime(this.targetName());

      return srcFileDataTime > targetFileDataTime;
    },
  };
};
