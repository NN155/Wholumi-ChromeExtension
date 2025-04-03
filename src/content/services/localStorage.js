const STORAGE_KEY = 'requestCount';

function saveToLocalStorage() {
    const existingData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    existingData.push({
        timestamp: Date.now()
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
}

function loadFromLocalStorage() {
    let existingData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    const currentTime = Date.now();

    let index = 0;
    while (index < existingData.length && currentTime - existingData[index].timestamp > 1 * 60 * 1000) {
        index++;
    }

    const freshData = existingData.slice(index);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(freshData));

    return freshData.map(item => item.data); 
}



console.log("RequestCount: ",loadFromLocalStorage().length);