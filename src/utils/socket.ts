import { io, Socket } from 'socket.io-client';

const WS = import.meta.env.VITE_BASE || 'http://localhost:3000';

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
    return io(WS, {
        auth: { id, token }
    });
}

export default createSocket;
