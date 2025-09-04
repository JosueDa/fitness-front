import { Zone } from "./Zone";

export interface Exercise{
    id: number;
    name: string;
    zoneId: number;
    zone: Zone;
}