import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import useAuthStore from '@/stores/auth';

import createSocket from './socket';

const ICE = import.meta.env.VITE_ICE;

export class Peer {
    id: string;
    pc?: RTCPeerConnection;
    streamMap: Map<string, MediaStream>;

    constructor(id: string) {
        this.id = id;
        this.pc = new RTCPeerConnection({ iceServers: [{ urls: ICE }] });
        this.streamMap = new Map();
        this.pc.addEventListener('track', e => {
            if (e.streams.length > 0) {
                const [stream] = e.streams;
                this.streamMap.set(stream.id, stream);
            }
        });
    }
}

function usePeers() {
    const route = useRoute();
    const meetingId = route.params.meetingId as string;
    const { id, token } = storeToRefs(useAuthStore());

    const peerMap = ref<Map<string, Peer>>(new Map<string, Peer>());
    const active = ref<boolean>(false); // TODO: 无后端调试时设为true

    const socket = createSocket(id.value, token.value);

    // TODO: 无后端调试时调用
    // peerMap.value.set(id.value, { id: id.value, streamMap: new Map() });
    // socket.disconnect();

    /** 创建Peer */
    function createPeer(id: string) {
        const peer = new Peer(id);
        peer.pc?.addEventListener('icecandidate', e => {
            if (e.candidate) socket.emit('candidate', e.candidate, id);
        });
        peer.pc?.addEventListener('negotiationneeded', () => negotiate(peer));
        peerMap.value.set(id, peer);
        return peer;
    }

    /** 协商 */
    function negotiate({ id, pc }: Peer) {
        pc?.createOffer().then(offer => {
            pc.setLocalDescription(offer);
            socket.emit('offer', offer, id);
        });
    }

    socket
        // 新用户加入房间 与老用户创建Peer
        .on('connect', () => {
            active.value = true;
            peerMap.value.set(id.value, { id: id.value, streamMap: new Map() });
            socket.emit('join', meetingId, idList => {
                idList.forEach(id => {
                    const peer = createPeer(id);
                    negotiate(peer);
                });
            });
        })
        // 老用户接收到新用户加入房间
        .on('join', createPeer)
        // 接收到offer
        .on('offer', async (offer, id) => {
            const peer = peerMap.value.get(id);
            if (!peer) return;
            await peer.pc?.setRemoteDescription(offer);
            const answer = await peer.pc?.createAnswer();
            peer.pc?.setLocalDescription(answer);
            if (answer) socket.emit('answer', answer, id);
        })
        // 接收到answer
        .on('answer', (answer, id) => {
            const peer = peerMap.value.get(id);
            if (!peer) return;
            peer.pc?.setRemoteDescription(answer);
        })
        // candidate
        .on('candidate', (candidate, id) => {
            const peer = peerMap.value.get(id);
            if (!peer) return;
            peer.pc?.addIceCandidate(candidate);
        });

    function updateLocalStream(
        newStream?: MediaStream,
        oldStream?: MediaStream,
    ) {
        const peer = peerMap.value.get(id.value);
        if (!peer) return;
        const localStreamMap = peer.streamMap;
        if (oldStream) {
            localStreamMap.delete(oldStream.id);
        }
        if (newStream) {
            localStreamMap.set(newStream.id, newStream);
        }
        peerMap.value.set(id.value, { ...peer, streamMap: localStreamMap });
        // TODO: 通信逻辑
    }

    return { peerMap, active, updateLocalStream };
}

export default usePeers;
