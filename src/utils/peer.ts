const ICE = import.meta.env.VITE_ICE;

class Peer {
    id: string;
    pc?: RTCPeerConnection;
    streams: MediaStream[];

    constructor(id: string) {
        this.id = id;
        this.pc = new RTCPeerConnection({ iceServers: [{ urls: ICE }] });
        this.pc.addEventListener('track', e => {
            const [stream] = e.streams;
            this.streams.push(stream);
        });
        this.streams = [];
    }
}

export default Peer;
