import "reflect-metadata";
import Application, { SetManager, Essentials, Logger } from "dd-botkit";
import { config } from "./config";
import { GuildPermissionSet } from "./entities/gpset";
import { createConnection } from "typeorm";
import { HugoReachability } from "./commands";

export const app = new Application({
    token: config.token,
    superuserCheck: id => config.gods.includes(id),
    permissionsEntity: GuildPermissionSet
});

app.init()
   .then(() => Logger.info("Discord connected."))
   .then(() => createConnection({
        entities: [__dirname + "/entities/*.js"],
        ...config.db
    } as any))
   .then(() => Logger.info("DB Connected."))
   .then(() => app.commandSystem.loadCommands(SetManager))
   .then(() => app.commandSystem.loadCommands(Essentials))
   .then(() => app.commandSystem.loadCommands(HugoReachability))
   .then(() => Logger.info("Bot running."));
