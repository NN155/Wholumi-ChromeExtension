class GraphsPaths {
    constructor({ paths, rank }) {
        this.paths = paths;
        this.rank = rank;
        this.data;
    }

    async initialize() {
        const config = await ExtensionConfig.getConfig("dataConfig", [`cards-data-${this.rank}-rank`]);
        this.data = config[`cards-data-${this.rank}-rank`];
    }

    buildPaths() {
        const paths = [];
        let pathNumber = 1;
        this.paths.forEach(path => {
            paths.push(this.createPath(path, pathNumber));
            pathNumber++;
        });
        const pathsElement = document.createElement("div");
        pathsElement.innerHTML = paths.map(path => path.outerHTML).join('');
        return pathsElement;
    }

    createPath(path, pathNumber) {
        const { ids, names } = path;
        const cards = [];
        for (let i = 0; i < ids.length; i++) {
            cards.push(this.createCard({ id: ids[i], names: names[i] }));
        }
        const pathElement = document.createElement("div");
        pathElement.innerHTML = `
        <div class="cards__path-number" style="display: flex; justify-content: center; padding-top: 15px; font-size: 20px; font-weight: bold;">Путь: ${pathNumber}</div>
        <div class="anime-cards__path" style="display: flex; justify-content: center; padding-top: 15px; padding-bottom: 30px; border-bottom: 1px solid rgb(162, 162, 162);">
        <div class="anime-cards__path-arrow" style="display: flex; justify-content: center; align-items: center; font-size: 30px; font-weight: bold; padding: 20px"> → </div>
        ${cards.map(card => card.outerHTML).join('')}
        <div class="anime-cards__path-arrow" style="display: flex; justify-content: center; align-items: center; font-size: 30px; font-weight: bold; padding: 20px"> ✓ </div>
        </div>
        `
        return pathElement;
    }

    createCard({ id, names }) {
        const card = document.createElement("div");
        card.innerHTML = `
            <div class="anime-cards__item-wrapper" style="width: auto;">
                <div class="anime-cards__item" data-id="${id}" data-image="${this.data[id].src}">
                    <div class="anime-cards__image">
                        <img loading="lazy" style="max-height:300px" class="anime-cards__image" src="${this.data[id].src}" alt="card"></img>
                    </div>
                    ${Array.isArray(names) ? names.map(name => `
                        <a href="${UrlConstructor.getUserUrl(name)}" style="display: block; text-align: center;">
                            ${name}
                        </a>
                    `).join('') : ''}
                </div>
            </div>
        `
        return card;
    }
}