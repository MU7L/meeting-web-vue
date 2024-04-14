import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import useAuthStore from '@/stores/auth';
import usePeerStore from '@/stores/peer';

import createSocket from './socket';

function usePeers() {
    const route = useRoute();
    const meetingId = route.params.meetingId as string;
    const { id, token } = storeToRefs(useAuthStore());

    const peerStore = usePeerStore();
    const { idSet, pcMap } = storeToRefs(peerStore);

    const active = ref<boolean>(false); // TODO: 无后端调试时设为true

    const socket = createSocket(id.value, token.value);

    // TODO: 无后端调试时调用
    // peerMap.value.set(id.value, { id: id.value, streamMap: new Map() });
    // socket.disconnect();

    /** 创建Peer */
    function createPeer(id: string) {
        const pc = peerStore.addPeer(id);
        pc.addEventListener('icecandidate', e => {
            if (e.candidate) socket.emit('candidate', e.candidate, id);
        });
        pc.addEventListener('negotiationneeded', () => negotiate(id, pc));
        return pc;
    }

    /** 协商 */
    function negotiate(id: string, pc: RTCPeerConnection) {
        pc.createOffer().then(offer => {
            pc.setLocalDescription(offer);
            socket.emit('offer', offer, id);
        });
    }

    socket
        // 新用户加入房间 与老用户创建Peer
        .on('connect', () => {
            active.value = true;
            idSet.value.add(id.value);
            socket.emit('join', meetingId, idList => {
                idList.forEach(id => {
                    const peer = createPeer(id);
                    negotiate(id, peer);
                });
            });
        })
        // 老用户接收到新用户加入房间
        .on('join', createPeer)
        // 接收到offer
        .on('offer', async (offer, id) => {
            const pc = pcMap.value.get(id);
            if (!pc) return;
            await pc.setRemoteDescription(offer);
            const answer = await pc.createAnswer();
            pc.setLocalDescription(answer);
            socket.emit('answer', answer, id);
        })
        // 接收到answer
        .on('answer', (answer, id) => {
            const pc = pcMap.value.get(id);
            if (!pc) return;
            pc.setRemoteDescription(answer);
        })
        // candidate
        .on('candidate', (candidate, id) => {
            const pc = pcMap.value.get(id);
            if (!pc) return;
            pc.addIceCandidate(candidate);
        });

    function updateLocalStream(
        newStream?: MediaStream,
        oldStream?: MediaStream,
    ) {
        peerStore.updateStream(id.value, newStream, oldStream);
        // TODO: 通信逻辑
        if (!newStream) return;
        const tracks = newStream.getTracks();
        pcMap.value.forEach(pc => {
            tracks.forEach(track => {
                pc.addTrack(track, newStream);
            });
        });
    }

    return { active, updateLocalStream };
}

export default usePeers;
