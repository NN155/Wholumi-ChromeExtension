async function AutoLogin () {
    AutoLoginService = new AutoLoginService();
    await AutoLoginService.init();
    if (AutoLoginService.autoLogin && AutoLoginService.isLogout() && dle_login_hash) {
        await AutoLoginService.login();
    }
}

class AutoLoginService {
    constructor() {
        this.autoLogin;
    }
    
    async init() {
        const { autoLogin } = await ExtensionConfig.getConfig("functionConfig");
        this.autoLogin = autoLogin;
    }

    isLogout(dom = document) {
        const element = dom.querySelector(".header__btn.btn.js-show-login");
        if (!element) {
            return false;
        }
        const lock = element.querySelector(".fal.fa-lock");
        return lock;
    }

    async login() {
        const {username, password} = await ExtensionConfig.get("userConfig");
        const dom = await FetchService.login({username, password})
        if (this.isLogout(dom)) {
            DLEPush.error("Wrong username/password or server timeout. Auto login has been turned off", "Login failed", 5000);
            ExtensionConfig.setConfig("functionConfig", { autoLogin: false });
        } else {
            window.location.reload();
        }
    }

}

AutoLogin();
