import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare, faBars, faEnvelope, faBell, faUserCircle, faTruckLoading } from '@fortawesome/free-solid-svg-icons';
import { Container, Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material';


import styles from "./index.module.css";

export default function Home(props: any): JSX.Element {
    const router = useRouter();

    function featureNotImplemented() {
        alert("This feature has not been implemented yet");
    }

    return (<>
        <Box sx={{
                width: '100vw',
                height: '100vh',
                margin: '0 0 0 0',
                padding: '0 0 0 0',
                boxSizing: 'border-box'
            }}
            className="homepage-container"
        >
            {/* Top menu bar */}
            <AppBar position="static">
                <Toolbar sx={{
                    backgroundColor: "grey"
                }}>
                    <IconButton 
                        size="large"
                        edge="start"
                        color="inherit"
                        sx={{ mr: 2 }}
                        onClick={featureNotImplemented}
                    >
                        <FontAwesomeIcon icon={faBars} />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        component="span"
                        sx={{ display: { xs: 'none', sm: 'block' } }}
                    >
                        Cloudbook
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            sx={{ mr: 2 }}
                            onClick={featureNotImplemented}
                        >
                            <FontAwesomeIcon icon={faEnvelope} />
                        </IconButton>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            sx={{ mr: 2 }}
                            onClick={featureNotImplemented}
                        >
                            <FontAwesomeIcon icon={faBell} />
                        </IconButton>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            sx={{ mr: 2 }}
                            onClick={featureNotImplemented}
                        >
                            <FontAwesomeIcon icon={faUserCircle} />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            {/* Show the posts */}
            <Container maxWidth="sm">
                <PostDisplay />
            </Container>
        </Box>
        <div className={styles.floatBottomRight} onClick={() => router.push("/create-post")}>
            <FontAwesomeIcon icon={faPlusSquare} size={"3x"} className={styles.centeredItem} />
        </div>
    </>);
}

function PostDisplay(props: any): JSX.Element {
    const [postsToDisplay, setPostsToDisplay] = useState<JSX.Element[]>([] as JSX.Element[]);

    // On load, get the posts, format them as cards, and then render
    useEffect(() => {
        getPosts().then(response => {
            setPostsToDisplay(cardsGenerator(response));
        }).catch(err => console.error("There was an error getting posts", err));
    }, []);

    return (
        <Box sx={{ mt: '5%' }}>
            {(!postsToDisplay || postsToDisplay.length == 0) ? "Loading..." : postsToDisplay}
        </Box>
    );
}

// The format for each post
interface Post {
    title: string,
    username: string,
    timestamp: string,
    content: string
}

// Gets posts from backend
async function getPosts(): Promise<Post[]> {
    return new Promise((resolve, reject) => {
        axios.get("http://127.0.0.1:8787/posts").then(response => {
            resolve(response.data as Post[]);
        }).catch(err => reject(err));
    });
}

function cardsGenerator(posts: Post[]): JSX.Element[] {
    let cards = [] as JSX.Element[];
    for (const post of posts) {
        cards.push(<div>{JSON.stringify(post)}</div>);
    }

    return cards;
}