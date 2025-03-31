class UsersArray extends Array {
    getOnlineUsers() {
        return this.filter(user => user.online);
    }

    getUnlockedUsers() {
        return this.filter(user => user.lock === "unlock");
    }
}