import { io, type Socket } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_BASE;

interface ServerToClientEvents {
    join: (uid: string) => void;
    offer: (uid: string, sdp: RTCSessionDescriptionInit) => void;
    answer: (uid: string, sdp: RTCSessionDescriptionInit) => void;
    candidate: (uid: string, candidate: RTCIceCandidate) => void;
    removeStream: (uid: string, sid: string) => void;
    leave: (uid: string) => void;
}

interface ClientToServerEvents {
    join: (mid: string, callback: (idList: string[]) => void) => void;
    offer: (uid: string, sdp: RTCSessionDescriptionInit) => void;
    answer: (uid: string, sdp: RTCSessionDescriptionInit) => void;
    candidate: (uid: string, candidate: RTCIceCandidate) => void;
    removeStream: (uid: string, sid: string) => void;
}

export type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;

function createSocket(id: string, token: string): SocketClient {
    return io(BASE_URL, {
        auth: { id, token }
    });
}

export default createSocket;
