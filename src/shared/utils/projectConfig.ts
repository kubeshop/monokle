let PROJECT_CONFIG_TIMESTAMP = 0;

export function getProjectConfigTimestamp(): number {
  return PROJECT_CONFIG_TIMESTAMP;
}

export function updateProjectConfigTimestamp(timestamp: number): void {
  PROJECT_CONFIG_TIMESTAMP = timestamp;
}
