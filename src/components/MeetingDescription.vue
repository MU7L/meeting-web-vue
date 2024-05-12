<template>
    <a-descriptions
        :title="$props.title"
        layout="vertical"
        :colon="false"
    >

        <template #extra>
            <slot name="extra" />
        </template>

        <a-descriptions-item
            label="会议时间"
            :span="2"
        >
            {{ `${$props.start?.format('M月D日 dddd H:mm')} - ${$props.end?.format('H:mm')}` }}
        </a-descriptions-item>
        <a-descriptions-item label="主持人">
            <AvatarName v-bind="$props.sponsor" />
        </a-descriptions-item>
        <a-descriptions-item
            :span="3"
            :content-style="{flexDirection: 'column'}"
        >
            <template #label>
                参会人员
                <a-segmented
                    v-model:value="segmentedValue"
                    :options="segmentedOpts"
                    class="attendee-segmented"
                />
            </template>

            <a-space wrap class="margin-top">
                <template
                    v-for="user in segmentedUsers"
                    :key="user._id"
                >
                    <AvatarName v-bind="user" />
                </template>
            </a-space>
        </a-descriptions-item>
    </a-descriptions>
</template>

<script setup lang="ts">
import type { SegmentedOption } from 'ant-design-vue/es/segmented/src/segmented';
import dayjs from 'dayjs';
import { computed, ref } from 'vue';

import AvatarName from '@/components/AvatarName.vue';
import type { Attendee, MeetingDetail, User, UserResponse } from '@/types';

const props = withDefaults(defineProps<MeetingDetail>(), {
    _id: '',
    title: '',
    description: '',
    start: () => dayjs(),
    end: () => dayjs(),
    sponsor: () => ({}) as User,
    attendees: () => [] as Attendee[],
    status: 'pending',
    createdAt: () => dayjs(),
    updatedAt: () => dayjs()
});

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
.attendee-segmented {
    margin-left: 8px;
}

.margin-top {
    margin-top: 8px;
}
</style>
