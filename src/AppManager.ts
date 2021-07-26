import { TrayMenu } from "./TrayMenu";

class AppManager {
    private trayMenu!: TrayMenu;

    setTray(): void {
        this.trayMenu = new TrayMenu();
    }

    getTray(): TrayMenu {
        return this.trayMenu;
    }
}

export const appManager = new AppManager();
