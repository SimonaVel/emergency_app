import { EmergencyType } from "./EmergencyType.js";

export class Emergency {
    id: number;
    name: string;
    emergencyType: EmergencyType | null;
    
    constructor(id: number, name: string, emergencyType: EmergencyType | null) {
        this.id = id;
        this.name = name;
        this.emergencyType = emergencyType;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            emergencyType: this.emergencyType ? this.emergencyType.id : null
        };
    }
}