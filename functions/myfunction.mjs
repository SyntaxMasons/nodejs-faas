import fs from 'fs';
function main(event, context, callback) {
    console.log("Received event: ", event);
    var data = {
        "greetings": "Hello prathik"
    };
    var string_val = "Shreyas"
    console.log(string_val.substring(1,2))
    
    if(callback) callback(null, data);
}

main(G_EVENT_NAME,G_CONTEXT,G_CALLBACK);