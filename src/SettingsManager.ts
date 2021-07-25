import electron from "electron";
import path from "path";
import { JsonDB } from "node-json-db";
import { TypedEmitter } from "tiny-typed-emitter";
import { HOARDERS } from "./constants";

const defaultSettings = {
    viewedUser: HOARDERS[0].id,
    positionVertical: "bottom",
    positionHorizontal: "left",
    alignment: "horizontal",
};

type Settings = {
    [Setting in keyof typeof defaultSettings]?: typeof defaultSettings[Setting];
};

class SettingsManager extends TypedEmitter<{
    settingsUpdated: (settings: Required<Settings>) => void;
}> {
    private settings: Settings = {};

    private db: JsonDB;

    constructor() {
        super();
        this.settings = {};
        const appDataPath = (electron.app || electron.remote.app).getPath(
            "userData"
        );
        const jsonDbPath = path.join(appDataPath, "settings");
        this.db = new JsonDB(jsonDbPath, true, true);
        this.settings = this.db.getData("/") || {};
        this.emit("settingsUpdated", this.getAll());
    }

    set<K extends keyof Settings>(key: K, value: Required<Settings>[K]) {
        this.settings[key] = value;
        this.db.push("/", this.settings);
        this.emit("settingsUpdated", this.getAll());
    }

    get(key: keyof Settings) {
        return this.settings[key] ?? defaultSettings[key];
    }

    getAll(): Required<Settings> {
        return {
            ...defaultSettings,
            ...this.settings,
        };
    }
}

export const settingsManager = new SettingsManager();
