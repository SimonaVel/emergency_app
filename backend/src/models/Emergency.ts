export class Emergency {
    id: number;
    name: string;
    
    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name
        };
    }
}