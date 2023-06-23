import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const notyf = new Notyf(); // Create a single instance of Notyf

const SubmitPost = ({title, content, visibility, url, file}) => {

 console.log(url, file)
 const newPost = {
    title: title,
    content: content,
    visibility: visibility,
    url: url,
    file: file,
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
    setCommentContent(event.target.value)
  }
  const handleGetComments = (event) => {
    const Id = event.target.value.toString()
    console.log(event.target.value)
    const comments =  document.getElementById(Id)
    if (comments.style.display == "flex") {
      comments.style.display = "none"
    } else {
      comments.style.display = "flex"
    }
  }
  const handleSendComment = (event) => {
    event.preventDefault();
    SubmitComment(commentContent, parseInt(event.target.value))
  }
    return (
      <div>
        {pData.length > 0 && (
          <div className="flex grid grid-cols-2 gap-4 mb-4">
            
            {pData.map(post => (
              <div className="">

              <div key={post.postId}  className=" border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800" >
                <div className="flex justify-between items-center  font-bold bg-white dark:bg-gray-800">
                <h2 className="text-l text-left dark:text-white m-6">{post.author}</h2>  
                <h2 className="text-l text-right dark:text-white m-6">{post.date}</h2>
                </div>
                
                {post.url.length>0 && 
                  <img src={post.url} alt="" className="h-72 w-full m-auto justify-center text-center xl:h-96"/>}
{/* ==============> Start post image file <==================== */}
                {post.file.length>0 && 
                  <img src={post.file} alt="" className="h-72 w-full m-auto justify-center text-center xl:h-96"/>}
{/* ==============> End post image file <==================== */}
                <div className="flex justify-start items-start" >
                  <div className="flex flex-col m-4">
                    <h1 className="text-l text-left font-bold dark:text-white">{post.title}</h1>
                    <h2 className="text-md text-left dark:text-white">{post.category}</h2>
                  </div>
                 
                     <h2 className="text-md m-4 mr-2 dark:text-white">{post.content}</h2>
                 
                 
                </div>
                <hr className="w-10/12 m-auto border-gray-700"/>
                <div id = "CommentsContainer" className="bg-white dark:bg-gray-800 m-2">
                  
                  <div className="flex justify-start items-start">
                    <button onClick={(e) =>handleGetComments(e)} value={post.postId} type="submit" className="text-l font-bold m-4 mb-2 text-blue-400">Comments</button>
                    <input onChange={(e)=>handleContent(e)}  className="m-4 mt-2 border-b-2 border-gray focus:outline-none dark:bg-gray-800 dark:text-white" type="text" />
                    <button onClick={(e) => handleSendComment(e)} value={post.postId} type="submit" className="p-2 text-sm rounded-lg font-bold bg-blue-600 text-white">Submit</button>
                  </div>
                  <div id = {post.postId} value = {post.postId} className="hidden justify-center dark:text-white">
                    {post.comments.length > 0 ? ( post.comments.map( comment => (
                      <div className=""> 
                        <h2 >{comment.content}</h2>
                        <h2>{comment.date}</h2>
                      </div>
                    ))):
                    <h2 className="text-l text-center font-bold">No Comments</h2>
                    }
                  </div> 
                </div>
                </div>
              </div>
            ))}

          </div>
              
      )}
      </div>
    );
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