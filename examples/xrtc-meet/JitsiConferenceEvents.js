/**
 * Enumeration with the events for the conference.
 * @type {{string: string}}
 */
var JitsiConferenceEvents = {
    /**
     * A new media track was added to the conference.
     */
    TRACK_ADDED: "conference.trackAdded",
    /**
     * The media track was removed to the conference.
     */
    TRACK_REMOVED: "conference.trackRemoved",
    /**
     * The active speaker was changed.
     */
    ACTIVE_SPEAKER_CHANGED: "conference.activeSpeaker",
    /**
     * A new user joinned the conference.
     */
    USER_JOINED: "conference.userJoined",
    /**
     * A user has left the conference.
     */
    USER_LEFT: "conference.userLeft",
    /**
     * New text message was received.
     */
    MESSAGE_RECEIVED: "conference.messageReceived",
    /**
     * A user has changed it display name
     */
    DISPLAY_NAME_CHANGED: "conference.displayNameChanged",
    /**
     * A participant avatar has changed.
     */
    AVATAR_CHANGED: "conference.avatarChanged",
    /**
     * New connection statistics are received.
     */
    CONNECTION_STATS_RECEIVED: "conference.connectionStatsReceived",
    /**
     * The Last N set is changed.
     */
    LAST_N_ENDPOINTS_CHANGED: "conference.lastNEndpointsChanged",
    /**
     * You are included / excluded in somebody's last N set
     */
    IN_LAST_N_CHANGED: "conference.lastNEndpointsChanged",
    /**
     * A media track mute status was changed.
     */
    TRACK_MUTE_CHANGED: "conference.trackMuteChanged",
    /**
     * Audio levels of a media track was changed.
     */
    TRACK_AUDIO_LEVEL_CHANGED: "conference.audioLevelsChanged",
    /**
     * Indicates that the connection to the conference has been interrupted
     * for some reason.
     */
    CONNECTION_INTERRUPTED: "conference.connecionInterrupted",
    /**
     * Indicates that the connection to the conference has been restored.
     */
    CONNECTION_RESTORED: "conference.connecionRestored",
    /**
     * Indicates that conference has been joined.
     */
    CONFERENCE_JOINED: "conference.joined",
    /**
     * Indicates that conference has been left.
     */
    CONFERENCE_LEFT: "conference.left"
};

module.exports = JitsiConferenceEvents;
