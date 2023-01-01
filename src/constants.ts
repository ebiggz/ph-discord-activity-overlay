import isDev from "electron-is-dev";

export const CLIENT_ID = "867980870714265690";
export const CLIENT_SECRET = "i5N0t5bqaWVAdI5EdUS55qprpgsQZuZL";
export const SCOPES = ["rpc"];
export const REDIRECT_URI = "http://127.0.0.1";

export const POTION_HOARDERS_SERVER_ID = "858871124027637772";

export const HOARDERS = [
    {
        id: "90604630815301632",
        goblin: "mage",
        label: "Mage",
    },
    {
        id: "403033217730609170",
        goblin: "tophat",
        label: "Phantom",
    },
    {
        id: "90668336777547776",
        goblin: "knight",
        label: "StormTheBard",
    },
    {
        id: "116635278935982083",
        goblin: "shades",
        label: "Nos",
    },
    {
        id: "125411922681004032",
        goblin: "pirate",
        label: "Geigen",
    },
];

if (isDev) {
    HOARDERS.push({
        id: "197161112892866560",
        goblin: "basic",
        label: "ebiggz",
    });
}
