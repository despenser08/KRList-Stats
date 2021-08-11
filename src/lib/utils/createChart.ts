import {
  BubbleDataPoint,
  ChartConfiguration,
  ChartTypeRegistry,
  ScatterDataPoint
} from "chart.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import ChartDataLabel from "chartjs-plugin-datalabels";
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
    chartCallback: () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const chart = require("chart.js");

      require("chartjs-plugin-datalabels");
      delete require.cache[require.resolve("chart.js")];
      delete require.cache[require.resolve("chartjs-plugin-datalabels")];

      chart.register(ChartDataLabel);

      chart.defaults.font.family = "Noto Sans KR";
      chart.defaults.color = "#000";

      return chart;
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
