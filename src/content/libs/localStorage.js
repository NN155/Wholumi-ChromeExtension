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
    const freshData = existingData.filter(item => (currentTime - item.timestamp) <= 1 * 60 * 1000); 

    localStorage.setItem(STORAGE_KEY, JSON.stringify(freshData));

    return freshData.map(item => item.data); 
}



console.log("RequestCount: ",loadFromLocalStorage().length);