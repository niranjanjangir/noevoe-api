export function learnerInputBlock(input: {
  hobbyDescription: string;
  currentLevelNote?: string;
}): string {
  return [
    "<learner_input>",
    JSON.stringify({
      hobbyDescription: input.hobbyDescription,
      currentLevelNote: input.currentLevelNote ?? "",
    }),
    "</learner_input>",
  ].join("\n");
}
