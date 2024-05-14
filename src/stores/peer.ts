import dayjs, { type Dayjs } from 'dayjs';
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

type ChatMessage<DateType = Dayjs> = {
    uid: string;
    content: string;
    time: DateType;
}

export type SortedMessage = {
    user: User & { color: string };
    content: string;
    time: Dayjs;
}

export type CanvasCmd = {
    fn: string;
    args?: any[];
}

const usePeerStore = defineStore('peer', {
    state: () => {
        return {
            userMap: new Map<string, User & { color: string }>(),
            pcMap: new Map<string, RTCPeerConnection>(),
            streamMap: new Map<string, Map<string, MediaStream>>(),
            textChannelMap: new Map<string, RTCDataChannel>(),
            messages: [] as ChatMessage[],
            hasNewMsg: false,
            canvasChannelMap: new Map<string, RTCDataChannel>()
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
        },

        sortedMessages(state): SortedMessage[] {
            return state.messages.sort((a, b) =>
                a.time.isBefore(b.time) ? -1 : 1
            ).map(msg => {
                const user = state.userMap.get(msg.uid)!;
                return { ...msg, user };
            });
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

        sendMessage(content: string) {
            const { id: localId } = useAuthStore();
            const msg = {
                uid: localId,
                content,
                time: dayjs()
            };
            this.messages.push(msg);
            this.textChannelMap.forEach(channel => {
                channel.send(JSON.stringify({ ...msg, time: msg.time.format() }));
            });
            console.log(this.textChannelMap);
        },

        recvMessage(e: MessageEvent<string>) {
            const rawData = JSON.parse(e.data) as ChatMessage<string>;
            this.messages.push({ ...rawData, time: dayjs(rawData.time) });
            this.hasNewMsg = true;
        },

        sendCanvasCmd(cmd: CanvasCmd) {
            this.canvasChannelMap.forEach(channel => {
                channel.send(JSON.stringify(cmd));
            });
        },

        async addPeer(uid: string, pc: RTCPeerConnection, isInitiator?: boolean) {
            if (isInitiator) {
                const textCh = pc.createDataChannel('text');
                this.textChannelMap.set(uid, textCh);
                textCh.addEventListener('message', this.recvMessage);

                const canvasCh = pc.createDataChannel('canvas');
                this.canvasChannelMap.set(uid, canvasCh);
            }

            pc.addEventListener('datachannel', e => {
                if (e.channel.label === 'text') {
                    this.textChannelMap.set(uid, e.channel);
                    e.channel.addEventListener('message', this.recvMessage);
                } else if (e.channel.label === 'canvas') {
                    this.canvasChannelMap.set(uid, e.channel);
                }
            });

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
        }
    }
});

export default usePeerStore;
