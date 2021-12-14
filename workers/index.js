addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
})

async function handleRequest(request) {
    // Only valid URL is .../posts
    let route = request.url.split('/')[3];
    if (route !== "posts") {
        return new Response("Invalid URL", { headers: { "content-type": "text/plain" } }, { status: 400 });
    }

    // Can do either a GET or POST request
    let response;

    if (request.method === "GET") {
        response = await getAllPosts();
    } else if (request.method === "POST") {
        response = await addNewPost(request);
    } else {
        response = new Response("Expected GET or POST", {headers: { "content-type": "text/plain" }}, { status: 500 });
    }

    return response;
}

async function getAllPosts() {
    // Get all the keys in the namespace
    const listOfKeys = await MY_KV.list();

    // Get the value associated with each key and put it in array
    let arrayOfPosts = [];
    for (const key of listOfKeys.keys) {
        arrayOfPosts.push(await MY_KV.get(key.name));
    }

    // Return array of posts
    return new Response(arrayOfPosts, {
        headers: { "content-type": "text/plain" }
    });
}

async function addNewPost(request) {
    // Generate a message ID for the key
    const messageID = self.crypto.randomUUID();

    // Get body of request
    const body = await request.json();

    // Make sure all fields of post are populated
    if (!body.title || !body.username || !body.timestamp || !body.content) {
        return new Response("Invalid post format", { headers: { "content-type": "text/plain" } }, { status: 400 });
    }

    // Put the post into database
    const success = await MY_KV.put(messageID, JSON.stringify(body));
    const message = await MY_KV.get(messageID);

    return new Response("{success: true, \"message\": " + message + "}", {
        headers: { "content-type": "text/plain" }
    });
}