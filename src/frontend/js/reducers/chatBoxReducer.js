const defaultState = {
    content: null,
    username: null,
    videoTime: null,
    timeStamp: null,
    messages: []
};

export default function reducer(state=defaultState, action){
    switch (action.type) {
        case "enterMessage":
            return Object.assign({}, state, {
                content: action.payload
            });
        case "receivedMessage":
            return Object.assign({}, state, {
                content: action.payload
            });
        case "updateChatBox":
            var newList = state.messages.slice(); // copy the array
            newList.push(action.payload);
            return Object.assign({}, state, {
                messages: newList
            });
        default:
            return state;
    }
}
