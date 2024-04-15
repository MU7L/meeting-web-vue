<template>
    <a-config-provider :locale="zhCN">
        <RouterView />
    </a-config-provider>
</template>

<script setup lang="ts">
import 'dayjs/locale/zh-cn';

import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import { RouterView } from 'vue-router';

dayjs.locale('zh-cn');
</script>
