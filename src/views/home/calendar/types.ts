import type { Dayjs } from 'dayjs';

export type UserResponse = 'pending' | 'accepted' | 'rejected';

export type MeetingStatus = 'pending' | 'ongoing' | 'finished';

export type User = {
    _id: string;
    name: string;
    avatar: string;
    email: string;
}

export type MeetingInfo<DataType=Dayjs> = {
    _id: string;
    title: string;
    start: DataType;
    end: DataType;
    status: MeetingStatus;
}

export type Attendee = {
    user: User;
    response: UserResponse;
}

export type MeetingDetail<DataType = Dayjs> = MeetingInfo<DataType> & {
    sponsor: User;
    attendees: Attendee[];
    createdAt: DataType;
    updatedAt: DataType;
}
