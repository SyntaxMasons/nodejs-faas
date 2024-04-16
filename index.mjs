import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import vm from 'vm';
import cors from 'cors';

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            "status": "ERROR",
            "code": 400,
            "message": "Request body is empty or not valid JSON",
            "payload": {}
        });
    }
    next();
});

app.get('/server/health', (req, res) => {
    res.status(200).send('OK');
});

app.post('/function/:function_name', async (req, res) => {
    await new Promise((resolve, reject) => {
        if (!req.body || Object.keys(req.body).length === 0) {
            reject(new Error("Request body is empty or not valid JSON"));
            return;
        }
        const function_name = req.params.function_name;
        fs.readFile(`functions/${function_name}.mjs`, 'utf8', (err, code) => {
            if (err) {
                reject(new Error(err.message));
                return;
            }
            const { event_name, event_data } = req.body;
            const context_object = {
                G_EVENT_NAME: event_name,
                G_CONTEXT: event_data,
                G_CALLBACK: null,
                console: console,
            };

            try {
                vm.runInNewContext(code, context_object);
                resolve();
            } catch (error) {
                reject(new Error(error));
            }
        });
    }).then(() => {
        res.status(200).json({
            "status": "OK",
            "code": 200,
            "message": "",
            "payload": {}
        });
    }).catch((error) => {
        res.status(400).json({
            "status": "ERROR",
            "code": 400,
            "message": error.message,
            "payload": {}
        }); 
    });
});

const PORT = process.env.PORT || 9256;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});