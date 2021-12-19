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
        response = await addNewPost(request);
    } else if (request.method === "OPTIONS") {
        response = handleOptions(request);
    } else {
        response = new Response("Method not allowed", {headers: { "content-type": "text/plain" }}, { status: 500 });
    }

    return response;
}

function handleOptions(request) {
    const myHeaders = new Headers();
    myHeaders.set("Access-Control-Allow-Origin", request.headers.get("Origin"));
    myHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, PUT, POST, OPTIONS");
    myHeaders.set("Access-Control-Allow-Headers", "Origin, Content-Type, X-Auth-Token, Accept, Set-Cookie");
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
        // Don't send the username KV pair
        if (key.name == "usernames")
            continue;

        let post = await MY_KV.get(key.name);
        
        let modified = {
            postID: key.name,
            ...JSON.parse(post)
        }

        arrayOfPosts.push(JSON.stringify(modified));
    }

    // Return array of posts
    return new Response("[" + arrayOfPosts + "]", {
        headers: { "Access-Control-Allow-Origin": request.headers.get("Origin"), "Content-Type": "application/json"}
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
            headers: { "Access-Control-Allow-Origin": request.headers.get("Origin"), "Access-Control-Allow-Credentials": "true", "Content-Type": "application/json" }
        });
    });
    const post = await MY_KV.get(body.postID);

    return new Response(JSON.stringify({ "success": "true", "post": post }), {
        headers: { "Access-Control-Allow-Origin": request.headers.get("Origin"), "Access-Control-Allow-Credentials": "true", "Content-Type": "application/json" }
    });
}

async function addNewPost(request) {
    // Generate a post ID for the key
    const postID = self.crypto.randomUUID();

    // Get headers and body of request
    const body = await request.json();
    const headers = Object.fromEntries(request.headers);

    // Make sure all fields of post are populated
    if (!body.title || !body.username || !body.timestamp || !body.content) {
        return new Response("Invalid post format", { headers: { "content-type": "text/plain" } }, { status: 400 });
    }

    // Add upvotes and downvotes, default 0
    let preparedPost = Object.assign(body, {"upvotes": 0, "downvotes": 0});

    // Check username
    const existingUsernames = JSON.parse(await MY_KV.get("usernames"));

    const tunnel = "fun-excited-professor-ozone";
    let cookie;
    let usernameOK = true;
    if (existingUsernames.includes(body.username)) {
        console.log("Existing username detected: ", body.username)

        // Prepare cookie
        let cookies = parseCookies(headers);
        let cookieToken;
        if (!cookies || !cookies["token"])
            cookieToken = "";
        else cookieToken = "token=" + cookies["token"];

        console.log("Cookie: ", cookieToken);

        // If existing username, check cookie
        await fetch(`https://${tunnel}.trycloudflare.com/verify`, {headers: {"Set-Cookie": cookieToken}}).then(async (response) => {
            await response.text().then(data => {
                const inputUsername = body.username.trim();
                const tokenUsername = data.trim();
                console.log("Input username: ", inputUsername);
                console.log("Token username: ", tokenUsername);

                if (inputUsername != tokenUsername) {
                    console.log("Username does not match cookie!");
                    usernameOK = false;
                }
            })
        });
    } else {
        console.log("New username: ", body.username)
        // If new username, create cookie
        await fetch(`https://${tunnel}.trycloudflare.com/auth/${body.username}`).then(response => {
            cookie = response.headers.get("Set-Cookie");
        }).catch(err => console.error(err));

        // Add username to array
        existingUsernames.push(body.username);
        await MY_KV.put("usernames", JSON.stringify(existingUsernames));
    }

    // Only proceed if username check is OK
    console.log("Username is OK: ", usernameOK);
    if (!usernameOK) {
        console.log("Username does not match cookie, aborting the creation of new post");
        return new Response(JSON.stringify({"success": "false"}), {
            headers: { "Access-Control-Allow-Origin": request.headers.get("Origin"), "Access-Control-Allow-Credentials": "true", "Content-Type": "application/json", "Set-Cookie": cookie },
            status: 400
        });
    }

    // Put the post into database
    const success = await MY_KV.put(postID, JSON.stringify(preparedPost));
    const post = await MY_KV.get(postID);

    // If there is a cookie to be sent, send it
    if (cookie) {
        return new Response(JSON.stringify({"success": "true", "post": post}), {
            headers: { "Access-Control-Allow-Origin": request.headers.get("Origin"), "Access-Control-Allow-Credentials": "true", "Content-Type": "application/json", "Set-Cookie": cookie }
        });
    }
    else return new Response(JSON.stringify({"success": "true", "post": post}), {
        headers: { "Access-Control-Allow-Origin": request.headers.get("Origin"), "Access-Control-Allow-Credentials": "true", "Content-Type": "application/json" }
    });
}

// Parse cookies
function parseCookies(headers) {
    let list = {};
    let rc = headers.cookie;

    if (!rc)
        return list;

    rc.split(';').forEach((cookie) => {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}