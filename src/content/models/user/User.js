class User {
    constructor({userName, userUrl, online, lock } = {}) {
        this.userName = userName;
        this.userUrl = userUrl;
        this.online = online;
        this.lock = lock;
    }
}
