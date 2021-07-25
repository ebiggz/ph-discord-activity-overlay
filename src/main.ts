import { app } from "electron";
import AutoLaunch from "auto-launch";
import { appManager } from "./AppManager";
import { TrayMenu } from "./TrayMenu";
import { discordManager } from "./DiscordManager";

app.dock?.hide();

app.whenReady().then(() => {
    appManager.setTray(new TrayMenu());

    const autoLaunch = new AutoLaunch({
        name: "PH Voice Activity Overlay",
        path: app.getPath("exe"),
    });

    autoLaunch
        .isEnabled()
        .then((isEnabled) => {
            if (!isEnabled) autoLaunch.enable();
        })
        .catch(() => console.log("Couldn't auto-launch."));

    discordManager.connect();
});

app.on("window-all-closed", () => {
    // do nothing
});
