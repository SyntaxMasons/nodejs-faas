import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import vm from 'vm';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/server/health', (req, res) => {
    res.status(200).send('OK');
});

app.post('/function/:function_name', (req, res) => {
    const function_name = req.params.function_name;
    fs.readFile(`functions/${function_name}.mjs`, 'utf8', (err, code) => {
        if (err) {
            console.error(`Error reading file all_function/${function_name}.mjs: ${err}`);
            res.send('Data received successfully!');
            return;
        }

        const { event_name, event_data } = req.body;
        const context_object = {
            G_EVENT_NAME: event_name,
            G_CONTEXT: event_data,
            G_CALLBACK: null,
            console : console,
        };
        try {
            vm.runInNewContext(code,context_object);
            res.status(200).json({
                "status": "OK",
                "code": 200,
                "message": "",
                "event_name": event_name,
                "payload": {}
            }); 
        } catch (error) {
            res.status(400).json({
                "status": "ERROR",
                "code": 400,
                "message": error.message,
                "event_name": event_name,
                "payload": {}
            }); 
        }
        
    });
});

const PORT = process.env.PORT || 9256;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});