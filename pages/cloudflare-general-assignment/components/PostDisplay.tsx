import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';

import { Box, Card, CardActions, CardContent, CardHeader, Button, Typography, Tooltip, CardMedia } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

import { Post } from '../commons/interfaces';
import { BACKEND_URL } from '../commons/constants';

export default function PostDisplay(props: any): JSX.Element {
    const [postsToDisplay, setPostsToDisplay] = useState<JSX.Element[]>([] as JSX.Element[]);
    const [refresh, setRefresh] = useState<boolean>(false);

    function forceRefresh(): void {
        setRefresh(!refresh);
    }

    // On load, get the posts, format them as cards, and then render
    useEffect(() => {
        async function anonymous() {
            await getPosts().then(response => {
                setPostsToDisplay(cardsGenerator(sortPosts(response), forceRefresh));
            }).catch(err => console.error("There was an error getting posts", err));
        }

        anonymous();
    }, [refresh]);

    return (
        <Box sx={{ mt: '5%' }}>
            {(!postsToDisplay || postsToDisplay.length == 0) ? "Loading..." : postsToDisplay}
        </Box>
    );
}

// Gets posts from backend
async function getPosts(): Promise<Post[]> {
    return new Promise((resolve, reject) => {
        axios.get(`${BACKEND_URL}/posts`).then(response => {
            resolve(response.data as Post[]);
        }).catch(err => reject(err));
    });
}

// Generate the card display for all the posts
function cardsGenerator(posts: Post[], forceRefreshCallback: () => void): JSX.Element[] {
    let cards = [] as JSX.Element[];
    for (const post of posts) {
        let cardImage: JSX.Element;
        if (post.image && post.image != "") {
            cardImage = (<CardMedia
                component="img"
                width="100%"
                image={post.image}
            />);
        } else cardImage = <></>;

        cards.push(<Card sx={{ maxWidth: "100%", margin: "2%" }} id={post.postID} key={post.postID}>
            <CardHeader 
                title={post.title}
                subheader={post.username + ", " + new Date(post.timestamp).toLocaleString().replace(", ", " at ")}
            />
            {cardImage}
            <CardContent>
                <Typography variant="body1" color="text.primary">
                    {post.content}
                </Typography>
            </CardContent>
            <CardActions disableSpacing>
                <Tooltip title="Upvotes">
                    <Typography sx={{marginLeft:"1%"}} variant="body1" color="seagreen">{post.upvotes}</Typography>
                </Tooltip>
                <Button onClick={() => updateVotes(post, true, forceRefreshCallback)}>
                    <FontAwesomeIcon icon={faArrowUp} />
                </Button> 
                <Tooltip title="Overall">
                    <Typography variant="body1" color="text.secondary">{post.upvotes - post.downvotes}</Typography>
                </Tooltip>
                <Button onClick={() => updateVotes(post, false, forceRefreshCallback)}>
                    <FontAwesomeIcon icon={faArrowDown} />
                </Button>
                <Tooltip title="Downvotes">
                    <Typography variant="body1" color="salmon">{post.downvotes}</Typography>
                </Tooltip>
            </CardActions>
        </Card>);
    }

    return cards;
}

// sort the posts by recent
function sortPosts(posts: Post[]): Post[] {
    return posts.sort((a: Post, b: Post): number => {
        const aTime = new Date(a.timestamp), bTime = new Date(b.timestamp);

        // If B's time is more recent than A's, put B before A
        if (bTime > aTime) {
            return 1;
        } else if (bTime < aTime) {
            return -1;
        } else return 0;
    });
}

function updateVotes(post: Post, up: boolean, forceRefreshCallback: () => void): void {
    updatePost({
        postID: post.postID,
        title: post.title,
        username: post.username,
        timestamp: post.timestamp,
        content: post.content,
        upvotes: (up ? post.upvotes + 1 : post.upvotes),
        downvotes: (!up ? post.downvotes + 1 : post.downvotes),
        image: post.image
    }, forceRefreshCallback);
}

// update post with new info
async function updatePost(newPost: Post, forceRefreshCallback: () => void): Promise<void> {
    axios.put(`${BACKEND_URL}/posts`, newPost).then(response => {
        console.log(response);
        forceRefreshCallback();
    }).catch(err => {
        console.error(err);
    })
}