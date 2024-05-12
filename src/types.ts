import type { Dayjs } from 'dayjs';

export type User = {
    _id: string;
    name: string;
    avatar: string;
    email: string;
}

export type MemberType = 'mentor' | 'member' | 'new';
export type Member = {
    user: User;
    type: MemberType;
    createdAt: string;
    updatedAt: string;
}

export type Team = {
    _id: string;
    name: string;
    description?: string;
    mentor: User;
    members: Member[];
}

export type MeetingStatus = 'pending' | 'ongoing' | 'finished';
export type MeetingInfo<DataType = Dayjs> = {
    _id: string;
    title: string;
    description?: string;
    start: DataType;
    end: DataType;
    status: MeetingStatus;
}

export type UserResponse = 'pending' | 'accepted' | 'rejected';
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
