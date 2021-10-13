/**
 * Copyright (C) 2021 despenser08
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {
  BubbleDataPoint,
  ChartConfiguration,
  ChartTypeRegistry,
  ScatterDataPoint
} from "chart.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import "chartjs-plugin-datalabels";
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
    plugins: { requireLegacy: ["chartjs-plugin-datalabels"] },
    chartCallback: (chart) => {
      chart.defaults.font.family = "Noto Sans KR";
      chart.defaults.color = "#000";
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
