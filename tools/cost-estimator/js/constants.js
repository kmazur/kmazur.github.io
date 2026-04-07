export const MODELS = {
  'opus-4.6':   { name:'Opus 4.6',   input:5,  output:25, cache5m:6.25, cache1h:10, cacheRead:0.50, color:'#a78bfa', maxContext:1000000, minCacheable:4096 },
  'sonnet-4.6': { name:'Sonnet 4.6', input:3,  output:15, cache5m:3.75, cache1h:6,  cacheRead:0.30, color:'#60a5fa', maxContext:1000000, minCacheable:2048 },
  'haiku-4.5':  { name:'Haiku 4.5',  input:1,  output:5,  cache5m:1.25, cache1h:2,  cacheRead:0.10, color:'#34d399', maxContext:200000, minCacheable:4096 },
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

// Claude Code auto-compacts close to the context limit rather than at the much
// earlier API compaction thresholds used in some raw API examples.
export const AUTO_COMPACT_THRESHOLD = 0.95;
// Approximate output tokens per tool-use call (function name, JSON schema, invocation boilerplate)
export const TOOL_CALL_OVERHEAD = 180;
export const WEB_SEARCH_COST_PER_REQUEST = 0.01;
export const DEFAULT_BACKGROUND_COST = 0.02;
export const SESSION_MIX = [
  { key:'mixQuickFix', preset:'quickFix', label:'Quick Fix' },
  { key:'mixFeature', preset:'feature', label:'Feature' },
  { key:'mixReview', preset:'review', label:'Review' },
  { key:'mixRefactor', preset:'refactor', label:'Refactor' },
  { key:'mixExploration', preset:'exploration', label:'Explore' },
  { key:'mixVibe', preset:'vibe', label:'Vibe' },
];
export const TOOL_MIX_OPTIONS = {
  local: {
    label:'Local',
    note:'Mostly local CLI, file reads, and edits. Lowest external pricing risk.',
    rangeDown:0.96,
    rangeUp:1.04,
  },
  balanced: {
    label:'Balanced',
    note:'Mix of local work with occasional web/docs/tool usage.',
    rangeDown:0.93,
    rangeUp:1.10,
  },
  research: {
    label:'Research',
    note:'Heavier web/docs usage. Search fees and larger fetched contexts matter more.',
    rangeDown:0.90,
    rangeUp:1.18,
  },
  execution: {
    label:'Execution',
    note:'Server-side tools and code execution add the most hidden-cost variance.',
    rangeDown:0.88,
    rangeUp:1.28,
  },
};
export const UNCERTAINTY_OPTIONS = {
  low:  { label:'Low', rangeDown:0.95, rangeUp:1.10 },
  med:  { label:'Med', rangeDown:0.85, rangeUp:1.25 },
  high: { label:'High', rangeDown:0.72, rangeUp:1.50 },
};
export const SLIDER_KEYS = [
  'turns',
  'sysPrompt',
  'userMsg',
  'responseTokens',
  'thinkingTokens',
  'toolRounds',
  'toolResult',
  'timeBetween',
  'cacheDrops',
  'compactions',
  'compactRatio',
  'backgroundCost',
  'webSearches',
  'hourlyRate',
  'timeSavedMins',
  'workdaysPerMonth',
  'interruptions',
  'retryRate',
  'parallelAgents',
  'parallelAgentCostRatio',
  'mixQuickFix',
  'mixFeature',
  'mixReview',
  'mixRefactor',
  'mixExploration',
  'mixVibe',
];
export const INTEGER_SLIDER_KEYS = new Set([
  'turns',
  'sysPrompt',
  'userMsg',
  'responseTokens',
  'thinkingTokens',
  'toolRounds',
  'toolResult',
  'cacheDrops',
  'compactions',
  'webSearches',
  'hourlyRate',
  'timeSavedMins',
  'workdaysPerMonth',
  'interruptions',
  'retryRate',
  'parallelAgents',
  'mixQuickFix',
  'mixFeature',
  'mixReview',
  'mixRefactor',
  'mixExploration',
  'mixVibe',
]);

export const SLIDER_RANGES = {
  turns:           { min: 1,    max: 200 },
  sysPrompt:       { min: 2000, max: 100000 },
  userMsg:         { min: 30,   max: 5000 },
  responseTokens:  { min: 50,   max: 16000 },
  thinkingTokens:  { min: 0,    max: 32000 },
  toolRounds:      { min: 0,    max: 15 },
  toolResult:      { min: 50,   max: 6000 },
  timeBetween:     { min: 0.5,  max: 90 },
  cacheDrops:      { min: 0,    max: 15 },
  compactions:     { min: 0,    max: 10 },
  compactRatio:    { min: 0.1,  max: 0.5 },
  backgroundCost:  { min: 0,    max: 0.04 },
  webSearches:     { min: 0,    max: 20 },
};
