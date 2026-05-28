export function incrementVersion(version: string): string {
  const [majorPart, minorPart] = version.split('.');
  const major = Number.parseInt(majorPart ?? '1', 10) || 1;
  const minor = Number.parseInt(minorPart ?? '0', 10) || 0;

  return `${major}.${minor + 1}`;
}
