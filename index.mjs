import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import vm from 'vm';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';


function generateAlphanumericName(length = 10) {
    const alphanumericCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += alphanumericCharacters.charAt(Math.floor(Math.random() * alphanumericCharacters.length));
    }
    return result;
}


const upload = multer({ dest: 'uploads/' });

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.get('/server/health', (req, res) => {
    res.status(200).send('OK');
});

app.head('/server/health', (req, res) => {
    res.status(200).send();
});

app.get('/function/list', (req, res) => {
    fs.readdir('functions', (err, files) => {
        if (err) {
            return res.status(500).json({
                "status": "ERROR",
                "code": 500,
                "message": err.message,
                "payload": {}
            });
        }

        res.status(200).json({
            "status": "OK",
            "code": 200,
            "message": "",
            "payload": {
                "functions": files
            }
        });
    });
});

app.post('/function/create', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            "status": "ERROR",
            "code": 400,
            "message": "No file uploaded",
            "payload": {}
        });
    }

    const file = req.file;
    const file_id = generateAlphanumericName(25);
    const file_name = `${file_id}.mjs`;
    fs.renameSync(file.path, `functions/${file_name}`);
    res.status(200).json({
        "status": "OK",
        "code": 200,
        "message": "File uploaded successfully",
        "payload": {
            "functions_id": file_id
        }
    });
});

app.delete('/function/:function_id', (req, res) => {
    const function_id = req.params.function_id;
    const file_name = `${function_id}.mjs`;

    fs.unlink(`functions/${file_name}`, (err) => {
        if (err) {
            return res.status(500).json({
                "status": "ERROR",
                "code": 500,
                "message": err.message,
                "payload": {}
            });
        }

        res.status(200).json({
            "status": "OK",
            "code": 200,
            "message": "File deleted successfully",
            "payload": {}
        });
    });
});

app.post('/function/execute/:function_id', async (req, res) => {
    await new Promise((resolve, reject) => {
        if (!req.body || Object.keys(req.body).length === 0) {
            reject(new Error("Request body is empty or not valid JSON"));
            return;
        }
        const function_id = req.params.function_id;
        fs.readFile(`functions/${function_id}.mjs`, 'utf8', (err, code) => {
            if (err) {
                reject(new Error(err.message));
                return;
            }
            const { event_name, event_data } = req.body;
            const context_object = {
                console: console,
                G_EVENT_NAME: event_name,
                G_CONTEXT: event_data,
                G_CALLBACK: (response_payload) => {
                    resolve(response_payload);
                },
                require: (module_name) => {
                    switch (module_name) {
                        case "axios":
                                return axios;
                            break;
                    
                        default:
                                throw new Error(`Module '${module_name}' is not allowed.`);
                            break;
                    }
                }
            };

            try {
                vm.runInNewContext(code, context_object);
            } catch (error) {
                reject(new Error(error));
            }
        });
    }).then((response_payload) => {
        res.status(200).json({
            "status": "OK",
            "code": 200,
            "message": "",
            "payload": response_payload
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
