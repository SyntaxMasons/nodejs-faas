import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import swaggerUi from 'swagger-ui-express';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();


/* Utility to get __dirname in ES modules */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

/* OpenAPI DOC */
const openApiFilePath = path.join(__dirname, 'openapi.json');
const openApiDocument = JSON.parse(fs.readFileSync(openApiFilePath, 'utf8'));
app.use('/nodejsfaas/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));


/* Security Middleware */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({
        "status": "ERROR",
        "code": 401,
        "message": "Unauthorized access",
        "payload": {}
    });

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err || (decoded.expire_at == undefined || decoded.issued_at == undefined || decoded.issuer == undefined || decoded.namespace == undefined)) {
        return res.status(401).json({
          "status": "ERROR",
          "code": 401,
          "message": "Unauthorized access",
          "payload": {}
        });
      }
      req.decoded = decoded;
      next();
    });
};

  
app.get('/nodejsfaas/server/health', (req, res) => {
    res.status(200).send('OK');
});

app.head('/nodejsfaas/server/health', (req, res) => {
    res.status(200).send();
});

app.get('/nodejsfaas/function/list', authenticateToken, (req, res) => {
    fs.readdir(`functions/${req.decoded.namespace}`, (err, files) => {
        if (err) {
            return res.status(500).json({
                "status": "ERROR",
                "code": 500,
                "message": "Namespace does not exist, create function before listing",
                "payload": {}
            });
        }

        // Remove extensions from filenames
        const fileNamesWithoutExtension = files.map(file => path.basename(file, path.extname(file)));

        res.status(200).json({
            "status": "OK",
            "code": 200,
            "message": "",
            "payload": {
                "function_ids": fileNamesWithoutExtension
            }
        });
    });
});

app.post('/nodejsfaas/function/create', authenticateToken, upload.single('file'), (req, res) => {
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
    const directory = `functions/${req.decoded.namespace}`;
    
    // Ensure the directory exists
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    // Rename the uploaded file and move it to the correct directory
    fs.renameSync(file.path, path.join(directory, file_name));
    
    res.status(200).json({
        "status": "OK",
        "code": 200,
        "message": "File uploaded successfully",
        "payload": {
            "functions_id": file_id
        }
    });
});

app.delete('/nodejsfaas/function/:function_id', authenticateToken, (req, res) => {
    const function_id = req.params.function_id;
    const file_name = `${function_id}.mjs`;

    fs.unlink(`functions/${req.decoded.namespace}/${file_name}`, (err) => {
        if (err) {
            return res.status(500).json({
                "status": "ERROR",
                "code": 500,
                "message": "Failed to delete function",
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

app.post('/nodejsfaas/function/execute/:function_id', authenticateToken, async (req, res) => {
    await new Promise((resolve, reject) => {
        if (!req.body || Object.keys(req.body).length === 0) {
            reject(new Error("Request body is empty or not valid JSON"));
            return;
        }
        const function_id = req.params.function_id;
        fs.readFile(`functions/${req.decoded.namespace}/${function_id}.mjs`, 'utf8', (err, code) => {
            if (err) {
                reject(new Error("Function does not exist"));
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