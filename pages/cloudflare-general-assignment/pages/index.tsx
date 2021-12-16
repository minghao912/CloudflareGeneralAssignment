import React from "react";
import { useRouter } from "next/router";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare, faBars, faEnvelope, faBell, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { Container, Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material';

import PostDisplay from "../components/PostDisplay";
import styles from "./index.module.css";

export default function Home(props: any): JSX.Element {
    const router = useRouter();

    function featureNotImplemented() {
        alert("This feature has not been implemented yet");
    }

    return (<>
        <Box sx={{
                width: '99vw',
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
            <Container maxWidth="xl">
                <PostDisplay />
            </Container>
        </Box>
        <div className={styles.floatBottomRight} onClick={() => router.push("/create-post")}>
            <FontAwesomeIcon icon={faPlusSquare} size={"3x"} className={styles.centeredItem} />
        </div>
    </>);
}