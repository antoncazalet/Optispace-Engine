export interface Project {
    id: string;
    name: string;
    description: string;
    type: string;
    parentId: string;
    creationDate: Date;
    updateDate: Date;
    user: User;
    status: Status;
    parameters: Parameters;
}

export interface Parameters {
    employeeNumber: number;
    employeeDistance: number;
    algorithmGenerationMethod: string;
    ["optimize.employeeNumberToAdd"]: number;
}

export interface Status {
    statusMessage: string;
    statusCode: number;
}

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
}
