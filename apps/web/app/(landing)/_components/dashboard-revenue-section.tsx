import { DashboardRevenueChart } from './dashboard-revenue-chart';

export function DashboardRevenueSection(): React.JSX.Element {
  return (
    <div data-dash-anchor>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-foreground text-sm font-semibold">Revenue</h3>
        <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
          Last 7 days <span className="text-[8px]">▾</span>
        </span>
      </div>
      <DashboardRevenueChart />
    </div>
  );
}
