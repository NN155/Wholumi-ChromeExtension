async function parseFetch(url) {
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    const htmlDocument = parser.parseFromString(text, 'text/html');
    return htmlDocument;
}
