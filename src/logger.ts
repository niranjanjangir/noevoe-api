export function logLine(fields: Record<string, unknown>): void {
  const line = { time: new Date().toISOString(), ...fields };
  console.log(JSON.stringify(line));
}
