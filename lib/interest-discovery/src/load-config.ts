import type { InterestDiscoveryConfig } from "./types.js";
import { v1Config } from "./config/v1.config.js";

const CONFIGS: Record<string, InterestDiscoveryConfig> = {
  v1: v1Config,
};

export function getInterestDiscoveryConfig(version = "v1"): InterestDiscoveryConfig {
  const config = CONFIGS[version];
  if (!config) {
    throw new Error(`Unknown interest discovery version: ${version}`);
  }
  return config;
}

export function listInterestDiscoveryVersions(): string[] {
  return Object.keys(CONFIGS);
}
