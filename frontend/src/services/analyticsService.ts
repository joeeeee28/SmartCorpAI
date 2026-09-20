import { agentPerformance, costUsage, funnel, unanswered, usageByDay } from '../mock/analytics';
import { evalCases, evalMetrics, reports } from '../mock/admin';
import { mock } from './api';

export const analyticsService = {
  usage: () => mock(usageByDay),
  agentPerformance: () => mock(agentPerformance),
  cost: () => mock(costUsage),
  unanswered: () => mock(unanswered),
  funnel: () => mock(funnel),
};

export const evaluationService = {
  metrics: () => mock(evalMetrics),
  cases: () => mock(evalCases),
};

export const reportService = {
  list: () => mock(reports),
};
