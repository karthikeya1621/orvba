import { app, socket, db, adminApp } from ".";
import { Order } from "./models";
import { v4 } from "uuid";
import { collection, doc, getDoc, limit, setDoc, query, orderBy, getDocs } from "firebase/firestore";
import {  } from 'firebase/messaging';
import { randomOtp, withDate } from "./utils";

export const orders = () => {
    app.get('/orders', async (req, res) => {
        try {
            const params: any = req.params;
        const ordersRef = collection(db, 'orders');
        let ordersQuery = query(ordersRef, orderBy('createdDate', 'desc'));
        if(params && params['sort_by']) {
            const sortOrder = params['sort_order'] || 'asc';
            ordersQuery = query(ordersQuery, orderBy(params['sort_by'], params['sort_order']));  
        }
        if(params && params['limit']) {
            ordersQuery = query(ordersQuery, limit(params['limit']));
        }
        let orders: Order[] = (await getDocs(ordersQuery)).docs.map(order => order.data() as Order);
        if(params && params['status']) {
            orders = orders.filter(order => order.approvalStatus.toLowerCase().includes(`${params['status']}`.toLowerCase().trim()));
        }
        orders = orders.map(order => withDate(order, ['createdDate', 'startedDate', 'approvedDate', 'declinedDate', 'abandonedDate', 'endedDate']));
        res.send(orders);
        } catch(e) {
            res.status(522);
            res.send({error: e});
        }
    });

    app.post('/orders', async (req, res) => {
        if(req.body) {
            const newOrder = orderMapper(req.body);
            addOrderSocket(newOrder);
            addOrderFB(newOrder);
            res.send(newOrder);            
        } else {
            res.status(520);
            res.send({error: 'Invalid or Missing Data'});
        }
    });

    app.put('/orders', async (req, res) => {
        if(req.body && req.body.id) {
            const orderRef = doc(db, 'orders', req.body.id);
            const orderSnap = await getDoc(orderRef);
            if(orderSnap.exists()) {
                const order = orderMapper(req.body, true, orderSnap.data() as Order);
                addOrderSocket(order, true);
                addOrderFB(order, true);
                res.send(withDate(order, ['createdDate', 'startedDate', 'approvedDate', 'declinedDate', 'abandonedDate', 'endedDate']));
                adminApp.messaging().send({
                    token: order.mechanic?.fcm || '',
                    notification: {
                        title: 'New Order',
                        body: 'Order from ' + order.customer?.firstname
                    },
                    android: {
                        notification: {
                            title: 'New Order',
                            body: 'Order from ' + order.customer?.firstname,                            
                        },
                        data: {
                            orderId: order.id
                        },
                        priority: 'high'
                    }
                })
            } else {
                res.status(521);
                res.send({error: 'Resource not found'});
            }
        } else {
            res.status(520);
            res.send({error: 'Invalid or Missing Data'});
        }
    })

    const orderMapper = (data: any, isUpdate?: boolean, orderToUpdate?: Order): Order => {
        return (isUpdate ? {...orderToUpdate, ...data} : {            
            ...data,
            id: v4(),
            createdDate: new Date(),
            status: 'IDLE',
            approvalStatus: 'PENDING',
            otp: randomOtp()
        });
    }

    const addOrderSocket = (order: Order, isUpdate?: boolean) => {
        if(socket) {
            socket.emit(isUpdate ? 'update_order' : 'new_order', order);
        }
    }

    const addOrderFB = async (order: Order, isUpdate?: boolean) => {
        if(db) {
            await setDoc(doc(db, 'orders', order.id), order);
        }
    }
}
