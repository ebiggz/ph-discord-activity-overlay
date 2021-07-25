import http from "http";
import WebSocket, { AddressInfo } from "ws";
import express from "express";
import cors from "cors";
import { settingsManager } from "./SettingsManager";

class WebServerManager {
    private expressApp = express();
    private httpServer = http.createServer(this.expressApp);
    wsServer = new WebSocket.Server({ server: this.httpServer });
    private server!: http.Server;

    constructor() {
        this.expressApp.use(cors());

        this.expressApp.use("/overlay", express.static(__dirname + "/overlay"));

        // this.expressApp.get("/overlay", (_, res) => {
        //     res.sendFile(__dirname + "/overlay/index.html");
        // });

        try {
            this.server = this.httpServer.listen(8923);
            console.info(
                "Web Server listening on port %s.",
                (this.server.address() as AddressInfo).port
            );
        } catch (err) {
            console.error(err);
        }

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
                        console.error(err);
                    }
                });
            }
        });
    }
}

export const webServerManager = new WebServerManager();
