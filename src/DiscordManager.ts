import DiscordRPC from "discord-rpc";
import log from "electron-log";
import { webServerManager } from "./WebServerManager";
import {
    CLIENT_ID,
    CLIENT_SECRET,
    HOARDERS,
    POTION_HOARDERS_SERVER_ID,
    REDIRECT_URI,
    SCOPES,
} from "./constants";

const CHANNEL_SPEAKING_EVENTS: DiscordRPC.RPCEvents[] = [
    "SPEAKING_START",
    "SPEAKING_STOP",
];

const CHANNEL_VOICE_STATE_EVENTS: DiscordRPC.RPCEvents[] = [
    "VOICE_STATE_CREATE",
    "VOICE_STATE_DELETE",
    "VOICE_STATE_UPDATE",
];

const CHANNEL_EVENTS: DiscordRPC.RPCEvents[] = [
    ...CHANNEL_SPEAKING_EVENTS,
    ...CHANNEL_VOICE_STATE_EVENTS,
];

type ChannelUser = {
    id: string;
    name: string;
    nick: string;
    speaking: boolean;
    goblin: string;
};

class DiscordManager {
    private client!: DiscordRPC.Client;

    private currentVoiceChanelId: string | null = null;

    private channelEventSubscriptions: DiscordRPC.Subscription[] = [];

    private channelUsers: ChannelUser[] = [];

    constructor() {
        this.client = new DiscordRPC.Client({ transport: "ipc" });

        this.client.on("disconnected", () => {
            this.triggerReconnect();
        });

        this.client.on("ready", async () => {
            for (const speakingEvent of CHANNEL_SPEAKING_EVENTS) {
                this.client.on<{ user_id: string }>(speakingEvent, (data) => {
                    log.info(speakingEvent, data);
                    if (!HOARDERS.some((h) => h.id === data?.user_id)) return;

                    const user = this.channelUsers.find(
                        (u) => u.id === data?.user_id
                    );

                    if (user != null) {
                        user.speaking = speakingEvent === "SPEAKING_START";
                        this.sendUserStateUpdate();
                    }
                });
            }

            for (const voiceStateEvent of CHANNEL_VOICE_STATE_EVENTS) {
                this.client.on<DiscordRPC.VoiceState>(
                    voiceStateEvent,
                    (data) => {
                        log.info(voiceStateEvent, data);
                        if (
                            data == null ||
                            !HOARDERS.some((h) => h.id === data.user.id)
                        )
                            return;

                        if (voiceStateEvent === "VOICE_STATE_CREATE") {
                            this.channelUsers = this.channelUsers.filter(
                                (u) => u.id !== data?.user.id
                            );
                            this.channelUsers.push({
                                id: data?.user.id,
                                name: data?.user.username,
                                nick: data?.nick,
                                goblin: HOARDERS.find(
                                    (h) => h.id === data?.user.id
                                )!.goblin,
                                speaking: false,
                            });
                        } else if (voiceStateEvent === "VOICE_STATE_DELETE") {
                            this.channelUsers = this.channelUsers.filter(
                                (u) => u.id !== data?.user.id
                            );
                        } else if (voiceStateEvent === "VOICE_STATE_UPDATE") {
                            const user = this.channelUsers.find(
                                (u) => u.id === data?.user.id
                            );

                            if (user != null) {
                                user.nick = data?.nick;
                                user.name = data?.user.username;
                            } else {
                                this.channelUsers.push({
                                    id: data?.user.id,
                                    name: data?.user.username,
                                    nick: data?.nick,
                                    goblin: HOARDERS.find(
                                        (h) => h.id === data?.user.id
                                    )!.goblin,
                                    speaking: false,
                                });
                            }
                        }
                        this.sendUserStateUpdate();
                    }
                );
            }

            await this.client.subscribe("VOICE_CHANNEL_SELECT");

            this.getSelectedVoiceChannel();

            webServerManager.wsServer.on("connection", (ws) => {
                ws.send(
                    JSON.stringify({
                        event: "STATE_UPDATE",
                        users: this.channelUsers,
                    })
                );
            });

            log.info("Connected to Discord");
        });

        this.client.on("VOICE_CHANNEL_SELECT", () => {
            this.getSelectedVoiceChannel();
        });
    }

    sendUserStateUpdate() {
        webServerManager.sendWebsocketMessage({
            event: "STATE_UPDATE",
            users: this.channelUsers,
        });
    }

    async getSelectedVoiceChannel() {
        this.currentVoiceChanelId = null;

        try {
            for (const subscription of this.channelEventSubscriptions) {
                await subscription.unsubscribe();
            }
        } catch (e) {
            log.info("Error unsubscribing from voice channel events", e);
        }

        this.channelEventSubscriptions = [];

        this.channelUsers = [];
        this.sendUserStateUpdate();

        try {
            const channel = await this.client.request<DiscordRPC.Channel>(
                "GET_SELECTED_VOICE_CHANNEL"
            );

            // only consider a channel selected if it's in the server we're interested in
            if (
                channel == null ||
                channel.guild_id !== POTION_HOARDERS_SERVER_ID
            )
                return;

            this.currentVoiceChanelId = channel.id;

            for (const event of CHANNEL_EVENTS) {
                const subscription = await this.client.subscribe(event, {
                    channel_id: this.currentVoiceChanelId,
                });
                this.channelEventSubscriptions.push(subscription);
            }
        } catch (e) {
            log.info("Error getting current voice channel", e);
        }
    }

    private triggerReconnect() {
        (this.client as any)._connectPromise = undefined;
        log.info("Attempting to reconnect to Discord in 30 secs...");
        setTimeout(() => {
            this.connect();
        }, 30 * 1000);
    }

    async connect() {
        await this.client
            .login({
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                scopes: SCOPES,
                redirectUri: REDIRECT_URI,
                // prevents oauth modal from showing every time (ie only show it once)
                prompt: "none",
            } as any)
            .catch((err) => {
                log.warn(err);
                this.triggerReconnect();
            });
    }
}

export const discordManager = new DiscordManager();
