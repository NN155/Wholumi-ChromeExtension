class GraphSearch {
    constructor() {
        this.graph;
    }

    async loadData(rank) {
        const data = await ExtensionConfig.loadConfig("dataConfig", [`cards-data-${rank}-rank`]);
        this.graph = data[`cards-data-${rank}-rank`];
    }
    need(startIds, finishId) {
        const [paths, passed] = this.bfs(startIds, finishId);
        const pathsMap = this.splitPath(paths);
        const newPaths = this.discoverMap(passed, pathsMap);
        const finalPaths = [...paths, ...newPaths];
        return finalPaths
    }

    bfs(startIds, finishId) {
        const resultPaths = [];
        const queue = startIds.map(id => ({ ids: [id], names: [this.graph[id]?.name] }));
        const visited = new Set(startIds);
        const passed = [];

        while (queue.length > 0) {
            const path = queue.shift();
            const lastId = path.ids[path.ids.length - 1];

            if (lastId === finishId) {
                resultPaths.push({ ids: [...path.ids], names: path.names });
                continue;
            }

            if (!this.graph[lastId]) continue;

            for (const neighborId in this.graph[lastId].cards) {
                const names = this.graph[lastId].cards[neighborId];
                const newPath = {
                    ids: [...path.ids, neighborId],
                    names: [...path.names, names]
                };

                if (neighborId === finishId) {
                    resultPaths.push(newPath);
                    continue;
                }
                if (!path.ids.includes(neighborId) && !visited.has(neighborId)) {
                    queue.push(newPath);
                    visited.add(neighborId);
                } else if (!path.ids.includes(neighborId)) {
                    passed.push(newPath);
                }
            }
        }

        return [resultPaths, passed];
    }

    splitPath(paths) {
        const pathsMap = {};
        for (let path of paths) {
            const { ids, names } = path;
            for (let index = 0; index < ids.length - 1; index++) {
                const id = ids[index];
                if (!pathsMap[id]) {
                    pathsMap[id] = [];
                }
                pathsMap[id].push({ ids: ids.slice(index), names: names.slice(index) });
            }
        }
        return pathsMap;
    }

    discoverMap(passed, pathsMap) {
        const results = [];
        for (let path of passed) {
            const { ids, names } = path;
            const lastId = ids[ids.length - 1];

            if (pathsMap[lastId]) {
                for (let mappedPath of pathsMap[lastId]) {
                    const { ids: mappedIds, names: mappedNames } = mappedPath;
                    results.push({ ids: [...ids, ...mappedIds.slice(1)], names: [...names, ...mappedNames.slice(1)] });
                }
            }
        }
        return results;
    }
}

(async () => {

    const graph = new GraphSearch();
    await graph.loadData("s");

    const finishNode = "7554";
    const startNodes = ['5967'];


    const paths = graph.need(startNodes, finishNode);
    

    console.log(paths);
    const {ids, names} = paths[0];
    for (let index = 0; index < ids.length; index++) {
        console.log("https://animestars.org/" + UrlConstructor.getCardUrl(ids[index]), UrlConstructor.getUserUrl(names[index]));

    }
});