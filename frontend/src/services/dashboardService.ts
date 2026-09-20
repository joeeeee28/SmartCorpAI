import { agentUsage, kpis, notifications, queryTrendDaily, queryTrendMonthly, queryTrendWeekly, recentActivity, systemStatus } from '../mock/dashboard';
import { mock } from './api';

export const dashboardService = {
  getKpis: () => mock(kpis),
  getTrend: (range: 'daily' | 'weekly' | 'monthly') =>
    mock(range === 'daily' ? queryTrendDaily : range === 'weekly' ? queryTrendWeekly : queryTrendMonthly, 180),
  getAgentUsage: () => mock(agentUsage),
  getNotifications: () => mock(notifications),
  getActivity: () => mock(recentActivity),
  getSystemStatus: () => mock(systemStatus),
};
