declare module "discord-rpc" {
    // Type definitions for discord-rpc 3.0
    // Project: https://github.com/discordjs/RPC#readme
    // Definitions by: Jason Bothell <https://github.com/jasonhaxstuff>
    //                 Jack Baron <https://github.com/lolPants>
    //                 Dylan Hackworth <https://github.com/dylhack>
    //                 Sankarsan Kampa <https://github.com/k3rn31p4nic>
    //                 Brian Dashore <https://github.com/bdashore3>
    // Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

    import { EventEmitter } from "events";

    export function register(id: string): boolean;

    export class Client extends EventEmitter {
        constructor(options: RPCClientOptions);

        application: {
            description: string;
            icon: string;
            id: string;
            rpc_origins: string[];
            name: string;
        };

        user: {
            username: string;
            discriminator: string;
            id: string;
            avatar: string;
        };

        connect(clientId: string): Promise<Client>;
        login(options?: RPCLoginOptions): Promise<this>;

        getGuild(id: string, timeout?: number): Promise<Guild>;
        getGuilds(timeout?: number): Promise<Guild[]>;

        getChannel(id: string, timeout?: number): Promise<Channel>;
        getChannels(id?: string, timeout?: number): Promise<Channel[]>;

        setCertifiedDevices(devices: CertifiedDevice[]): Promise<null>;

        setUserVoiceSettings(
            id: string,
            settings: UserVoiceSettings
        ): Promise<any>;

        selectVoiceChannel(
            id: string,
            options?: {
                timeout?: number | undefined;
                force?: boolean | undefined;
            }
        ): Promise<Channel>;
        selectTextChannel(
            id: string,
            options?: { timeout: number; force: boolean }
        ): Promise<Channel>;

        getVoiceSettings(): Promise<VoiceSettings>;
        setVoiceSettings(args: VoiceSettings): Promise<any>;

        captureShortcut(
            callback: (
                shortcut: Array<{ type: number; code: number; name: string }>,
                stop: () => void
            ) => void
        ): Promise<() => void>;

        setActivity(args?: Presence, pid?: number): Promise<any>;
        clearActivity(pid?: number): Promise<any>;

        sendJoinInvite(user: { id: string } | string): Promise<any>;

        sendJoinRequest(user: { id: string } | string): Promise<any>;
        closeJoinRequest(user: { id: string } | string): Promise<any>;

        createLobby(
            type: string,
            capacity: number,
            metadata: any
        ): Promise<any>;
        updateLobby(
            lobby: { id: string } | string,
            options?: {
                type: string;
                owner: { id: string } | string;
                capacity: number;
                metadata: any;
            }
        ): Promise<any>;
        deleteLobby(lobby: { id: string } | string): Promise<any>;
        connectToLobby(id: string, secret: string): Promise<any>;
        sendToLobby(lobby: { id: string } | string, data: any): Promise<any>;
        disconnectFromLobby(lobby: { id: string } | string): Promise<any>;
        updateLobbyMember(
            lobby: { id: string } | string,
            user: { id: string } | string,
            metadata: any
        ): Promise<any>;

        subscribe(
            event: string,
            args?: Record<string, unknown>
        ): Promise<Subscription>;

        request<Response = any>(
            cmd: string,
            args?: Record<string, unknown>,
            event?: string
        ): Promise<Response>;

        destroy(): Promise<void>;

        on<Data = any>(
            event: "ready" | "connected" | RPCEvents,
            listener: (data?: Data) => void
        ): this;
        once(event: "ready" | "connected", listener: () => void): this;
        off(event: "ready" | "connected", listener: () => void): this;
    }

    export interface RPCClientOptions {
        transport: "ipc" | "websocket";
    }

    export interface RPCLoginOptions {
        clientId: string;
        clientSecret?: string | undefined;
        accessToken?: string | undefined;
        rpcToken?: string | undefined;
        tokenEndpoint?: string | undefined;
        scopes?: string[] | undefined;
    }

