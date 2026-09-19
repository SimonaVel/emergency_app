export class EmergencyType {
    id: number;
    name?: string;
    
    constructor(id: number, name?: string) {
        this.id = id;
        this.name = name;
    }

    toJSON() {
        return this.name === undefined
            ? { id: this.id }
            : { id: this.id, name: this.name };
    }
}