import React from "react";
import { useRouter } from "next/router";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { Container, Box, AppBar, Toolbar, Typography } from '@mui/material';

import PostCreator from "./components/PostCreator";
import styles from "./index.module.css";

export default function CreatePost(props: any): JSX.Element {
    const router = useRouter();

    function routeChangeHome() {
        router.push("/");
    }

    return (<>
        <Box sx={{
                width: "100vw",
                height: "100vh",
                margin: '0 0 0 0',
                padding: '0 0 0 0',
                boxSizing: 'border-box'
            }}
            className="homepage-container"
        >
            <AppBar position="static">
                <Toolbar sx={{
                    backgroundColor: "grey"
                }}>
                    <Typography variant="h3" marginTop="1%" marginBottom="1%">
                        Create New Post
                    </Typography>
                </Toolbar>
            </AppBar>
            <Container maxWidth="xl">
                <PostCreator routeChangeHome={routeChangeHome} />
            </Container>
        </Box>
        <div className={styles.floatBottomRight} onClick={() => routeChangeHome()}>
            <FontAwesomeIcon icon={faHome} size={"2x"} className={styles.centeredItem} />
        </div>
    </>);
}