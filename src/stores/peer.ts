import dayjs, { type Dayjs } from 'dayjs';
import { defineStore } from 'pinia';

import type { User } from '@/types';
import { randomColor } from '@/utils';
import axiosInstance, { type ResponseData } from '@/utils/axios';
import createSocket, { type SocketClient } from '@/utils/socket';

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

const ICE_SERVER = import.meta.env.VITE_ICE;

const usePeerStore = defineStore('peer', {
    state: () => {
        return {
            mid: '',
            socket: null as SocketClient | null,

            userMap: new Map<string, User & { color: string }>(),
            pcMap: new Map<string, RTCPeerConnection>(),

            streamMap: new Map<string, Map<string, MediaStream>>(),

            textChannelMap: new Map<string, RTCDataChannel>(),
            messages: [] as ChatMessage[],
            hasNewMsg: false,

            canvasChannelMap: new Map<string, RTCDataChannel>(),
            hasNewCanvasMsg: false
        };
    },

    getters: {
        local: () => {
            return useAuthStore();
        },

        active: state => state.socket?.active,

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
        init(mid: string) {
            this.mid = mid;
            this.socket = createSocket(this.local.id, this.local.token);
            this.bindSocket();
            this.userMap.set(this.local.id, {
                color: randomColor(),
                ...this.local.profile
            });
        },

        /** 绑定socket事件 */
        bindSocket() {
            if (!this.socket) throw new Error('socket is null');
            this.socket
                // 新用户加入房间 创建多个Peer
                .on('connect', () => {
                    this.socket!.emit('join', this.mid, uidList => {
                        uidList.forEach(async uid => {
                            const pc = await this.createPeer(uid);
                            if (!pc) return;
                            await this.negotiate(uid, pc);
                        });
                    });
                })
                // 老用户接收到新用户加入房间
                // .on('join', this.createPeer)
                // 接收到offer 创建Peer
                .on('offer', async (uid, offer) => {
                    console.log('offer', uid, offer);
                    const pc = this.pcMap.get(uid) ?? await this.createPeer(uid, offer);
                    if (!pc) return;
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    this.socket!.emit('answer', uid, answer);
                })
                // 接收到answer
                .on('answer', async (uid, answer) => {
                    console.log('answer', uid, answer);
                    const pc = this.pcMap.get(uid);
                    // if (!pc || pc.signalingState !== 'have-local-offer') return;
                    await pc.setRemoteDescription(answer);
                })
                // candidate
                .on('candidate', async (uid, candidate) => {
                    const pc = this.pcMap.get(uid);
                    if (!pc) return;
                    await pc.addIceCandidate(candidate);
                })
                // 关闭流
                .on('removeStream', (uid, sid) => {
                    this.updateStream(uid, undefined, sid);
                })
                // 其他用户退出
                .on('leave', uid => {
                    this.userMap.delete(uid);

                    this.pcMap.get(uid)?.close();
                    this.pcMap.delete(uid);

                    const userStreamMap = this.streamMap.get(uid);
                    userStreamMap?.forEach(stream => {
                        stream.getTracks().forEach(track => track.stop());
                    });
                    this.streamMap.delete(uid);

                    this.textChannelMap.get(uid)?.close();
                    this.textChannelMap.delete(uid);

                    this.canvasChannelMap.get(uid)?.close();
                    this.canvasChannelMap.delete(uid);
                });
        },

        /** 创建peer */
        async createPeer(uid: string, offer?: RTCSessionDescriptionInit) {
            if (!this.socket) return;

            const pc = new RTCPeerConnection({
                iceServers: [{ urls: ICE_SERVER }]
            });

            // 接收者
            if (offer) {
                await pc.setRemoteDescription(offer);
                console.log(pc.signalingState); // have-remote-offer
            }

            // 向pc推流
            this.streamMap.get(this.local.id)?.forEach(stream => {
                stream.getTracks().forEach(track => {
                    pc.addTrack(track, stream);
                });
            });

            pc.addEventListener('negotiationneeded', e => {
                console.log('negotiationneeded', e);
                // if (pc.signalingState === 'have-local-offer') return;
                this.negotiate(uid, pc);
            });

            pc.addEventListener('icecandidate', e => {
                if (e.candidate) this.socket!.emit('candidate', uid, e.candidate);
            });

            // 发起者创建数据通道
            if (!offer) {
                const textCh = pc.createDataChannel('text');
                this.textChannelMap.set(uid, textCh);
                textCh.addEventListener('message', this.receiveMessage);

                const canvasCh = pc.createDataChannel('canvas');
                canvasCh.addEventListener('message', () => this.hasNewCanvasMsg = true);
                this.canvasChannelMap.set(uid, canvasCh);
            }

            pc.addEventListener('datachannel', e => {
                if (e.channel.label === 'text') {
                    e.channel.addEventListener('message', this.receiveMessage);
                    this.textChannelMap.set(uid, e.channel);
                } else if (e.channel.label === 'canvas') {
                    this.canvasChannelMap.set(uid, e.channel);
                }
            });

            pc.addEventListener('track', e => {
                console.log('track', e);
                if (e.streams.length === 0) return;
                this.updateStream(uid, e.streams[0]);
            });

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

        async negotiate(uid: string, pc: RTCPeerConnection) {
            if (!this.socket) return Promise.reject();
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            this.socket.emit('offer', uid, offer);
        },

        /** 更新渲染流 */
        updateStream(
            id: string,
            newStream?: MediaStream,
            oldStream?: MediaStream | string
        ) {
            console.log('updateStream', id, newStream, oldStream);
            const tmpStreamMap = this.streamMap.get(id) ?? new Map<string, MediaStream>();

            // 移除旧的stream
            if (oldStream) {
                let _oldStream: MediaStream | undefined;
                if (typeof oldStream === 'string') {
                    _oldStream = tmpStreamMap.get(oldStream);
                    tmpStreamMap.delete(oldStream);
                } else {
                    _oldStream = oldStream;
                    tmpStreamMap.delete(oldStream.id);
                }
                // 停止旧的stream
                if (id === this.local.id && _oldStream) {
                    const tracks = _oldStream.getTracks();
                    this.pcMap.forEach(pc => {
                        pc.getSenders().forEach(sender => {
                            if (tracks.some(track => track.id === sender.track?.id)) {
                                pc.removeTrack(sender);
                            }
                        });
                    });
                }
            }

            // 添加新的stream
            if (newStream) {
                tmpStreamMap.set(newStream.id, newStream);
                // 向所有对端推流
                if (id === this.local.id) {
                    const tracks = newStream.getTracks();
                    this.pcMap.forEach(pc => {
                        tracks.forEach(track => {
                            pc.addTrack(track, newStream);
                        });
                    });
                }
            }

            this.streamMap.set(id, tmpStreamMap);
        },

        /** 发送消息 */
        sendMessage(content: string) {
            const msg = {
                uid: this.local.id,
                content,
                time: dayjs()
            };
            this.messages.push(msg);
            this.textChannelMap.forEach(channel => {
                channel.send(JSON.stringify({ ...msg, time: msg.time.format() }));
            });
        },

        /** 接收到消息 */
        receiveMessage(e: MessageEvent<string>) {
            const rawData = JSON.parse(e.data) as ChatMessage<string>;
            this.messages.push({ ...rawData, time: dayjs(rawData.time) });
            this.hasNewMsg = true;
        },

        /** 发送画布命令 */
        sendCanvasCmd(cmd: CanvasCmd) {
            this.canvasChannelMap.forEach(channel => {
                channel.send(JSON.stringify(cmd));
            });
        },

        /** 销毁 */
        destroy() {
            this.socket?.disconnect();
            this.pcMap.forEach(pc => pc.close());
            this.streamMap.forEach(streamMap =>
                streamMap.forEach(stream =>
                    stream.getTracks().forEach(track =>
                        track.stop()
                    )
                )
            );
            this.textChannelMap.forEach(channel => channel.close());
            this.canvasChannelMap.forEach(channel => channel.close());
        }
    }
});

export default usePeerStore;
