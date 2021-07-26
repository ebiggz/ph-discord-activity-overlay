import { app } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import AutoLaunch from "auto-launch";
import isDev from "electron-is-dev";
import { appManager } from "./AppManager";
import { TrayMenu } from "./TrayMenu";
import { discordManager } from "./DiscordManager";
import { webServerManager } from "./WebServerManager";
import { settingsManager } from "./SettingsManager";

autoUpdater.logger = log;
(autoUpdater.logger as typeof log).transports.file.level = "info";

log.info("PH Voice Activity starting...");

(function start() {
    // ensure only a single instance of the app runs
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
        app.quit();
        return;
    }

    //needed on mac
    app.dock?.hide();

    app.whenReady().then(() => {
        webServerManager.start();

        appManager.setTray(new TrayMenu());

        if (!isDev) {
            autoUpdater.checkForUpdates();

            // setInterval(() => {
            //     autoUpdater.checkForUpdates();
            // }, 60 * 60 * 1000  /* every hour */);

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

        discordManager.connect();
    });

    app.on("window-all-closed", () => {
        /* do nothing */
    });

    autoUpdater.on("checking-for-update", () => {
        log.info("Checking for updates...");
    });

    autoUpdater.on("update-available", (info) => {
        log.info("Update available!", info);
    });

    autoUpdater.on("update-not-available", (info) => {
        log.info("Update not available.", info);
    });

    autoUpdater.on("error", (err) => {
        log.error("Update error", err);
    });

    autoUpdater.on("download-progress", (progressObj) => {
        log.info("Update progress", progressObj);
    });

    autoUpdater.on("update-downloaded", (info) => {
        log.info("Update downloaded!", info);
        autoUpdater.quitAndInstall();
    });
})();
