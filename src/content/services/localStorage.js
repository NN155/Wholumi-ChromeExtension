const STORAGE_KEY = 'requestCount';
const GET_STORAGE_KEY = 'getRequestCount';

class LocalStorageFactory {
    static save() { }
    static load() { }

    static calculateDelay(count, data) {
        return LocalStorageProcess.calculateDelay({ count, data });
    }
}

class LocalStorageService extends LocalStorageFactory {
    static storageKey = STORAGE_KEY;

    static save() {
        const existingData = this._getData();
        existingData.push({
            timestamp: Date.now()
        });


        localStorage.setItem(this.storageKey, JSON.stringify(existingData));
    }

    static load() {
        let existingData = this._getData();

        const freshData = LocalStorageProcess.clean(existingData);

        localStorage.setItem(this.storageKey, JSON.stringify(freshData));

        return freshData;
    }

    static _getData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    static getRequestCount() {
        const data = this.load();
        return data.length;
    }
}

class GetRequestStorageService extends LocalStorageFactory {
    static storageKey = GET_STORAGE_KEY;

    static save(url) {
        const existingData = this._getData();
        const clearUrl = this._cleanUrl(url);
        if (!existingData[clearUrl]) {
            existingData[clearUrl] = [];
        }
        existingData[clearUrl].push({
            timestamp: Date.now()
        });

        localStorage.setItem(this.storageKey, JSON.stringify(existingData));

    }

    static load(url) {
        const existingData = this._getData();
        url = this._cleanUrl(url);

        if (!existingData[url]) {
            return [];
        }

        const data = existingData[url];

        const freshData = LocalStorageProcess.clean(data);

        existingData[url] = freshData;
        localStorage.setItem(this.storageKey, JSON.stringify(existingData));

        return freshData;
    }

    static _getData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {};
    }

    static _cleanUrl(url) {
        const urlObj = new URL(url, window.location.origin);
        return urlObj.pathname;
    }

    static clear() {
        const existingData = this._getData();
        for (const key in existingData) {
            const data = this.load(key);
            if (data.length === 0) {
                delete existingData[key];
            }
        }
        localStorage.setItem(this.storageKey, JSON.stringify(existingData));
    }
}

class LocalStorageProcess {
    static time = 1 * 60 * 1000; // 1 minute

    static clean(data) {
        const currentTime = Date.now();

        let index = 0;
        while (index < data.length && currentTime - data[index].timestamp > this.time) {
            index++;
        }

        const freshData = data.slice(index);
        return freshData;
    }

    static calculateDelay({ count, data }) {
        const currentTime = Date.now();
        const dataLength = data.length;
        let index = 0;
        if (dataLength > count) {
            index = dataLength - count;
        }
        const delay = (data[index].timestamp + this.time) - currentTime;
        return Math.max(0, delay);

    }
}

GetRequestStorageService.clear();
console.log("RequestCount: ", LocalStorageService.getRequestCount());