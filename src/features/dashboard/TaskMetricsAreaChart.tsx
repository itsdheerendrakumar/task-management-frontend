import Chart from "react-apexcharts";
import { ShowError } from "@/features/ShowError";
import type { MonthlyTaskMetrics } from "@/services/dashboard/types";

interface TaskMetricsAreaChartProps {
  data: MonthlyTaskMetrics[];
}

export function TaskMetricsAreaChart({ data }: TaskMetricsAreaChartProps) {
  if (!data?.length) {
    return <ShowError message="No monthly task data available." />;
  }

  const formattedData = data.map((item) => ({
    month: item.month,
    created: Number(item.created_tasks || 0),
    completed: Number(item.completed_tasks || 0),
  }));

  const options = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    xaxis: {
      categories: formattedData.map((item) => item.month),
      labels: {
        rotate: -45,
        style: { fontSize: "12px", colors: ["#4b5563"] },
      },
      tickPlacement: "between",
      axisBorder: { show: true, color: "#e5e7eb" },
      axisTicks: { show: true, color: "#e5e7eb" },
    },
    yaxis: {
      labels: { style: { fontSize: "12px", colors: ["#4b5563"] } },
      min: 0,
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      markers: { width: 12, height: 12, radius: 12 },
      itemMargin: { horizontal: 8, vertical: 0 },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => `${value} tasks`,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.4,
        gradientToColors: ["#93c5fd", "#6ee7b7"],
        inverseColors: false,
        opacityFrom: 0.55,
        opacityTo: 0.1,
        stops: [0, 80, 100],
      },
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
    },
  };

  const series = [
    {
      name: "Created Tasks",
      data: formattedData.map((item) => item.created),
    },
    {
      name: "Completed Tasks",
      data: formattedData.map((item) => item.completed),
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Task Trends</h2>
          <p className="text-sm text-slate-500">Month-by-month created vs completed task comparison.</p>
        </div>
      </div>
      <Chart options={options as any} series={series} type="area" height={360} />
    </div>
  );
}
