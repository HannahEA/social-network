import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const notyf = new Notyf(); // Create a single instance of Notyf

//Environment variable from the docker-compose.yml file. 
//This variable will contain the URL of the backend service, 
//allowing the frontend code to make requests to the correct endpoint.
const apiURL = process.env.REACT_APP_API_URL;
//const apiURL = "http://localhost:8000"


const SubmitPost = ({title, content, visibility, url, file, category}) => {

 console.log(url, file)
 const newPost = {
    title: title,
    content: content,
    visibility: visibility,
    category: category,
    url: url,
    file: file,
    type: "newPost"
 }
 // Make a POST request to the server

  const data = fetch(`${apiURL}/post`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newPost),
    credentials: 'include',
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle the response from the server
      console.log({data});
        // display posts
        notyf.success("New Post Submitted")
        return data
    })
    .catch((error) => {
      // Handle any errors
      console.error("Error:", error);
    });
    
    return data;
    
}

const Posts = ({sPost}) => {
  const [pData, setpData] = useState([])
  
  let getPosts = {
    cookie: document.cookie, 
    type: "getPosts"
  }

  const fetchPosts = () => {
    fetch(`${apiURL}/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getPosts),
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        // if (Object.keys(sPost).length === 0) {
          setpData(data)
        
          
      })
      .catch((error) => {
        // Handle any errors
        console.error("Error:", error);
      });
  }

  useEffect(() => {
    fetchPosts()
  }, [sPost])


  const [commentContent, setCommentContent] = useState("")
  const [Id, setId] = useState(0)
  const [newComment, setNewComment] = useState("")

  const handleContent = (event) => {
    setCommentContent(event.target.value)
  }
  const handleGetComments = (event) => {
    // console.log(event.target.value)
    const Id = event.target.value.toString()
    const comments =  document.getElementById(Id)
    if (comments.style.display == "flex") {
      comments.style.display = "none"
    } else {
      comments.style.display = "flex"
    }
  }
  const handleSendComment = (event) => {
    event.preventDefault();
    //postID set
    let newComment = SubmitComment(commentContent, parseInt(event.target.value))
    let allInput = document.querySelectorAll("input")
    allInput.forEach(singleInput => singleInput.value = '')
    setNewComment(newComment)
  }
    return (
      <div className="">
        {pData.length > 0 && (
          <div className="">
            <div id="odd" className="float-left w-1/2">
            {pData.map(post => 
              (post.postId%2 > 0 && post != {} &&
                <div key={post.postId} className="m-2  ">
                  <div className=" border-solid rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800" >
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
                <hr className="w-10/12 m-auto border-gray dark:border-gray-700"/>
                <div id = "CommentsContainer" className="bg-white dark:bg-gray-800 ">
                  
                  <div className="flex justify-start items-center">
                    <button onClick={(e) =>handleGetComments(e)} value={post.postId} type="submit" className=" flex items-center text-l font-bold m-4 mb-2 text-blue-400 ">
                      Comments 
                    <svg  aria-hidden="true" value="5" className="w-4 h-4 ml-2 pointer-events-none" fill="black" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path 
                       fillRule="evenodd" name = {post.postId}
                       value="5"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    
                    <div id="submitComment" className=" grow">
                      <input onChange={(e)=>handleContent(e)} name={commentContent} className="w-7/12 m-4 mb-2 border-b-2 border-gray focus:outline-none dark:bg-gray-800 dark:text-white" type="text" />
                      <button onClick={(e) => handleSendComment(e)} value={post.postId} type="submit" className="m-2 mb-2 p-2 pt-1 pb-1 text-xs rounded-lg font-bold bg-blue-600 text-white">Submit</button>
                    </div>
                    
                  </div>
                  <Comments postID={post.postId} newComment={newComment}/>
                </div>
                </div>
                </div>
            ))}
            </div>
            <div id="even" className="float-left w-1/2">
              
                {pData.map(post => (post.postId%2 == 0 && post != {} && (
              
              <div key={post.postId} className="m-2  ">
                <div>
                
                <div className="  leftborder border-solid rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800" >
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

                <div id= "postContent" className="flex justify-start items-start" >
                  <div className="flex flex-col m-4">
                    <h1 className="text-l text-left font-bold dark:text-white">{post.title}</h1>
                    <h2 className="text-md text-left dark:text-white">{post.category}</h2>
                  </div>
                  <h2 className="text-md m-4 mr-2 dark:text-white">{post.content}</h2>
                </div>
                <hr className="w-10/12 m-auto border-gray dark:border-gray-700"/>
                <div id = "CommentsContainer" className="bg-white dark:bg-gray-800 ">
                  
                  <div className="flex justify-start items-center">
                    <button onClick={(e) =>handleGetComments(e)} value={post.postId} type="submit" className=" flex items-center text-l font-bold m-4 mb-2 text-blue-400 ">
                      Comments 
                    <svg  aria-hidden="true" value="5" className="w-4 h-4 ml-2 pointer-events-none" fill="black" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path 
                       fillRule="evenodd" name = {post.postId}
                       value="5"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    
                    <div id="submitComment" className=" grow">
                      <input onChange={(e)=>handleContent(e)} name={commentContent} className="w-7/12 m-4 mb-2 border-b-2 border-gray focus:outline-none dark:bg-gray-800 dark:text-white" type="text" />
                      <button onClick={(e) => handleSendComment(e)} value={post.postId} type="submit" className="m-2 mb-2 p-2 pt-1 pb-1 text-xs rounded-lg font-bold bg-blue-600 text-white">Submit</button>
                    </div>
                    
                  </div>
                 <Comments postID={post.postId} newComment={newComment}/>
                </div>
                </div>
                
                </div>
              </div>
            )))}
            </div>
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
 
  const data = fetch(`/post`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newComment),
    credentials: 'include',
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle the response from the server
      
      return data
        // display posts
    })
    .catch((error) => {
      // Handle any errors
      console.error("Error:", error);
    });
  return data 
}

const Comments = ({postID, newComment}) => {
  const [cData, setCData] = useState([])
  const getComments = {
    postId: postID,
    type: "getComments"
 }
  const fetchComments = () => {
    fetch(`/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getComments),
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response from the server
        
        setCData(data)
          // display posts
      })
      .catch((error) => {
        // Handle any errors
        console.error("Error:", error);
      });
  }

  useEffect(() => {
    fetchComments()
  }, [newComment])
  
  return (
    <div id = {postID} value = {postID} className="hidden flex-col justify-center dark:text-white">
      {cData.length > 0 ? ( cData.map( comment => (
        <div key={comment.commentId} className="flex flex-row ml-4 mb-2"> 
          <div className="flex flex-col">
            <h2 className="text-l font-bold">{comment.author}</h2>
            <h2 className="text-sm">{comment.Date}</h2> 
          </div>
          <h2 className="ml-4" >{comment.content}</h2>
        </div>
        ))):
        <h2 className="text-l text-center font-bold">No Comments</h2>
      }
    </div> 
  )

}
const Tags = ({tags}) => {
  
  return (
    <div className="flex justify-start">
       {tags.length > 0 && tags.map( tag => 
       <div className="bg-blue text-blue border-solid rounded-md w-5 h-5 m-2 ml-5">{tag}</div>
       )}
    </div> 
  )
 }


export {SubmitPost, Tags, Posts};