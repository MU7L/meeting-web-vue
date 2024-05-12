import dayjs from 'dayjs';
import { defineStore } from 'pinia';

import { type DeviceIdParams, getMediaConstraints } from '@/utils';

type State = {
    open: boolean;
    devices: {
        audioInputs: MediaDeviceInfo[];
        videoInputs: MediaDeviceInfo[];
        updateAt: dayjs.Dayjs | null;
    } & DeviceIdParams
}

const useSettingStore = defineStore('setting', {
    state: (): State => {
        return {
            open: false,
            devices: {
                audioInputs: [],
                videoInputs: [],
                audioDeviceId: null,
                videoDeviceId: null,
                updateAt: null
            }
        };
    },

    getters: {
        constraints({devices}:State): MediaStreamConstraints {
            return getMediaConstraints(devices);
        },
        options({ devices }:State) {
            function getItems(devices: MediaDeviceInfo[]) {
                return devices.map(device => ({
                    key: device.deviceId,
                    label: device.label,
                    value: device.deviceId
                }));
            }
            return {
                audio: getItems(devices.audioInputs),
                video: getItems(devices.videoInputs)
            };
        }
    },

    actions: {
        async getInputs() {
            const now = dayjs();
            // 5min内不重复更新
            if (
                this.devices.updateAt
                && now.diff(this.devices.updateAt, 'minute') <= 5
            ) {
                return;
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            stream.getTracks().forEach(track => track.stop());
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.devices.audioInputs = devices.filter(device => device.kind === 'audioinput');
            this.devices.videoInputs = devices.filter(device => device.kind === 'videoinput');
        }

    }
});

export default useSettingStore;
