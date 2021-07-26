import { app } from "electron";
import log from "electron-log";
import AutoLaunch from "auto-launch";
import isDev from "electron-is-dev";
import { appManager } from "./AppManager";
import { discordManager } from "./DiscordManager";
import { webServerManager } from "./WebServerManager";
import { settingsManager } from "./SettingsManager";
import { updateManager } from "./UpdateManager";
import { copyOverlayWrapperToUserDataFolder } from "./utils";

log.info("PH Voice Activity starting...");

(function start() {
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
        log.info("Another instance is already running. Quitting...");
        app.quit();
        return;
    }

    // Needed on macOS
    app.dock?.hide();

    app.whenReady().then(() => {
        copyOverlayWrapperToUserDataFolder();

        appManager.setTray();

        webServerManager.start();

        discordManager.connect();

        if (!isDev) {
            updateManager.checkForUpdate();

            if (settingsManager.get("launchOnStartup")) {
                const autoLaunch = new AutoLaunch({
                    name: "PH Voice Overlay",
                });

                autoLaunch
                    .isEnabled()
                    .then((isEnabled) => {
                        if (!isEnabled) autoLaunch.enable();
                    })
                    .catch(() => log.info("Couldn't enable auto-launch."));
            }
        }
    });

    app.on("window-all-closed", () => {
        /* do nothing */
    });
})();
