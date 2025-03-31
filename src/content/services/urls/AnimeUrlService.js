class AnimeUrlService {
    static getAnimeId(url) {
        return UrlService.extractParam(url, /\/aniserials\/video\/[^\/]+\/(\d+)-/);
    }
}