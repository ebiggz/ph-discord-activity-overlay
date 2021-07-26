import { dialog } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import { TypedEmitter } from "tiny-typed-emitter";

autoUpdater.logger = log;
(autoUpdater.logger as typeof log).transports.file.level = "info";

class UpdateManager extends TypedEmitter<{
    updateReady: () => void;
}> {

    private manualCheck = false;

    updateReady = false;

    constructor() {
        super();

        autoUpdater.on("checking-for-update", () => {
            log.info("Checking for updates...");
        });
    
        autoUpdater.on("update-available", (info) => {
            log.info("Update available!", info);
            if(this.manualCheck) {
                dialog.showMessageBox({
                    title: "Update available!",
                    message: `Version ${info.version} is available. Download has begun and app will automatically restart when completed.`
                });
            }
        });
    
        autoUpdater.on("update-not-available", (info) => {
            log.info("Update not available.", info);
            if(this.manualCheck) {
                dialog.showMessageBox({
                    title: "Up-to-date",
                    message: `You are fully up-to-date!`
                });
            }
        });
    
        autoUpdater.on("error", (err) => {
            log.error("Update error", err);
        });
    
        autoUpdater.on("download-progress", (progressObj) => {
            log.info("Update progress", progressObj);
        });
    
        autoUpdater.on("update-downloaded", (info) => {
            log.info("Update downloaded!", info);
            this.updateReady = true;
            if(this.manualCheck) {
                autoUpdater.quitAndInstall();
            } else {
                this.emit("updateReady");
            }
        });
    }

    checkForUpdate(manualCheck = false) {
        this.manualCheck = manualCheck;
        if(this.manualCheck) {
            autoUpdater.checkForUpdates();
        } else {
            autoUpdater.checkForUpdatesAndNotify();
        }
    }

    installUpdate() {
        if(this.updateReady) {
            autoUpdater.quitAndInstall();
        }
    }
}

export const updateManager = new UpdateManager();