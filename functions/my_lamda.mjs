
function main(event, context, callback) {
    console.log("Sum of 10+20 : ", 10+20); 
    if(callback) callback(null, data);
}

main(G_EVENT_NAME,G_CONTEXT,G_CALLBACK);