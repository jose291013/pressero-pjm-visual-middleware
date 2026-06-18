export type VisualOptionsModuleStatus = "mapping_admin";

export type VisualOptionChoiceMappingRow = {
  engineId: string;
  enginePjmId: string;
  engineName: string;
  optionId: string;
  optionPjmId: string;
  optionLabel: string;
  choiceId: string;
  choicePjmId: string;
  choiceLabel: string;
  normalizedChoiceKey: string;
  expectedImageFile: string;
  mappedAssetKey: string | null;
  mappedAssetUrl: string | null;
  suggestedAssetKey: string | null;
  suggestedAssetUrl: string | null;
  status: "mapped" | "auto_match" | "missing";
};

export type VisualOptionEngineMappingSummary = {
  engineId: string;
  enginePjmId: string;
  engineName: string;
  rows: VisualOptionChoiceMappingRow[];
  counts: {
    totalChoices: number;
    mapped: number;
    autoMatch: number;
    missing: number;
  };
};

export type VisualOptionMappingImportResult = {
  mapped: number;
  skipped: number;
  errors: string[];
};

export type VisualOptionMappingWorkbookExport = {
  fileName: string;
  buffer: Buffer;
};
