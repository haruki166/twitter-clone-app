import React, { useEffect, useState } from "react";
import styles from "./Post.module.css";
import { db } from "../firebase";
import firebase from "firebase";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { Avatar } from "@mui/material";
import { makeStyles } from "@mui/material/styles";
import { Message } from "@mui/icons-material";
import { Send } from "@mui/icons-material";

type PROPS = {
  id: string;
  avatar: string;
  image: string;
  text: string;
  timestamp: any;
  username: string;
};

type COMMENT = {
  id: string;
  avatar: string;
  text: string;
  timestamp: any;
  username: string;
};

const Post: React.FC<PROPS> = (props) => {
  const { id, avatar, image, text, timestamp, username } = props;
  const loginUser = useSelector(selectUser);
  const [comment, setComment] = useState("");
  const [openComment, setOpenComment] = useState(false);
  const [comments, setComments] = useState<COMMENT[]>([
    {
      id: "",
      avatar: "",
      text: "",
      timestamp: null,
      username: "",
    },
  ]);
  //
  //投稿に対するコメントを送信した時の処理
  const newComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //
    //databaseのcollectionを多階層にして投稿とコメントを紐付けて追加する
    db.collection("posts").doc(id).collection("comments").add({
      avatar: loginUser.photoUrl, //コメントをしたアカウント
      text: comment,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      username: loginUser.displayName,
    });
    setComment("");
  };
  //   console.log(props);

  useEffect(() => {
    const unSub = db
      .collection("posts")
      .doc(id)
      .collection("comments")
      .orderBy("timestamp", "asc")
      .onSnapshot((snapshot) => {
        setComments(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            avatar: doc.data().avatar,
            text: doc.data().text,
            username: doc.data().username,
            timestamp: doc.data().timestamp,
          }))
        );
      });

    return () => {
      unSub();
    };
  }, [props, id]);

  //   const onDeletePost = (id) => {

  //   };

  return (
    <div className={styles.post}>
      <div className={styles.post_container}>
        <div className={styles.post_avatar}>
          <Avatar src={avatar} />
        </div>
        <div className={styles.post_body}>
          <div>
            <div className={styles.post_header}>
              <h3>
                <span className={styles.post_headerUser}>@{username}</span>
                <span className={styles.post_headerTime}>
                  {new Date(timestamp?.toDate()).toLocaleString()}
                </span>
              </h3>
              {/* {username === loginUser.displayName && <button>削除</button>} */}
            </div>
            <div className={styles.post_tweet}>
              <p>{text}</p>
            </div>
            {image && (
              <div className={styles.post_tweetImage}>
                <img src={image} alt="Tweet Image" />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={styles.post_comment_container}>
        <Message
          className={styles.post_commentIcon}
          onClick={() => setOpenComment((prev) => !prev)}
        />
        {openComment &&
          comments.map((com) => (
            <>
              <div className={styles.post_comment} key={com.id}>
                <Avatar src={com.avatar} sx={{ width: 24, height: 24 }} />
                <span className={styles.post_commentUser}>@{com.username}</span>
                <span className={styles.post_headerTime}>
                  {new Date(com.timestamp?.toDate()).toLocaleString()}
                </span>
                <span className={styles.post_commentText}>{com.text}</span>
              </div>
            </>
          ))}
        {openComment && (
          <form onSubmit={newComment}>
            <div className={styles.post_form}>
              <input
                className={styles.post_input}
                type="text"
                placeholder="Type new comment"
                value={comment}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setComment(e.target.value)
                }
              />
              <button
                disabled={!comment}
                className={
                  comment ? styles.post_button : styles.post_buttonDisable
                }
                type="submit"
              >
                <Send className={styles.post_sendIcon} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Post;
