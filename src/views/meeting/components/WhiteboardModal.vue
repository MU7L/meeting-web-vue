<template>
    <a-button
        :type="open ? 'primary' : 'default'"
        @click="handleOpen"
        class="enter-btn"
    >
        <FundProjectionScreenOutlined />
        <div>白板</div>
    </a-button>

    <a-modal
        v-model:open="open"
        title="画板"
        width="100%"
        wrap-class-name="full-modal"
        :forceRender="true"
    >
        <div class="canvas-wrapper" ref="wrapperRef">
            <template v-for="[uid, ch] in canvasChannelMap"
                :key="uid">
                <SyncCanvas
                    :channel="ch"
                    :width="size[0]"
                    :height="size[1]"
                />
            </template>
            <canvas
                ref="canvasRef"
                :width="size[0]"
                :height="size[1]"
                @mousedown="onMouseDown"
                @mousemove="onMouseMove"
                @mouseup="quitDrawing"
                @mouseleave="quitDrawing"
            ></canvas>
        </div>
        <template #footer>
            <a-button @click="clear">清除</a-button>
        </template>
    </a-modal>
</template>

<script setup lang="ts">
import { FundProjectionScreenOutlined } from '@ant-design/icons-vue';
import { storeToRefs } from 'pinia';
import { nextTick, ref } from 'vue';

import usePeerStore from '@/stores/peer';

import SyncCanvas from './SyncCanvas.vue';

const open = ref<boolean>(false);

const store = usePeerStore();
const { canvasChannelMap } = storeToRefs(store);

const wrapperRef = ref<HTMLDivElement>();
const size = ref<[number, number]>([300,150]);

function handleOpen() {
    open.value = !open.value;
    nextTick(() => {
        // 只有在wrapper渲染之后 且在nextTick中才能取到大小
        size.value = [wrapperRef.value?.clientWidth || 300, wrapperRef.value?.clientHeight || 150];
        console.log(wrapperRef.value?.clientWidth, wrapperRef.value?.clientHeight);
    })
}

const canvasRef = ref<HTMLCanvasElement>();

let isDrawing = false; // 是否正在绘制
let lastX, lastY; // 上一次鼠标位置

function getCtx() {
    const ctx = canvasRef.value?.getContext('2d');
    if (!ctx) throw new Error('canvas context is null');
    return ctx;
}

function onMouseDown(e: MouseEvent) {
    const ctx = getCtx();
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    ctx.beginPath();
    store.sendCanvasCmd({fn: 'beginPath'})
    ctx.moveTo(lastX, lastY);
    store.sendCanvasCmd({fn: 'moveTo', args: [lastX, lastY]})
    console.log(wrapperRef.value?.clientWidth, wrapperRef.value?.clientHeight);
}

function onMouseMove(e: MouseEvent) {
    const ctx = getCtx();
    if (!isDrawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    store.sendCanvasCmd({fn: 'lineTo', args: [e.offsetX, e.offsetY]})
    ctx.stroke();
    store.sendCanvasCmd({fn: 'stroke'});
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function quitDrawing() {
    const ctx = getCtx();
    ctx.closePath();
    store.sendCanvasCmd({fn: 'closePath'});
    isDrawing = false;
}

function clear() {
    const ctx = getCtx();
    ctx.clearRect(0, 0, size.value[0], size.value[1]);
    store.sendCanvasCmd({fn: 'clearRect', args: [0, 0, size.value[0], size.value[1]]});
}

</script>

<style lang="scss" scoped>
.enter-btn {
    height: auto;
}

.canvas-wrapper {
    position: relative;
    width: 100%;
    height: 100%;

    canvas {
        position: absolute;
        top: 0;
        left: 0;
        border: 1px solid grey;
        border-radius: 10px;
        width: 100%;
        height: 100%;
        cursor: crosshair;
    }
}
</style>

<style lang="scss">
.full-modal {
    .ant-modal {
        max-width: 100%;
        top: 0;
        padding-bottom: 0;
        margin: 0;
    }

    .ant-modal-content {
        display: flex;
        flex-direction: column;
        height: calc(100vh);
    }

    .ant-modal-body {
        flex: 1;
    }
}
</style>
