import { TrayMenu } from "./TrayMenu";

class AppManager {
    private trayMenu!: TrayMenu;

    setTray(tray: TrayMenu): void {
        this.trayMenu = tray;
    }

    getTray(): TrayMenu {
        return this.trayMenu;
    }
}

export const appManager = new AppManager();
