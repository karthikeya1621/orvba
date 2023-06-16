export interface Customer extends User {
}

export interface Mechanic extends User {
}

export type OrderApprovalStatus = 'PENDING' | 'APPROVED' | 'DECLINED';

export type OrderStatus = 'STARTED' | 'COMPLETED' | 'ABANDONED' | 'IDLE';

export interface Order extends Location {
    customer?: Partial<Customer>;
    approvalStatus: OrderApprovalStatus;
    status: OrderStatus;
    id: string;
    createdDate: Date;
    approvedDate?: Date;
    startedDate?: Date;
    declinedDate?: Date;
    abandonedDate?: Date;
    endedDate?: Date;
    mechanic?: Partial<Mechanic>;
    otp?: number;
    vehicleDetails?: VehicleRepairDetails
}

export interface User {
    id: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    fcm?: string;
}

export type UserWithToken = User & { token: string };

export interface Location {
    longitude?: number;
    latitude?: number;
}

export type VehicleType = "2-wheeler" | "3-wheeler" | "4-wheeler";

export type VehicleRepairDetails = {
    vehicleType?: VehicleType;
    manufacturer?: string;
    model?: string;
    year?: number;
    repairDescription?: string;
    repairCost?: number;
    repairDate?: Date;
    spares: SparePart[]
};

export type SparePart = {
    partName: string;
    partNumber: string;
    manufacturer: string;
    price: number;
    quantity: number;
    vehicleType: VehicleType;
};
