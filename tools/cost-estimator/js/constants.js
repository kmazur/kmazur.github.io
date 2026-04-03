export const MODELS = {
  'opus-4.6':   { name:'Opus 4.6',   input:5,  output:25, cache5m:6.25, cache1h:10, cacheRead:0.50, color:'#a78bfa' },
  'sonnet-4.6': { name:'Sonnet 4.6', input:3,  output:15, cache5m:3.75, cache1h:6,  cacheRead:0.30, color:'#60a5fa' },
  'haiku-4.5':  { name:'Haiku 4.5',  input:1,  output:5,  cache5m:1.25, cache1h:2,  cacheRead:0.10, color:'#34d399' },
};

// Presets only override usage-pattern inputs (task shape).
// Environment inputs (sysPrompt, timeBetween, model, cacheTTL, contextWindow) stay untouched.
export const PRESETS = {
  quickFix:    { turns:8,   userMsg:200,  responseTokens:800,  thinkingTokens:3000,  toolRounds:2,  toolResult:500,  cacheDrops:0, compactions:0, compactRatio:0.25 },
  feature:     { turns:35,  userMsg:400,  responseTokens:1500, thinkingTokens:5000,  toolRounds:4,  toolResult:900,  cacheDrops:1, compactions:1, compactRatio:0.25 },
  refactor:    { turns:70,  userMsg:500,  responseTokens:2000, thinkingTokens:6000,  toolRounds:5,  toolResult:1200, cacheDrops:2, compactions:3, compactRatio:0.20 },
  review:      { turns:12,  userMsg:150,  responseTokens:1200, thinkingTokens:3000,  toolRounds:3,  toolResult:800,  cacheDrops:0, compactions:0, compactRatio:0.25 },
  exploration: { turns:40,  userMsg:250,  responseTokens:600,  thinkingTokens:2000,  toolRounds:6,  toolResult:1500, cacheDrops:1, compactions:2, compactRatio:0.25 },
  vibe:        { turns:100, userMsg:600,  responseTokens:3000, thinkingTokens:10000, toolRounds:6,  toolResult:1200, cacheDrops:3, compactions:4, compactRatio:0.20 },
};

export const COMPACT_THRESHOLD = 0.70;
export const TOOL_CALL_OVERHEAD = 180;
