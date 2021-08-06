import {
  BubbleDataPoint,
  ChartConfiguration,
  ChartTypeRegistry,
  ScatterDataPoint
} from "chart.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import ChartDataLabels from "chartjs-plugin-datalabels";
import path from "path";

export default function createChart(
  width: number,
  height: number,
  configuration: ChartConfiguration<
    keyof ChartTypeRegistry,
    (number | ScatterDataPoint | BubbleDataPoint)[],
    unknown
  >
) {
  const chart = new ChartJSNodeCanvas({
    width,
    height,
    chartCallback: (chart) => {
      delete require.cache[require.resolve("chart.js")];
      delete require.cache[require.resolve("chartjs-plugin-datalabels")];

      chart.defaults.font.family = "Noto Sans KR";
      chart.defaults.color = "#000";
      chart.register(ChartDataLabels);
    }
  });
  chart.registerFont(
    path.join(
      __dirname,
      "..",
      "..",
      "..",
      "assets",
      "fonts",
      "NotoSansKR-Regular.otf"
    ),
    {
      family: "Noto Sans KR"
    }
  );

  if (!configuration.plugins) configuration.plugins = [];
  configuration.plugins.unshift({
    id: "white_background_color",
    beforeDraw: (chart) => {
      const ctx = chart.canvas.getContext("2d");
      ctx.save();
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    }
  });

  return chart.renderToBuffer(configuration, "image/png");
}
