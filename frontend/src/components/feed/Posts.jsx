import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const notyf = new Notyf(); // Create a single instance of Notyf

const SubmitPost = ({title, content, visibility}) => {
 console.log(title, content, visibility)
 const newPost = {
    title: title,
    content: content,
    visibility: visibility,
    type: "newPost"
 }
 // Make a POST request to the server
 fetch("/post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newPost),
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle the response from the server
      console.log(data);
        // display posts
        notyf.success("New Post Submitted")
    })
    .catch((error) => {
      // Handle any errors
      console.error("Error:", error);
    });
}
const Tags = ({tag}) => {
  console.log("new tag", tag)
  return (
    <>
    <div style="background-color: green;" width="20px" height="20px">{tag}</div>
    </>
  )
 }


export {SubmitPost, Tags};