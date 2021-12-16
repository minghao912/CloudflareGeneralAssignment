import { useState } from 'react';
import axios from 'axios';

import { Box, Button, Card, TextField, Typography } from '@mui/material';

import { NewlyCreatedPost } from '../commons/interfaces';
import { BACKEND_URL } from '../commons/constants';

export default function PostCreator(props: {routeChangeHome: () => void}): JSX.Element {
    // Fields of the post
    const [title, setTitle] = useState("");
    const [username, setUsername] = useState("");
    const [content, setContent] = useState("");
    const [imageURL, setImageURL] = useState("");

    // Send post to backend
    function submitNewPost() {
        axios.post(`${BACKEND_URL}/posts`, {
            title: title,
            username: username,
            timestamp: new Date().toISOString(),
            content: content,
            image: (imageURL === "") ? "" : imageURL
        } as NewlyCreatedPost).then(response => {
            console.log("Successfully created a new post", response);
            props.routeChangeHome();
        }).catch(err => {
            alert("There was an error creating your post.");
            console.error(err);
        })
    }

    return (<Box sx={{width: "100%", height: "100%", mt: "3%"}}>
        <Box sx={{height: "75%", mb: "3%"}}>
            <TextField 
                sx={{
                    width: "100%",
                    mb: "2%"
                }}
                id="title-field"
                label = "Title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required
            />
            <TextField 
                sx={{
                    width: "49%",
                    mb: "2%",
                    mr: "1%"
                }}
                id="username-field"
                label = "Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required
            />
            <TextField 
                sx={{
                    width: "49%",
                    mb: "2%",
                    ml: "1%"
                }}
                id="image-link-field"
                label = "Image Link" 
                value={imageURL} 
                onChange={(e) => setImageURL(e.target.value)} 
            />
            <TextField 
                sx={{
                    width: "100%"
                }}
                multiline
                rows={16}
                id="content-field"
                label = "Content" 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                required
            />
        </Box>
        <Box sx={{height: "10%", mb: "4%"}} textAlign="center">
            <Button variant="contained" size="large" onClick={submitNewPost}>
                Create
            </Button>
        </Box>
    </Box>);
}