    export interface Guild {
        id: string;
        name: string;
        icon_url?: string | undefined;
        members?: any[] | undefined;
    }

    export interface Subscription {
        unsubscribe(): Promise<boolean>;
    }

    export interface VoiceState {
        nick: string;
        mute: boolean;
        volume: number;
        pan: { left: number; right: number };
        voice_state: {
            mute: boolean;
            deaf: boolean;
            self_mute: boolean;
            self_deaf: boolean;
            suppress: boolean;
        };
        user: {
            id: string;
            username: string;
            discriminator: string;
            avatar: string;
            bot: boolean;
            flags: number;
            premium_type: number;
        };
    }

    export interface Channel {
        id: string;
        name: string;

        /**
         * Guild text: 0, Guild voice: 2, DM: 1, Group DM: 3
         */
        type: number;

        guild_id?: string | undefined;

        /**
         * (text)
         */
        topic?: string | undefined;

        /**
         * (voice)
         */
        bitrate?: number | undefined;

        /**
         * (voice) 0 if none
         */
        user_limit?: number | undefined;

        /**
         * (text)
         */
        position?: number | undefined;

        /**
         * (voice) https://discordapp.com/developers/docs/resources/voice#voice-state-object
         */
        voice_states?: VoiceState[];

        /**
         * (text) https://discordapp.com/developers/docs/resources/channel#message-object
         */
        messages?: any[];
    }

    export interface CertifiedDevice {
        type: "audioinput" | "audiooutput" | "videoinput";
        uuid: string;
        vendor: { name: string; url: string };
        model: { name: string; url: string };
        related: string[];
        echoCancellation?: boolean | undefined;
        noiseSuppression?: boolean | undefined;
        automaticGainControl?: boolean | undefined;
        hardwareMute?: boolean | undefined;
    }

    export interface UserVoiceSettings {
        id: string;
        pan?: { left: number; right: number } | undefined;
        volume?: number | undefined;
        mute?: boolean | undefined;
    }

    export interface VoiceSettings {
        automaticGainControl: boolean;
        echoCancellation: boolean;
        noiseSuppression: boolean;
        qos: boolean;
        silenceWarning: boolean;
        deaf: boolean;
        mute: boolean;
        input?:
            | {
                  device: string;
                  volume: number;
              }
            | undefined;
        output?:
            | {
                  device: string;
                  volume: number;
              }
            | undefined;
        mode?:
            | {
                  autoThreshold: boolean;
                  threshold: number;
                  shortcut: Array<{ type: number; code: number; name: string }>;
                  delay: number;
              }
            | undefined;
    }

    export interface Presence {
        state?: string | undefined;
        details?: string | undefined;
        startTimestamp?: number | Date | undefined;
        endTimestamp?: number | Date | undefined;
        largeImageKey?: string | undefined;
        largeImageText?: string | undefined;
        smallImageKey?: string | undefined;
        smallImageText?: string | undefined;
        instance?: boolean | undefined;
        partyId?: string | undefined;
        partySize?: number | undefined;
        partyMax?: number | undefined;
        matchSecret?: string | undefined;
        spectateSecret?: string | undefined;
        joinSecret?: string | undefined;
        buttons?: Array<{ label: string; url: string }> | undefined;
    }

