export const config = {
  provider:'anthropic', model:'claude-sonnet-4.6', effort:'balanced', taskProfile:'feature', cacheTTL:'5m', contextWindow:200000,
  turns:25, sysPrompt:20000, userMsg:300,
  responseTokens:1200, thinkingTokens:4000,
  toolRounds:3, toolResult:800,
  timeBetween:1.5, cacheDrops:0,
  compactions:0, compactRatio:0.25, autoCompact:true,
  backgroundCost:0.02, webSearches:0, execSessions:0,
  sessPerDay:4, monthlyBudget:100,
  hourlyRate:120, timeSavedMins:20, workdaysPerMonth:20,
  interruptions:1, retryRate:10,
  parallelAgents:0, parallelAgentCostRatio:0.35,
  toolMix:'balanced', uncertainty:'med',
  mixQuickFix:2, mixFeature:4, mixReview:2, mixRefactor:1, mixExploration:1, mixVibe:0,
};

export const state = {
  lastResult: null,
  lastPreset: null,
  animState: {},
};
