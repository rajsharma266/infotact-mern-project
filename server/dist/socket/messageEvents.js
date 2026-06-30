"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChannelRoom = exports.MESSAGE_SOCKET_EVENTS = void 0;
exports.MESSAGE_SOCKET_EVENTS = {
    JOIN_CHANNEL: "channel:join",
    LEAVE_CHANNEL: "channel:leave",
    MESSAGE_CREATED: "message:created",
    MESSAGE_DELETED: "message:deleted",
};
const getChannelRoom = (channelId) => `channel:${channelId}`;
exports.getChannelRoom = getChannelRoom;
