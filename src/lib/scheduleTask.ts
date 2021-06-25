import axios from "axios";
import { AkairoClient } from "discord-akairo";
import schedule from "node-schedule";
import { KoreanbotsEndPoints } from "./constants";
import Bot from "./database/models/Bot";
import convert from "./utils/convertRawToType";

let cachedGuildCount = 0;

export default async function (client: AkairoClient) {
  schedule.scheduleJob("*/1 * * * *", async (date) => {
    const bots = await Bot.find({ track: true });

    for (const bot of bots)
      await axios
        .get(KoreanbotsEndPoints.API.bot(bot.id))
        .then(async ({ data }) => {
          const res = convert.bot(data.data);

          await Bot.findOneAndUpdate(
            { id: res.id },
            {
              $push: {
                stats: {
                  updated: date,
                  votes: res.votes,
                  servers: res.servers,
                  status: res.status
                }
              }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        })
        .catch((e) => {
          client.logger.warn(
            `FetchError: Error occurred while fetching bot ${bot.id}:\n${e}`
          );
        });

    const guildCount = client.guilds.cache.size;
    if (guildCount !== cachedGuildCount)
      await axios
        .post(
          KoreanbotsEndPoints.API.stats(client.user.id),
          { servers: guildCount },
          {
            headers: {
              Authorization: process.env.KOREANBOTS_TOKEN,
              "Content-Type": "application/json"
            }
          }
        )
        .then(({ data }) => {
          client.logger.info(
            `Bumped ${guildCount} guilds to koreanbots.dev | Response:\n${JSON.stringify(
              data
            )}`
          );
          cachedGuildCount = guildCount;
        })
        .catch((e) => {
          client.logger.warn(
            `FetchError: Error occurred while updaing bot server count:\n${e}`
          );
        });
  });
}
