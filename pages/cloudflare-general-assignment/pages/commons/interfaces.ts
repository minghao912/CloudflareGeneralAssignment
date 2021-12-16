// The format for each post
export interface Post {
    postID: string,
    title: string,
    username: string,
    timestamp: string,
    content: string,
    upvotes: number,
    downvotes: number,
    image?: string
}

// The format for a newly created post
export interface NewlyCreatedPost {
    title: string,
    username: string,
    timestamp: string,
    content: string,
    image?: string
}