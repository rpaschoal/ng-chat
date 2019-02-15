import { Group } from "./group";

export interface IChatGroupAdapter
{
    groupCreated(group: Group): void;
}
