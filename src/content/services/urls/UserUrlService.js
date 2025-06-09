/**
 * Service for user-related URLs
 */
class UserUrlService {
    static user = new User();
    
    /**
     * Get current user URL
     * @returns {string|null} - User URL
     */
    static getMyUrl() {
        if (this.user?.userUrl) {
            return this.user.userUrl;
        }
        
        const link = document.querySelector(".lgn__btn-profile");
        if (!link) return null;
    
        this.user.userUrl = link.getAttribute("href");
        
        return this.user.userUrl;
    }
    
    /**
     * Get current username
     * @returns {string|null} - Username
     */
    static getMyName() {
        if (this.user?.username) return this.user.username;

        this.getMyUrl();

        return this.user.username;
    }
    
    /**
     * Get URL for specific user
     * @param {string} username - Username
     * @returns {string} - User URL
     */
    static getUserUrl(username) {
        return `/user/${username}/`;
    }
    

    /**
     * Get user ID from URL
     * @param {string} url - URL to extract ID from
     * @returns {string|null} - User ID
     */
    static getUsername(url) {
        const match = url.match(/\/user\/([^/]+)\//);
        return match ? match[1] : null;
    }

    /**
     * Check if current page belongs to current user
     * @param {string} url - URL to check
     * @returns {boolean} - True if it's current user's page
     */
    static isMyPage(url = window.location.href) {
        const name = this.getMyName();
        if (!name) return false;
        
        const regex = new RegExp(`/user/(${name.toLowerCase()})($|/)`, 'i');
        return regex.test(url.toLowerCase());
    }
    
    /**
     * Get club ID of current user
     * @returns {string|null} - Club ID
     */
    static getClubId() {
        if (this._clubId) {
            return this._clubId;
        }
        
        const menu = document.querySelector(".lgn__inner");
        if (!menu) return null;
        
        const urls = menu.querySelectorAll("a");
        const urlsArray = Array.from(urls);
        
        for (const element of urlsArray) {
            if (element.href.includes("/clubs/")) {
                this._clubId = element.href.match(/\/clubs\/(\d+)\//)?.[1];
                return this._clubId;
            }
        }
        
        return null;
    }
    
    /**
     * Validate if user exists
     * @param {string} username - Username to validate
     * @returns {Promise<string|null>} - Validated username or null
     */
    static async validateUser(username) {
        try {
            const response = await fetch(this.getUserUrl(username));
            
            if (response.status === 404) {
                return null;
            }
            
            const text = await response.text();
            const parser = new DOMParser();
            const dom = parser.parseFromString(text, "text/html");
            const user = dom.querySelector(".usn__name h1")?.textContent.trim();
            
            return user || null;
        } catch (error) {
            console.error("Error validating user:", error);
            return null;
        }
    }
}