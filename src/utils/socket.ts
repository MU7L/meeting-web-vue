import { io, Socket } from 'socket.io-client';

const WS = import.meta.env.VITE_WS || 'http://localhost:3000';

interface ServerToClientEvents {
    join: (id: string) => void;
    offer: (sdp: RTCSessionDescriptionInit, id: string) => void;
    answer: (sdp: RTCSessionDescriptionInit, id: string) => void;
    candidate: (candidate: RTCIceCandidate, id: string) => void;
}

interface ClientToServerEvents {
    join: (room: string, callback: (idList: string[]) => void) => void;
    offer: (sdp: RTCSessionDescriptionInit, id: string) => void;
    answer: (sdp: RTCSessionDescriptionInit, id: string) => void;
    candidate: (candidate: RTCIceCandidate, id: string) => void;
}

export type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;

function createSocket(id: string, token: string): SocketClient {
    return io(WS, {
        auth: { id, token }
    });
}

export default createSocket;
