import { defineStore } from 'pinia';

import type { User } from '@/types';
import { randomColor } from '@/utils';
import axiosInstance, { type ResponseData } from '@/utils/axios';

import useAuthStore from './auth';

export type StreamInfo = {
    uid: string;
    color: string;
    stream: MediaStream;
}

const usePeerStore = defineStore('peer', {
    state: () => {
        return {
            userMap: new Map<string, User & { color: string }>(),
            pcMap: new Map<string, RTCPeerConnection>(),
            streamMap: new Map<string, Map<string, MediaStream>>()
        };
    },

    getters: {
        streamInfoMap: state => {
            const map = new Map<string, StreamInfo>();
            state.streamMap.forEach((streams, uid) => {
                const user = state.userMap.get(uid)!;
                streams.forEach((stream) => {
                    map.set(stream.id, {
                        uid,
                        color: user.color,
                        stream
                    });
                });
            });
            return map;
        }
    },

    actions: {
        /** 初始化本地 */
        initLocal() {
            const { profile } = useAuthStore();
            this.userMap.set(profile._id, {
                color: randomColor(),
                ...profile
            });
        },

        /** 更新渲染流 */
        updateStream(
            id: string,
            newStream?: MediaStream,
            oldStream?: MediaStream | string
        ) {
            const tmpStreamMap = this.streamMap.get(id) ?? new Map<string, MediaStream>();
            if (oldStream) {
                // 移除旧的stream
                if (typeof oldStream === 'string') {
                    tmpStreamMap.delete(oldStream);
                } else {
                    tmpStreamMap.delete(oldStream.id);
                }
            }
            if (newStream) {
                // 添加新的stream
                tmpStreamMap.set(newStream.id, newStream);
            }
            this.streamMap.set(id, tmpStreamMap);
        },

        async addPeer(uid: string, pc: RTCPeerConnection) {
            pc.addEventListener('track', e => {
                if (e.streams.length === 0) return;
                const [stream] = e.streams;
                this.updateStream(uid, stream);
            });

            // 推流
            const { id: localId } = useAuthStore();
            const localStreamMap = this.streamMap.get(localId);
            if (localStreamMap) {
                localStreamMap.forEach(stream => {
                    stream.getTracks().forEach(track => {
                        pc.addTrack(track, stream);
                    });
                });
            }

            // 获取个人信息
            const res = await axiosInstance.get<ResponseData<User>>('/users/' + uid);

            // 存储
            this.userMap.set(uid, {
                color: randomColor(),
                ...res.data.data
            });
            this.pcMap.set(uid, pc);
            return pc;
        },

        removePeer(uid: string) {
            this.userMap.delete(uid);
            this.pcMap.delete(uid);
            this.streamMap.delete(uid);
        },
    }
});

export default usePeerStore;
