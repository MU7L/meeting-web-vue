import { defineStore } from 'pinia';

import useAuthStore from './auth';

const ICE = import.meta.env.VITE_ICE;

interface StreamInfo {
    id: string;
    stream?: MediaStream;
}

const usePeerStore = defineStore('peer', {
    state: () => ({
        idSet: new Set<string>(),
        pcMap: new Map<string, RTCPeerConnection>(),
        streamMap: new Map<string, MediaStream>(),
        sidsMap: new Map<string, Set<string>>(),
    }),

    getters: {
        streamInfoMap: state => {
            const map = new Map<string, StreamInfo>();
            state.idSet.forEach(id => {
                const sidSet = state.sidsMap.get(id);
                if (!sidSet || sidSet.size === 0) {
                    // 无流时以用户id为键
                    map.set(id, { id });
                } else {
                    // 有流时以stream.id为键
                    sidSet.forEach(sid => {
                        const stream = state.streamMap.get(sid);
                        if (!stream) return;
                        map.set(sid, { id, stream });
                    });
                }
            });
            return map;
        },
    },

    actions: {
        updateStream(
            id: string,
            newStream?: MediaStream,
            oldStream?: MediaStream,
        ) {
            const sidSet = this.sidsMap.get(id) ?? new Set();
            if (oldStream) {
                // 移除旧的stream
                this.streamMap.delete(oldStream.id);
                sidSet.delete(oldStream.id);
            }
            if (newStream) {
                // 添加新的stream
                this.streamMap.set(newStream.id, newStream);
                sidSet.add(newStream.id);
            }
            this.sidsMap.set(id, sidSet);
        },
        addPeer(id: string) {
            const pc = new RTCPeerConnection({ iceServers: [{ urls: ICE }] });
            pc.addEventListener('track', e => {
                if (e.streams.length === 0) return;
                const [stream] = e.streams;
                this.updateStream(id, stream);
            });

            // 推流
            // BUG: 第一个用户的流推送失败
            const { id: localId } = useAuthStore();
            const sidSet = this.sidsMap.get(localId);
            if (sidSet) {
                sidSet.forEach(sid => {
                    const stream = this.streamMap.get(sid);
                    if (!stream) return;
                    stream.getTracks().forEach(track => {
                        pc.addTrack(track, stream);
                    });
                });
            }

            // 存储
            this.idSet.add(id);
            this.pcMap.set(id, pc);
            return pc;
        },
    },
});

export default usePeerStore;
