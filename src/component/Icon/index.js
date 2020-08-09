import React, { Component } from "react"
import PropTypes from 'prop-types'
import { icons } from "./svg"

export const ICONS = {
    ALERT_CIRCLE: 'alert-circle',
    ALERT_TRIANGLE: 'alert-triangle',
    ALERT: "alert",
    ARROW_DOWN_CIRCLE: "arrow-down-circle",
    ARROW_DOWN: "arrow-down",
    ARROW_LEFT_CIRCLE: "arrow-left-circle",
    ARROW_LEFT_DOUBLE_CIRCLE: "arrow-left-double-circle",
    ARROW_LEFT_DOUBLE: "arrow-left-double",
    ARROW_LEFT: "arrow-left",
    ARROW_RIGHT_CIRCLE: "arrow-right-circle",
    ARROE_RIGHT_DOUBLE_CIRCLE: "arrow-right-double-circle",
    ARROW_RIGHT_DOUBLE: "arrow-right-double",
    ARROW_RIGHT: "arrow-right",
    ARROW_UP_CIRCLE: "arrow-up-circle",
    ARROW_UP: "arrow-up",
    ATTACHMENT: "attachment",
    BADGE: "badge",
    BELL: "bell",
    CALANDER: "calander",
    CALENDAR: "calendar",
    CANCEL: "cancel",
    CHECK_CIRCLE: "check-circle",
    CHECK: "check",
    CIRCLE_ALERT: "circle-alert",
    CIRCLE_ARROW_DOWN: "circle-arrow-down",
    CIRCLE_ARROW_LEFT: "circle-arrow-left",
    CIRCLE_ARROW_RIGHT: "circle-arrow-right",
    CIRCLE_ARROW_UP: "circle-arrow-up",
    CIRCLE_CHECK: "circle-check",
    CIRCLE_CLOSE: "circle-close",
    CIRCLE_DOUBLE_ARROW_LEFT: "circle-double-arrow-left",
    CIRCLE_DOUBLE_ARROW_RIGHT: "circle-double-arrow-right",
    CIRCLE_MINUS: "circle-minus",
    CIRCLE_PLUS: "circle-plus",
    CLOCK: "clock",
    CLOSE_CIRCLE: "close-circle",
    CLOSE: "close",
    COMMENT_CLOSED: "comment-closed",
    COMMENT_NEW: "comment-new",
    COMMENT_OPEN: "comment-open",
    COMMENT: "comment",
    COPYRIGHT: "copyright",
    DOUBLE_ARROW_LEFT: "double-arrow-left",
    DOUBLE_ARROW_RIGHT: "double-arrow-right",
    DOWNLOAD: "download",
    EDIT: "edit",
    EMAIL: "email",
    EXPAND: "expand",
    FAVORITE: "favorite",
    EYE: "eye",
    INQUIRY: "inquiry",
    FILE: "file",
    FLAG: "flag",
    FOLDER: "folder",
    GLOBE: "globe",
    GROUP: "group",
    HELP: "help",
    HAMBURGER: "hamburger",
    HEART: "heart",
    HOME: "home",
    INFORMATION: "information",
    LAUNCHPAD: "launchpad",
    LAYERS: "layers",
    LAYOUT: "layout",
    LINK: "link",
    LIST: "list",
    LOCKED_LOCK: "locked-lock",
    LOCK_UNLOCK: "lock-unlock",
    LOCK: "lock",
    MINUS_CIRCLE: "minus-circle",
    MENU: "menu",
    MINUS: "minus",
    MONITOR: "monitor",
    MORE: "more",
    MOVE: "move",
    OVERFLOW: "overflow",
    PAPER_CLIP: "paper-clip",
    NOTE: "note",
    PHONE: "phone",
    PIN: "pin",
    PLUS_CIRCLE: "plus-circle",
    PLUS: "plus",
    PRINT: "print",
    QUESTION_MARK: "question-mark",
    REFRESH: "refresh",
    REPLY: "reply",
    SAVE: "save",
    SEARCH: "search",
    SETTINGS: "settings",
    SHARE: "share",
    SIGNAL: "signal",
    TASK: "task",
    TRASH: "trash",
    TRIANGLEALERT: "trianglealert",
    UNLOCKED_LOCK: "unlocked-lock",
    UPLOAD: "upload",
    USER: "user",
    USER2: "user2",
    USERS: "users",
    VIEW: "view",
    ALL_SERVICES: "all-services",
    LOADING: "loading",
    WIFI: "wifi",
    TRIANGLE: "triangle",
    MY_DATA:'my-data',
    Bar:'bar',
    Donut:'donut',
    Line:'line'

}
export default class Icon extends Component {
    static defaultProps = {
        size: "20",
        color: "#464647",
        thickness: "0"
    }
    static propTypes = {
        name: PropTypes.string.isRequired,
        color: PropTypes.string,
        customIcon: PropTypes.any,
        size: PropTypes.any,
        thickness: PropTypes.string,
        viewBox: PropTypes.string
    }
    constructor(props) {
        super(props)
    }

    render() {
        const { 
            size,
            viewBoxAsSize = false,
            color,
            name,
            thickness,
            customIcon,
            viewBox = viewBoxAsSize ? `0 0 ${size} ${size}` : "0 0 64 64",
            ...props 
        } = this.props
        const svg = customIcon ? customIcon : icons[name]
        return (
            <svg width={size} height={size} fill={color} stroke={color} strokeWidth={thickness}
                viewBox={viewBox}
                {...props}
            >
                {svg}
            </svg>
        )
    }

}
