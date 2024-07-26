const axios = require('axios');

function main(event, context, callback) {
    if(event=="get_nasa_image") {
        const { key } = context;
        axios.get(`https://api.nasa.gov/planetary/apod?api_key=${key}`)
        .then(response => {
            if(callback) callback({
                explanation: response.data.explanation
            });
        })
        .catch(error => {
            if(callback) callback({
                error: error.message
            });
        });   
    }
}


main(G_EVENT_NAME,G_CONTEXT,G_CALLBACK);