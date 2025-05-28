const STORAGE_KEY = 'requestCount';

class LocalStorageService {
    static storageKey = STORAGE_KEY;
    static time = 1 * 60 * 1000; // 1 minute

    static save() {
        const existingData = this._getData();
        existingData.push({
            timestamp: Date.now()
        });


        localStorage.setItem(this.storageKey, JSON.stringify(existingData));
    }

    static load() {
        let existingData = this._getData();

        const currentTime = Date.now();

        let index = 0;
        while (index < existingData.length && currentTime - existingData[index].timestamp > this.time) {
            index++;
        }

        const freshData = existingData.slice(index);

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
    
    static calculateDelay(count, data = null) {
        if (!data) {
            data = this.load();
        }

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

console.log("RequestCount: ", LocalStorageService.getRequestCount());