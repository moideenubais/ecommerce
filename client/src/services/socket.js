import io from "socket.io-client";
import CONSTANTS from '../constants'

export const socket = io(CONSTANTS.BASE_URL);