import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
const port = 80;


app.get('/', (req, res) => {
    res.send("Hello");
});

app.listen(port, () => {
    console.log('Server started at :' + port);
});