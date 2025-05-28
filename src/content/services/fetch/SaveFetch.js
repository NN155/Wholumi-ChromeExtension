let saveFetchConfig = {
    delay: {
        min: 75,
    },
    requestLimit: {
        max: 300,
        average: 250,
        preMin: 50,
        min: 0,
    },
    threadCount: {
        max: 30,
        preMax: 10,
        preMin: 4,
        min: 1,
    }
}

class Semaphore {
    constructor(max = 1) {
        this.max = Math.max(1, max);
        this.count = 0;
        this.queue = [];
    }

    async acquire() {
        if (this.count < this.max) {
            this.count++;
            return Promise.resolve();
        }

        return new Promise(resolve => this.queue.push(resolve));
    }

    release() {
        this.count--;
        if (this.queue.length > 0) {
            const resolve = this.queue.shift();
            resolve();
            this.count++;
        }
    }
}

class DynimicSemaphore extends Semaphore {
    constructor(max = 1) {
        super(max);
        this.semaphore = new Semaphore(1);
    }

    async acquire() {
        if (this.count < this.max) {
            this.count++;
            return Promise.resolve();
        }

        return new Promise(resolve => this.queue.push(resolve));
    }
    _release() {
        this.count--;
        while (this.count < this.max && this.queue.length > 0) {
            const resolve = this.queue.shift();
            resolve();
            this.count++;
        }
    }

    async _releaseAndControllMax() {
        await this.controllMax();
        this._release();
    }

    async release() {
        this.controllSystem(this._releaseAndControllMax.bind(this));
    }

    async controllMax() {
        const requestCount = LocalStorageService.getRequestCount();

        if (requestCount >= saveFetchConfig.requestLimit.max - 5) { // 300
            this.setMax(saveFetchConfig.threadCount.min); // 1
        } else if (requestCount >= saveFetchConfig.requestLimit.max - 15) {
            this.setMax(saveFetchConfig.threadCount.preMin); // 4
        } else if (requestCount >= saveFetchConfig.requestLimit.preMin) { // 50
            this.setMax(saveFetchConfig.threadCount.preMax); // 10
        } else {
            this.setMax(saveFetchConfig.threadCount.max); // 30
        }
        if (requestCount % 5 === 0) {
            console.log(`Request count: ${requestCount}, max: ${this.max}`);
        }
    }

    setMax(max) {
        this.max = Math.max(1, max);
    }

    async controllSystem(callback) {
        await this.semaphore.acquire();

        try {
            await callback();
        }
        catch (error) {
            console.error('Error:', error);
        }
        finally {
            this.semaphore.release();
        }
    }
}

const dynimicSemaphore = new DynimicSemaphore(3);

class SaveFetchService {
    static isClubBoostPage = /\/clubs\/[^/]+\/boost/.test(window.location.pathname);
    static showError = true;
    static errorTimeout = 5000;
    static errorTimer = null;

    static async fetch(url, options = {}) {
        await this._beforeFetch();
        try {
            const response = await fetch(url, options);
            this.showError && this._checkStatus(response);
            return response;
        }
        catch (error) {
            console.error(`Error fetching:`, error);
            throw error;
        }
        finally {
            await this._finnalyFetch();
        }
    }

    static async _delay(requestCount) {
        if (requestCount > saveFetchConfig.requestLimit.max - 1) { // 300
            let requests = LocalStorageService.load();
            let delay = LocalStorageService.calculateDelay(saveFetchConfig.requestLimit.max, requests);
            let cacheCount = saveFetchConfig.requestLimit.max;
            let bool = false;
            let timeout = setTimeout(() => {
                bool = true;
            }, delay);
            while (requests.length > saveFetchConfig.requestLimit.max && !bool) { // 300
                if (cacheCount !== saveFetchConfig.requestLimit.max) {
                    cacheCount = saveFetchConfig.requestLimit.max;
                    clearTimeout(timeout);
                    requests = LocalStorageService.load();
                    delay = LocalStorageService.calculateDelay(saveFetchConfig.requestLimit.max, requests);
                    timeout = setTimeout(() => {
                        bool = true;
                    }, delay);
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            };
            clearTimeout(timeout);
        }
        await new Promise(resolve => setTimeout(resolve, saveFetchConfig.delay.min)); // 75
    }

    static async _beforeFetch() {
        await dynimicSemaphore.acquire();

        const requestCount = LocalStorageService.getRequestCount();

        LocalStorageService.save()

        await this._delay(requestCount);
    }

    static async _finnalyFetch() {
        dynimicSemaphore.release();
    }

    static _checkStatus(response) {
        if (response.status === 520 || response.status === 502) {
            if (!this.errorTimer) {
                this.errorTimer = Date.now() + this.errorTimeout;
                return this._showError(response.status);
            }
            if (this.errorTimer - Date.now() < 0) {
                this.errorTimer = Date.now() + this.errorTimeout;
                return this._showError(response.status);
            }
        }
    }

    static _showError(status) {
        if (status === 520) {
            this._showError520();
        } else if (status === 502) {
            this._showError502();
        }
    }

    static _showError520() {
        DLEPush.error("Your IP is temporary blocked by the server. Please change your IP.", "Error 520", 4500);
    }

    static _showError502() {
        DLEPush.error("The server is currently unavailable. Please try again later.", "Error 502", 4500);
    }
}