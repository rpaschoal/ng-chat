import { UserStatus } from "./user-status.enum";

export class User
{
    public id: any;
    public displayName: string;
    public status: UserStatus;
    public avatar: string;
}