var multiplayerStates = {
    disconnected: 0,
    connected: 1,
    playing: 2,
    waiting: 3
};

class MultiplayerStateManager {
    constructor(dataConnection) {
        this.MultiplayerState = multiplayerStates.waiting;
        this.dataConnection = dataConnection;
        dataConnection.on("open", function () {
            MultiplayerState = multiplayerStates.connected;
            var event = Event("connected");
            dispatchEvent(event);
        });
        dataConnection.on("close", function () {
            MultiplayerState = multiplayerStates.disconnected;
            var event = Event("closed");
            dispatchEvent(event);
        });
        dataConnection.on("error", function () {
            MultiplayerState = multiplayerStates.disconnected;
            dataConnection.close();
            var event = Event("closed");
            dispatchEvent(event);
        });
    }
}