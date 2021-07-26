import { app, Tray, Menu, nativeImage, dialog } from "electron";
import log from "electron-log";
import path from "path";
import prompt from "electron-prompt";
import isDev from "electron-is-dev";
import { HOARDERS } from "./constants";
import { settingsManager } from "./SettingsManager";

export class TrayMenu {
    public readonly tray: Tray;

    constructor() {
        this.tray = new Tray(this.createNativeImage());
        this.tray.setContextMenu(this.createMenu());
        this.tray.setToolTip("PH Voice Overlay");
    }

    createNativeImage() {
        const iconPath =
            process.platform === "win32"
                ? `${!isDev ? '/dist' : ''}/assets/iconTemplateWin.png`
                : "/assets/iconTemplate.png";
        const imagePath = path.join(app.getAppPath(), iconPath);
        log.info(imagePath);
        const image = nativeImage.createFromPath(imagePath);
        image.setTemplateImage(true);
        return image;
    }

    createMenu(): Menu {
        const contextMenu = Menu.buildFromTemplate([
            {
                label: "Show Overlay URL",
                type: "normal",
                click: () => {
                    prompt({
                        title: "URL for Browser Source",
                        label: "Copy URL:",
                        value: "http://localhost:8923/overlay/",
                        inputAttrs: {
                            type: "url",
                            disabled: true as any,
                        },
                        type: "input",
                    })
                        .then(() => {})
                        .catch(() => {})
                        .finally(() => {
                            dialog.showMessageBox({
                                title: "Info",
                                message: "Make sure to set the Browser Source dimensions to the same as your stream canvas (ie 1280x720)"
                            });
                        });
                },
            },
            {
                label: "Set User View",
                toolTip: "Set which user the stream is seeing the view of",
                submenu: HOARDERS.map((h) => ({
                    label: h.label,
                    type: "radio",
                    checked: settingsManager.get("viewedUser") === h.id,
                    click: () => {
                        settingsManager.set("viewedUser", h.id);
                    },
                })),
            },
            {
                label: "Avatar Position",
                submenu: [
                    {
                        label: "Top Left",
                        type: "radio",
                        checked:
                            settingsManager.get("positionVertical") === "top" &&
                            settingsManager.get("positionHorizontal") ===
                                "left",
                        click: () => {
                            settingsManager.set("positionVertical", "top");
                            settingsManager.set("positionHorizontal", "left");
                        },
                    },
                    {
                        label: "Top Right",
                        type: "radio",
                        checked:
                            settingsManager.get("positionVertical") === "top" &&
                            settingsManager.get("positionHorizontal") ===
                                "right",
                        click: () => {
                            settingsManager.set("positionVertical", "top");
                            settingsManager.set("positionHorizontal", "right");
                        },
                    },
                    {
                        label: "Bottom Left",
                        type: "radio",
                        checked:
                            settingsManager.get("positionVertical") ===
                                "bottom" &&
                            settingsManager.get("positionHorizontal") ===
                                "left",
                        click: () => {
                            settingsManager.set("positionVertical", "bottom");
                            settingsManager.set("positionHorizontal", "left");
                        },
                    },
                    {
                        label: "Bottom Right",
                        type: "radio",
                        checked:
                            settingsManager.get("positionVertical") ===
                                "bottom" &&
                            settingsManager.get("positionHorizontal") ===
                                "right",
                        click: () => {
                            settingsManager.set("positionVertical", "bottom");
                            settingsManager.set("positionHorizontal", "right");
                        },
                    },
                ],
            },
            {
                label: "Avatar Alignment",
                submenu: [
                    {
                        label: "Vertical",
                        type: "radio",
                        checked:
                            settingsManager.get("alignment") === "vertical",
                        click: () => {
                            settingsManager.set("alignment", "vertical");
                        },
                    },
                    {
                        label: "Horizontal",
                        type: "radio",
                        checked:
                            settingsManager.get("alignment") === "horizontal",
                        click: () => {
                            settingsManager.set("alignment", "horizontal");
                        },
                    },
                ],
            },
            {
                label: "About",
                role: "about",
            },
            {
                label: "Quit",
                role: "quit",
            },
        ]);
        return contextMenu;
    }
}
