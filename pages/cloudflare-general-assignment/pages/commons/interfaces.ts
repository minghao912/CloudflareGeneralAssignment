// The format for each post
export interface Post {
    postID: string,
    title: string,
    username: string,
    timestamp: string,
    content: string,
    upvotes: number,
    downvotes: number
}