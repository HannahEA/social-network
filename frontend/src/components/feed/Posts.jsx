import React, { useEffect, useState } from "react";
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

const Posts = () => {
  const [pData, setpData] = useState([])
  
  let getPosts = {
    cookie: document.cookie, 
    type: "getPosts"
  }

  const fetchPosts = () => {
    fetch("/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getPosts),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response from the server 
        setpData(data)
          // display posts
          
      })
      .catch((error) => {
        // Handle any errors
        console.error("Error:", error);
      });
  }

  useEffect(() => {
    fetchPosts()
  }, [])


  const [commentContent, setCommentContent] = useState("")

  const handleContent = (event) => {
    setCommentContent(parseInt(event.target.value))
  }
  const handleGetComments = (event) => {
    console.log(event.target.value)
    Comments(parseInt(event.target.value))
  }
  const handleSendComment = (event) => {
    event.preventDefault();
    SubmitComment(commentContent, event.target.value)
  }
    return (
      <div>
        {pData.length > 0 && (
          <div className="flex grid grid-cols-2 gap-4 mb-4">
            
            {pData.map(post => (
              <div key={post.postId} id={post.postId} className="flex flex-col justify-center border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-48 md:h-72" >
                <h1 className="text-4xl text-center ">{post.title}</h1>
                <h2 className="text-xl text-center ">{post.author}</h2>
                <h2 className="text-xl text-center ">{post.date}</h2>
                <h2 className="text-xl text-center ">{post.content}</h2>
                <h2 className="text-xl text-center ">{post.category}</h2>
                <button onClick={(e) =>handleGetComments(e)} value={post.postId} type="submit" className="text-xl text-center text-blue-300">Comments</button>
                <div  className="flex justify-center">
                  <input onChange={(e)=>handleContent(e)}  className="m-2" type="text" />
                  <button onClick={(e) => handleSendComment(e)} value={post.postId} type="submit">Submit</button>
                </div>
                
              </div>
            ))}

          </div>
      )}
      </div>
    );
 }
const Comments = (postId) =>  {
  const getComments = {
    postId: postId,
    type: "getComments"
 }
 const json = JSON.stringify(getComments)
 console.log(json)

    fetch("/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getComments),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response from the server
        console.log("comment data", data);
          // display posts
          
      })
      .catch((error) => {
        // Handle any errors
        console.error("Error:", error);
      });
  



}

const SubmitComment = (comment, postId) => {
  console.log(comment, postId)
 
 const newComment = {
    postId: postId,
    content: comment,
    type: "newComment"
 }
 const json = JSON.stringify(newComment)
console.log("json", json)
 // Make a POST request to the server
 
  fetch("/post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newComment),
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle the response from the server
      console.log(data);
        // display posts
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


export {SubmitPost, Tags, Posts};