    export type RPCCommands =
        | "DISPATCH"
        | "AUTHORIZE"
        | "AUTHENTICATE"
        | "GET_GUILD"
        | "GET_GUILDS"
        | "GET_CHANNEL"
        | "GET_CHANNELS"
        | "CREATE_CHANNEL_INVITE"
        | "GET_RELATIONSHIPS"
        | "GET_USER"
        | "SUBSCRIBE"
        | "UNSUBSCRIBE"
        | "SET_USER_VOICE_SETTINGS"
        | "SET_USER_VOICE_SETTINGS_2"
        | "SELECT_VOICE_CHANNEL"
        | "GET_SELECTED_VOICE_CHANNEL"
        | "SELECT_TEXT_CHANNEL"
        | "GET_VOICE_SETTINGS"
        | "SET_VOICE_SETTINGS_2"
        | "SET_VOICE_SETTINGS"
        | "CAPTURE_SHORTCUT"
        | "SET_ACTIVITY"
        | "SEND_ACTIVITY_JOIN_INVITE"
        | "CLOSE_ACTIVITY_JOIN_REQUEST"
        | "ACTIVITY_INVITE_USER"
        | "ACCEPT_ACTIVITY_INVITE"
        | "INVITE_BROWSER"
        | "DEEP_LINK"
        | "CONNECTIONS_CALLBACK"
        | "BRAINTREE_POPUP_BRIDGE_CALLBACK"
        | "GIFT_CODE_BROWSER"
        | "GUILD_TEMPLATE_BROWSER"
        | "OVERLAY"
        | "BROWSER_HANDOFF"
        | "SET_CERTIFIED_DEVICES"
        | "GET_IMAGE"
        | "CREATE_LOBBY"
        | "UPDATE_LOBBY"
        | "DELETE_LOBBY"
        | "UPDATE_LOBBY_MEMBER"
        | "CONNECT_TO_LOBBY"
        | "DISCONNECT_FROM_LOBBY"
        | "SEND_TO_LOBBY"
        | "SEARCH_LOBBIES"
        | "CONNECT_TO_LOBBY_VOICE"
        | "DISCONNECT_FROM_LOBBY_VOICE"
        | "SET_OVERLAY_LOCKED"
        | "OPEN_OVERLAY_ACTIVITY_INVITE"
        | "OPEN_OVERLAY_GUILD_INVITE"
        | "OPEN_OVERLAY_VOICE_SETTINGS"
        | "VALIDATE_APPLICATION"
        | "GET_ENTITLEMENT_TICKET"
        | "GET_APPLICATION_TICKET"
        | "START_PURCHASE"
        | "GET_SKUS"
        | "GET_ENTITLEMENTS"
        | "GET_NETWORKING_CONFIG"
        | "NETWORKING_SYSTEM_METRICS"
        | "NETWORKING_PEER_METRICS"
        | "NETWORKING_CREATE_TOKEN"
        | "SET_USER_ACHIEVEMENT"
        | "GET_USER_ACHIEVEMENTS";

    export type RPCEvents =
        | "CURRENT_USER_UPDATE"
        | "GUILD_STATUS"
        | "GUILD_CREATE"
        | "CHANNEL_CREATE"
        | "RELATIONSHIP_UPDATE"
        | "VOICE_CHANNEL_SELECT"
        | "VOICE_STATE_CREATE"
        | "VOICE_STATE_DELETE"
        | "VOICE_STATE_UPDATE"
        | "VOICE_SETTINGS_UPDATE"
        | "VOICE_SETTINGS_UPDATE_2"
        | "VOICE_CONNECTION_STATUS"
        | "SPEAKING_START"
        | "SPEAKING_STOP"
        | "GAME_JOIN"
        | "GAME_SPECTATE"
        | "ACTIVITY_JOIN"
        | "ACTIVITY_JOIN_REQUEST"
        | "ACTIVITY_SPECTATE"
        | "ACTIVITY_INVITE"
        | "NOTIFICATION_CREATE"
        | "MESSAGE_CREATE"
        | "MESSAGE_UPDATE"
        | "MESSAGE_DELETE"
        | "LOBBY_DELETE"
        | "LOBBY_UPDATE"
        | "LOBBY_MEMBER_CONNECT"
        | "LOBBY_MEMBER_DISCONNECT"
        | "LOBBY_MEMBER_UPDATE"
        | "LOBBY_MESSAGE"
        | "CAPTURE_SHORTCUT_CHANGE"
        | "OVERLAY"
        | "OVERLAY_UPDATE"
        | "ENTITLEMENT_CREATE"
        | "ENTITLEMENT_DELETE"
        | "USER_ACHIEVEMENT_UPDATE"
        | "READY"
        | "ERROR";
}
