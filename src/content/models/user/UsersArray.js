class UsersArray extends Array {
    getOnlineUsers() {
        return this.filter(user => user.online);
    }

    getUnlockedUsers() {
        return this.filter(user => user.lock === "unlock");
    }

    unique() {
        const uniqueUsers = new Set();
        const users = new UsersArray();
        this.forEach(user => {
            if (!uniqueUsers.has(user.username)) {
                uniqueUsers.add(user.username);
                users.push(user);
            }
        });
        return users;
    }
}