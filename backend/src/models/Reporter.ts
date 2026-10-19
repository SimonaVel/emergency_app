export class Reporter {
    id: number;
    name: string;
    phoneNumber: string;
    
    constructor(id: number, name: string, phoneNumber: string) {
        this.id = id;
        this.name = name;
        this.phoneNumber = phoneNumber;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            phoneNumber: this.phoneNumber,
        };
    }
}