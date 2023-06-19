import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import TweetInput from "./TweetInput";
import styles from "./Feed.module.css";
import Post from "./Post";

type POSTS = {
  id: string;
  avatar: string;
  image: string;
  text: string;
  timestamp: string | null;
  username: string;
};

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<POSTS[]>([]);

  useEffect(() => {
    const unSub = db
      .collection("posts")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) =>
        setPosts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            avatar: doc.data().avatar,
            image: doc.data().image,
            text: doc.data().text,
            timestamp: doc.data().timestamp,
            username: doc.data().username,
          }))
        )
      );
    return () => {
      unSub();
    };
  }, []);
  return (
    <div className={styles.feed}>
      <TweetInput />
      {posts[0]?.id && (
        <>
          {posts.map((post) => {
            return (
              <Post
                key={post.id}
                id={post.id}
                avatar={post.avatar}
                image={post.image}
                text={post.text}
                timestamp={post.timestamp}
                username={post.username}
              />
            );
          })}
        </>
      )}
    </div>
  );
};

export default Feed;
