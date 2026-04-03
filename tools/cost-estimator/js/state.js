export const config = {
  model:'opus-4.6', cacheTTL:'5m', contextWindow:200000,
  turns:25, sysPrompt:20000, userMsg:300,
  responseTokens:1200, thinkingTokens:4000,
  toolRounds:3, toolResult:800,
  timeBetween:1.5, cacheDrops:0,
  compactions:0, compactRatio:0.25, autoCompact:true,
};

export const state = {
  lastResult: null,
  lastPreset: null,
  animState: {},
};
