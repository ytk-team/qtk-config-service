const subscribers = new Set();

module.exports = class {
    static add(socket) {
        subscribers.add(socket);
    }

    static remove(socket) {
        subscribers.remove(socket);
    }

    static retrieveAll() {
        return subscribers;
    }
}