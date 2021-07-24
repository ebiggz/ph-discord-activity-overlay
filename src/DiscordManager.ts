import DiscordRPC from "discord-rpc";

// TODO: move to a more appropriate place
const CLIENT_ID = "867980870714265690";
const CLIENT_SECRET = "i5N0t5bqaWVAdI5EdUS55qprpgsQZuZL";
const SCOPES = ["rpc"];
const REDIRECT_URI = "http://127.0.0.1";

// TODO: make configurable
const VOICE_CHANNEL_ID = "596853918714167304";

class DiscordManager {
    private client!: DiscordRPC.Client;

    constructor() {
        this.client = new DiscordRPC.Client({ transport: "ipc" });

        this.client.on("ready", async () => {
            (this.client as any).transport.on("message", (message: any) =>
                console.log("IPC MESSAGE DEBUG", message)
            );

            this.client.subscribe(
                "SPEAKING_START",
                { channel_id: VOICE_CHANNEL_ID },
                (message) => {
                    console.log("SPEAKING_START", message);
                }
            );

            console.log("Connected to Discord");
        });
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
            .catch(console.error);
    }
}

export const discordManager = new DiscordManager();
