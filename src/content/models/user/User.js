class User {
    constructor({username, userUrl, online, lock } = {}) {
        this._username = username;
        this._userUrl = userUrl;
        this.online = online;
        this.lock = lock;
    }

    get username() {
        return this._username || (this._userUrl ? UrlConstructor.getUsername(this._userUrl) : null);
    }

    set username(username) {
        this._username = username;
    }

    get userUrl() {
        return this._userUrl || (this._username ? UrlConstructor.getUserUrl(this._username) : null);
    }

    set userUrl(userUrl) {
        this._userUrl = userUrl;
    }
}
