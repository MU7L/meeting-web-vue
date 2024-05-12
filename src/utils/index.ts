/** 生成随机颜色 */
export function randomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

export type DeviceIdParams = {
    audioDeviceId: string | null;
    videoDeviceId: string | null;
}

/** 生成媒体约束 */
export function getMediaConstraints({ audioDeviceId, videoDeviceId }: DeviceIdParams) {
    return {
        audio: audioDeviceId ? { deviceId: audioDeviceId } : false,
        video: videoDeviceId ? { deviceId: videoDeviceId } : false
    };
}
