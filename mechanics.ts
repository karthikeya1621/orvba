import { app, socket, db } from ".";
import { Mechanic } from "./models";
import { v4 } from "uuid";
import { collection, doc, getDoc, limit, setDoc, query, orderBy, getDocs } from "firebase/firestore";
import { randomOtp, withDate } from "./utils";

export const mechanics = () => {
    app.get('/mechanics', async (req, res) => {
        try {
            const params: any = req.params;
        const mechanicsRef = collection(db, 'mechanics');
        let mechanicsQuery = query(mechanicsRef, orderBy('createdDate', 'desc'));
        if(params && params['sort_by']) {
            const sortMechanic = params['sort_order'] || 'asc';
            mechanicsQuery = query(mechanicsQuery, orderBy(params['sort_by'], params['sort_order']));  
        }
        if(params && params['limit']) {
            mechanicsQuery = query(mechanicsQuery, limit(params['limit']));
        }
        let mechanics: Mechanic[] = (await getDocs(mechanicsQuery)).docs.map(mechanic => mechanic.data() as Mechanic);
        mechanics = mechanics.map(mechanic => withDate(mechanic, ['createdDate', 'startedDate', 'approvedDate', 'declinedDate', 'abandonedDate', 'endedDate']));
        res.send(mechanics);
        } catch(e) {
            res.status(522);
            res.send({error: e});
        }
    });

    app.post('/mechanics', (req, res) => {
        if(req.body) {
            const newMechanic = mechanicMapper(req.body);
            addMechanicSocket(newMechanic);
            addMechanicFB(newMechanic);
            res.send(newMechanic);
        } else {
            res.status(520);
            res.send({error: 'Invalid or Missing Data'});
        }
    });

    app.put('/mechanics', async (req, res) => {
        if(req.body && req.body.id) {
            const mechanicRef = doc(db, 'mechanics', req.body.id);
            const mechanicSnap = await getDoc(mechanicRef);
            if(mechanicSnap.exists()) {
                const mechanic = mechanicMapper(req.body, true, mechanicSnap.data() as Mechanic);
                console.log(mechanic);
                addMechanicSocket(mechanic, true);
                addMechanicFB(mechanic, true);
                res.send(withDate(mechanic, ['createdDate', 'startedDate', 'approvedDate', 'declinedDate', 'abandonedDate', 'endedDate']));
            } else {
                res.status(521);
                res.send({error: 'Resource not found'});
            }
        } else {
            res.status(520);
            res.send({error: 'Invalid or Missing Data'});
        }
    })

    const mechanicMapper = (data: any, isUpdate?: boolean, mechanicToUpdate?: Mechanic): Mechanic => {
        return (isUpdate ? {...mechanicToUpdate, ...data} : {            
            ...data,
            id: v4(),
            created_date: new Date(),
            status: 'IDLE',
            approval_status: 'PENDING',
            otp: randomOtp()
        });
    }

    const addMechanicSocket = (mechanic: Mechanic, isUpdate?: boolean) => {
        if(socket) {
            socket.emit(isUpdate ? 'update_mechanic' : 'new_mechanic', mechanic);
        }
    }

    const addMechanicFB = async (mechanic: Mechanic, isUpdate?: boolean) => {
        if(db) {
            await setDoc(doc(db, 'mechanics', mechanic.id), mechanic);
        }
    }
}
