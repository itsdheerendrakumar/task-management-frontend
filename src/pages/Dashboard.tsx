import { getDashboardData, getLastOneYearTaskCount } from "@/services/dashboard";
import { useQuery } from "@tanstack/react-query";
import { SectionLoader } from "@/features/Loader";
import { ShowError } from "@/features/ShowError";
import { TaskMetricsAreaChart } from "@/features/dashboard/TaskMetricsAreaChart";
import type { MonthlyTaskMetrics, TaskMetrics } from "@/services/dashboard/types";
import { useGetProfile } from "@/hooks/useGetProfile";

interface MetricCard {
    label: string;
    value: number;
    icon: string;
    bgColor: string;
    iconBgColor: string;
}

export function Dashboard() {
    const {profileQuery} = useGetProfile();
    const metricsQuery = useQuery({
        queryKey: ["dashboardData", profileQuery.data?.data?.id],
        queryFn: getDashboardData,
    });
    const lastOneYearQuery = useQuery({
        queryKey: ["lastOneYearData", profileQuery.data?.data?.id],
        queryFn: getLastOneYearTaskCount,
    });

    const metricsLoading = metricsQuery.isLoading;
    const chartLoading = lastOneYearQuery.isLoading;
    const metricsError = metricsQuery.error;
    const chartError = lastOneYearQuery.error;

    const metrics: TaskMetrics | undefined = metricsQuery.data?.data;
    const chartData: MonthlyTaskMetrics[] | undefined = lastOneYearQuery.data?.data;

    const metricCards: MetricCard[] = metrics
        ? [
              {
                  label: "TOTAL TASKS",
                  value: metrics.totaltask,
                  icon: "📋",
                  bgColor: "bg-blue-50",
                  iconBgColor: "bg-blue-100",
              },
              {
                  label: "COMPLETED",
                  value: metrics.completedTask,
                  icon: "✓",
                  bgColor: "bg-green-50",
                  iconBgColor: "bg-green-100",
              },
              {
                  label: "PENDING",
                  value: metrics.pendingTask,
                  icon: "⏱",
                  bgColor: "bg-cyan-50",
                  iconBgColor: "bg-cyan-100",
              },
              {
                  label: "OVERDUE",
                  value: metrics.overedueTask,
                  icon: "⚡",
                  bgColor: "bg-amber-50",
                  iconBgColor: "bg-amber-100",
              },
          ]
        : [];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metricsLoading && (
                    <div className="col-span-full">
                        <SectionLoader />
                    </div>
                )}
                {!metricsLoading && metricsError && (
                    <div className="col-span-full">
                        <ShowError message={metricsError instanceof Error ? metricsError.message : "Failed to load metrics."} />
                    </div>
                )}
                {!metricsLoading && !metricsError && !metrics && (
                    <div className="col-span-full">
                        <ShowError message="No metrics data available." />
                    </div>
                )}
                {!metricsLoading && !metricsError && metrics &&
                    metricCards.map((card, index) => (
                        <div
                            key={index}
                            className={`${card.bgColor} rounded-lg p-6 border border-gray-200`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {card.value}
                                    </p>
                                </div>
                                <div className={`${card.iconBgColor} rounded-lg p-3 text-xl`}>
                                    {card.icon}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
            {chartLoading && <SectionLoader />}
            {!chartLoading && chartError && (
                <ShowError message={chartError instanceof Error ? chartError.message : "Failed to load monthly task data."} />
            )}
            {!chartLoading && !chartError && <TaskMetricsAreaChart data={chartData ?? []} />}
        </div>
    );
}