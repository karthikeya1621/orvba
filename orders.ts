import { app, socket } from ".";
import { Order } from "./models";
import { v4 } from "uuid";

export const orders = () => {
    app.get('/orders', (req, res) => {
        const orders: Order[] = [];
        res.send(orders);
    });

    app.post('/orders', (req, res) => {
        console.log(req.body);
        if(req.body) {
            const newOrder = orderMapper(req.body);
            socket.emit('new_order', newOrder);
            res.send(newOrder);
        } else {
            res.send({error: 'Invalid or Missing Data'});
        }
    });

    const orderMapper = (data: any): Order => {
        return ({
            id: v4(),
            created_date: new Date(),
            status: 'IDLE',
            approvalStatus: 'PENDING',
            ...data
        });
    }
}
