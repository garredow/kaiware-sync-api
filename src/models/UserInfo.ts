import { User } from './User';

export type UserInfo = User & {
  nickname?: string;
  name?: string;
  picture?: string;
  updated_at?: string;
  email?: string;
  email_verified?: boolean;
};
