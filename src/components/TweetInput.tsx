import React, { useState } from "react";
import styles from "./TweetInput.module.css";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { auth, storage, db } from "../firebase";
import { Avatar, Button, IconButton } from "@mui/material";
import { AddAPhoto } from "@mui/icons-material";

import firebase from "firebase";
import { error } from "console";

const TweetInput = () => {
  //Reduxにあるログインしたユーザー(selectUser)を持ってくる
  const user = useSelector(selectUser);
  const [tweetImage, setTweetImage] = useState<File | null>(null);
  const [tweetMsg, setTweetMsg] = useState("");
  //
  //画像変更時の関数
  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      setTweetImage(e.target.files![0]);
      e.target.value = "";
    }
  };
  //
  //ツイートボタンを押した時の関数
  const sendTweet = (e: React.FormEvent) => {
    e.preventDefault();
    //データベースに保存したいものをオブジェクトとして追加する
    if (tweetImage) {
      //ランダムなファイル名を作成
      //
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + tweetImage.name;
      //
      //storageへの参照先をrefで作成してその場所(imagesディレクトリの中)に画像を保存
      const uploadTweetImage = storage
        .ref(`images/${fileName}`)
        .put(tweetImage);
      //
      //storageのアップロードの状態の変化のイベントリスナー
      //
      uploadTweetImage.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        //
        ////進捗状況のコールバック関数
        () => {},
        //
        ////エラーハンドラー
        (error) => {
          alert(error.message);
        },
        //
        //アップロード完了時のコールバック関数
        async () => {
          await storage
            .ref("images") //storageのimagesディレクトリ参照する
            .child(fileName) //imageディレクトリの中のfileNameを探す
            .getDownloadURL()
            .then(async (url) => {
              await db.collection("posts").add({
                avatar: user.photoUrl,
                image: url, //画像あり
                text: tweetMsg,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                username: user.displayName,
              });
            });
        }
      );
      setTweetImage(null);
      setTweetMsg("");
    } else {
      //画像をツイートしない場合
      db.collection("posts").add({
        avatar: user.photoUrl,
        image: "", //画像なし
        text: tweetMsg,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        username: user.displayName,
      });
      setTweetImage(null);
      setTweetMsg("");
    }
  };
  return (
    <>
      <form onSubmit={sendTweet}>
        <div className={styles.tweet_form}>
          <Avatar
            className={styles.tweet_avatar}
            src={user.photoUrl}
            onClick={async () => await auth.signOut()}
          />
          <input
            className={styles.tweet_input}
            placeholder="What's happening?"
            type="text"
            autoFocus
            value={tweetMsg}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTweetMsg(e.target.value)
            }
          />
          <IconButton>
            <label>
              <AddAPhoto
                className={
                  tweetImage ? styles.tweet_addIconLoaded : styles.tweet_addIcon
                }
              />
              <input
                className={styles.tweet_hiddenIcon}
                type="file"
                onChange={onChangeImageHandler}
              />
            </label>
          </IconButton>
        </div>
        <Button
          type="submit"
          disabled={!tweetMsg}
          className={
            tweetMsg ? styles.tweet_sendBtn : styles.tweet_sendDisableBtn
          }
        >
          Tweet
        </Button>
      </form>
    </>
  );
};

export default TweetInput;
