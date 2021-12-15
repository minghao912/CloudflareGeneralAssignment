addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
})

async function handleRequest(request) {
    // Only valid URL is .../posts
    let route = request.url.split('/')[3];
    if (route !== "posts") {
        return new Response("Invalid URL", { headers: { "content-type": "text/plain" } }, { status: 400 });
    }

    // Respond to request
    let response;
    if (request.method === "GET") {
        response = await getAllPosts(request);
    } else if (request.method === "PUT") {
        response = await updatePost(request);
    } else if (request.method === "POST") {
        response = await addNewPost(request, myHeaders);
    } else if (request.method === "OPTIONS") {
        response = handleOptions(request);
    } else {
        response = new Response("Method not allowed", {headers: { "content-type": "text/plain" }}, { status: 500 });
    }

    return response;
}

function handleOptions(request) {
    const myHeaders = new Headers();
    myHeaders.set("Access-Control-Allow-Origin", '*');
    myHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, PUT, POST, OPTIONS");
    myHeaders.set("Access-Control-Allow-Headers", "Origin, Content-Type, X-Auth-Token, Accept");
    myHeaders.set("Access-Control-Allow-Credentials", "true");
    myHeaders.set("Access-Control-Max-Age", "86400",);
    myHeaders.set("Content-Type", "application/json, text/plain, */*");

    if (request.headers.get("Origin") !== null &&
        request.headers.get("Access-Control-Request-Method") !== null &&
        request.headers.get("Access-Control-Request-Headers") !== null) {

        // Handle CORS pre-flight request.
        return new Response(null, {
            headers: myHeaders
        })
    } else {
        // Handle standard OPTIONS request.
        return new Response(null, {
            headers: {
                "Allow": "GET, HEAD, PUT, POST, OPTIONS",
            }
        })
    }
}

async function getAllPosts(request) {
    // Get all the keys in the namespace
    const listOfKeys = await MY_KV.list();

    // Get the value associated with each key and put it in array
    let arrayOfPosts = [];
    for (const key of listOfKeys.keys) {
        let post = await MY_KV.get(key.name);
        
        let modified = {
            postID: key.name,
            ...JSON.parse(post)
        }

        arrayOfPosts.push(JSON.stringify(modified));
    }

    // Return array of posts
    return new Response("[" + arrayOfPosts + "]", {
        headers: { "Access-Control-Allow-Origin": '*', "Content-Type": "application/json"}
    });
}

async function updatePost(request) {
    const body = await request.json();

    // Make sure all fields of post are populated
    if (!body.title || !body.username || !body.timestamp || !body.content) {
        return new Response("Invalid post format", { headers: { "content-type": "text/plain" } }, { status: 400 });
    }

    // Upvote and downvote default to 0 if not defined
    let preparedPost = body;
    if (!body.upvotes) {
        preparedPost = {...body, "upvotes": 0}
    } 
    if (!body.downvotes) {
        preparedPost = { ...body, "downvotes": 0 }
    }

    // Put the post into database
    const success = await MY_KV.put(body.postID, JSON.stringify(preparedPost)).catch(err => {
        return new Response(JSON.stringify({ "success": "false", "error": err }), {
            headers: { "Access-Control-Allow-Origin": '*', "Content-Type": "application/json" }
        });
    });
    const post = await MY_KV.get(body.postID);

    return new Response(JSON.stringify({ "success": "true", "post": post }), {
        headers: { "Access-Control-Allow-Origin": '*', "Content-Type": "application/json" }
    });
}

async function addNewPost(request, headers) {
    // Generate a post ID for the key
    const postID = self.crypto.randomUUID();

    // Get body of request
    const body = await request.json();

    // Make sure all fields of post are populated
    if (!body.title || !body.username || !body.timestamp || !body.content) {
        return new Response("Invalid post format", { headers: { "content-type": "text/plain" } }, { status: 400 });
    }

    // Add upvotes and downvotes, default 0
    let preparedPost = Object.assign(body, {"upvotes": 0, "downvotes": 0});

    // Put the post into database
    const success = await MY_KV.put(postID, JSON.stringify(preparedPost));
    const post = await MY_KV.get(postID);

    return new Response({"success": "true", "post": post}, {
        headers: { "Access-Control-Allow-Origin": '*', "Content-Type": "application/json" }
    });
}