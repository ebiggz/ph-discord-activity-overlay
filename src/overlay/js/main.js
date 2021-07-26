Vue.component("user", {
    props: ["user", "viewedUser", "size"],
    template: `
        <div 
            class="user-container" 
            :class="[{ speaking: user.speaking }, { viewed: isViewed }, user.goblin]"
        >
            <img 
                :src="imageUrl"
                :style="{ height: avatarHeight }" 
            /> 
            <!-- <div>
                <h3>{{ user.nick }}</h3>
            </div> -->
        </div>`,
    computed: {
        imageUrl: function () {
            return `./goblins/${this.user.goblin}.png`;
        },
        isViewed: function () {
            return this.viewedUser === this.user.id;
        },
        avatarHeight: function () {
            const viewedIncrease = this.isViewed ? 0.15 * this.size : 0;
            return `${this.size + viewedIncrease}px`;
        },
    },
});

const app = new Vue({
    el: "#app",
    data: {
        message: "Hello Vue!",
        ws: new ReconnectingWebSocket(`ws://127.0.0.1:8923`, null, {
            automaticOpen: false,
        }),
        users: [],
        settings: {
            viewedUser: null,
            positionVertical: "bottom",
            positionHorizontal: "left",
            alignment: "horizontal",
            size: 65,
        },
    },
    created: function () {
        this.ws.onopen = function () {
            console.log(`Connection is opened on port 8923...`);
        };

        this.ws.onmessage = (event) => {
            if (event && event.data) {
                const data = JSON.parse(event.data);
                if (data && data.event === "STATE_UPDATE") {
                    this.users = data.users;
                    console.log(`STATE_UPDATE`, data.users);
                }
                if (data && data.event === "SETTINGS_UPDATE") {
                    this.settings = data.settings;
                    console.log(`SETTINGS_UPDATE`, data.settings);
                }
            }
        };

        this.ws.open(false);
    },
});
