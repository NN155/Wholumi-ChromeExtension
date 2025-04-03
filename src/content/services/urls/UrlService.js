/**
 * Core URL management service
 */
class UrlService {
    static baseUrl = '';
    
    /**
     * Create a complete URL with query parameters
     * @param {string} path - URL path
     * @param {Object} params - Query parameters
     * @returns {string} - Full URL
     */
    static buildUrl(path, params = {}) {
        const url = new URL(path, window.location.origin);
        
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.append(key, value);
            }
        });
        
        return url.toString();
    }
    
    /**
     * Extract parameters from URL
     * @param {string} url - URL to parse
     * @returns {URLSearchParams} - URL search params
     */
    static getParams(url = window.location.href) {
        const urlObj = new URL(url, window.location.origin);
        return urlObj.searchParams;
    }
    
    /**
     * Extract path parameter by pattern
     * @param {string} url - URL to parse
     * @param {RegExp} pattern - Regex pattern with capture group
     * @returns {string|null} - Extracted parameter or null
     */
    static extractParam(url, pattern) {
        const match = url.match(pattern);
        return match ? match[1] : null;
    }
}