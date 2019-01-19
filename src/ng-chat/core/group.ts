import { Guid } from "./guid";
import { User } from "./user";

export class Group
{
    public id: string = Guid.newGuid();
    public chattingTo: User[];
}
