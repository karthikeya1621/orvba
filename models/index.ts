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
    created_date: Date;
    approved_date?: Date;
    started_date?: Date;
    declined_date?: Date;
    abandoned_date?: Date;
    ended_date?: Date;
    mechanic?: Partial<Mechanic>;
}

export interface User {
    firstname?: string;
    lastname?: string;
    email?: string;
    mobile?: string;
}

export interface Location {
    longitude?: number;
    latitude?: number;
}
