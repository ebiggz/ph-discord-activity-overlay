import http from "http";
import WebSocket, { AddressInfo } from "ws";
import express from "express";
import cors from "cors";
import log from "electron-log";
import { settingsManager } from "./SettingsManager";

class WebServerManager {
    private expressApp = express();
    private httpServer = http.createServer(this.expressApp);
    wsServer = new WebSocket.Server({ server: this.httpServer });
    private server!: http.Server;

    constructor() {
        this.expressApp.use(cors());

        this.expressApp.use("/overlay", express.static(__dirname + "/overlay"));

        settingsManager.on("settingsUpdated", (settings) => {
            this.sendWebsocketMessage({
                event: "SETTINGS_UPDATE",
                settings: settings,
            });
        });

        this.wsServer.on("connection", (client: WebSocket) => {
            client.send(
                JSON.stringify({
                    event: "SETTINGS_UPDATE",
                    settings: settingsManager.getAll(),
                })
            );
        });
    }

    sendWebsocketMessage(data: unknown) {
        const rawData = JSON.stringify(data);

        this.wsServer.clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(rawData, (err) => {
                    if (err) {
                        log.error(err);
                    }
                });
            }
        });
    }

    start() {
        try {
            this.server = this.httpServer.listen(8923);
            log.info(
                "Web Server listening on port %s.",
                (this.server.address() as AddressInfo).port
            );
        } catch (err) {
            log.error(err);
        }
    }
}

export const webServerManager = new WebServerManager();
