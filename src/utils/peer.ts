import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import useAuthStore from '@/stores/auth';
import usePeerStore from '@/stores/peer';

import createSocket from './socket';

const ICE = import.meta.env.VITE_ICE;

function usePeers(mid: string) {
    // 数据源
    const { id, token } = storeToRefs(useAuthStore());
    const peerStore = usePeerStore();
    const { pcMap } = storeToRefs(peerStore);

    // 通讯
    const active = ref<boolean>(false);
    const socket = createSocket(id.value, token.value);

    /** 创建Peer */
    async function createPeer(id: string) {
        const pc = new RTCPeerConnection({ iceServers: [{ urls: ICE }] });
        pc.addEventListener('icecandidate', e => {
            if (e.candidate) socket.emit('candidate', id, e.candidate);
        });
        pc.addEventListener('negotiationneeded', () => negotiate(id, pc));
        await peerStore.addPeer(id, pc);
        return pc;
    }

    /** 协商 */
    async function negotiate(id: string, pc: RTCPeerConnection) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', id, offer);
    }

    socket
        // 新用户加入房间 与老用户创建Peer
        .on('connect', () => {
            active.value = true;
            peerStore.initLocal();
            socket.emit('join', mid, idList => {
                idList.forEach(async id => {
                    const peer = await createPeer(id);
                    await negotiate(id, peer);
                });
            });
        })
        // 老用户接收到新用户加入房间
        .on('join', createPeer)
        // 接收到offer
        .on('offer', async (id, offer) => {
            const pc = pcMap.value.get(id);
            if (!pc) return;
            await pc.setRemoteDescription(offer);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('answer', id, answer);
        })
        // 接收到answer
        .on('answer', async (id, answer) => {
            const pc = pcMap.value.get(id);
            if (!pc) return;
            await pc.setRemoteDescription(answer);
        })
        // candidate
        .on('candidate', async (id, candidate) => {
            const pc = pcMap.value.get(id);
            if (!pc) return;
            await pc.addIceCandidate(candidate);
        });

    // TODO: 退出

    /** 更新本地流并推送 */
    function updateLocalStream(
        newStream?: MediaStream,
        oldStream?: MediaStream
    ) {
        // 本地
        peerStore.updateStream(id.value, newStream, oldStream);
        // 远端
        if (oldStream) {
            // TODO: 删除旧流
            pcMap.value.forEach(pc => {
                oldStream.getTracks().forEach(track => {
                    track.stop();
                    pc.getSenders()
                        .filter(sender => sender.track?.id === track.id)
                        .forEach(sender => pc.removeTrack(sender));
                });
            });
            // TODO: 用socket通信
        }
        if (newStream) {
            const tracks = newStream.getTracks();
            pcMap.value.forEach(pc => {
                tracks.forEach(track => {
                    pc.addTrack(track, newStream);
                });
            });
        }
    }

    return { active, updateLocalStream };
}

export default usePeers;
