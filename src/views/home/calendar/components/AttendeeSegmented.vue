<template>
    <a-segmented
        v-model:value="segmentedValue"
        :options="segmentedOpts"
        class="center"
    />
    <a-space wrap
        class="margin-top">
        <template v-for="user in segmentedUsers"
            :key="user._id">
            <AvatarName v-bind="user" />
        </template>
    </a-space>
</template>

<script setup lang="ts">
import type { SegmentedOption } from 'ant-design-vue/es/segmented/src/segmented';
import { computed, ref } from 'vue';

import AvatarName from '@/components/AvatarName.vue';
import type { Attendee, User, UserResponse } from '@/views/home/calendar/types';

const props = defineProps<{
    attendees: Attendee[]
}>();

const segmentedValue = ref<UserResponse>('accepted');
const segmentedOpts: SegmentedOption[] = [{
    label: '接受',
    value: 'accepted'
}, {
    label: '暂定',
    value: 'pending'
}, {
    label: '拒绝',
    value: 'rejected'
}];

const segmentedUsers = computed<User[]>(() =>
    props.attendees.filter(attendee => attendee.response === segmentedValue.value).map(attendee => attendee.user)
);
</script>


<style scoped lang="scss">
.center {
    margin: 0 auto;
}

.margin-top {
    margin-top: 8px;
}
</style>
