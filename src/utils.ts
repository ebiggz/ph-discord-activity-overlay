import path from "path";
import { app } from "electron";
import fs from "fs";

export function copyOverlayWrapperToUserDataFolder() {
    const sourcePath = path.join(__dirname, "/overlay/overlay.html");
    const destPath = path.join(app.getPath("userData"), "overlay.html");
    fs.writeFileSync(destPath, fs.readFileSync(sourcePath));
}
