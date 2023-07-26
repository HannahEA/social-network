import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const apiURL = process.env.REACT_APP_API_URL;
 
 const Chat = ({websocketRef, isWebSocketConnected, allData}) => {
     // ---------CHAT FUNCTIONS--------------------
 const [chatMessage, setChatMessage] = useState("")
 console.log(allData)
 const handleOpenChat = (e) => {
   let chat = document.getElementById("chatOpen")
   if (chat.style.display == "none") {
     chat.style.display = "flex"
   } else {
     chat.style.display = "none"
   }
 }

 const handleChatMessage = (event) => {
   console.log(event.target.value)
   setChatMessage(event.target.value)
 }

 const sendChatMessage = () => {
   console.log("...sending chat", chatMessage)
   if (websocketRef.current && isWebSocketConnected) {
     websocketRef.current.send(
       JSON.stringify({
         message: chatMessage,
         type: "chat",
         cookie: document.cookie,
       })
     )
       console.log("chat message sent")
 
   } 
  
 }
 const GetConversation = ({reciever}) => {
    const cookie = (document.cookie).split(":")
    const sender = cookie[1]
    const getConversation = {
        reciever: reciever,
        sender: sender,
    }
   
      fetch(`${apiURL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(getConversation),
        credentials: 'include',
    })
    .then(response => response.json())
    .then((data) => {
        console.log({data})
        // revive converstion object with sender, reciever and conversation id
        //id should be attached to all chats
    } )
  
  
 }
 return (
    <div>
        <button onClick={handleOpenChat} className="fixed bg-gray-500 text-white font-bold bottom-3 right-6 w-40 p-2 rounded-md m-2" > Messages</button>
      <div className="hidden flex-row fixed bottom-16 right-6 border-solid border z-10 rounded-lg h-1/2 w-96 bg-white" id="chatOpen">
        
        <div className="flex flex-col justify-end align-center w-2/3 ">
          
          <div id="chatContainer"></div>
          <input type="text" onChange={handleChatMessage} value={chatMessage} className=" bottom-4 bg-gray-300 border-none m-2 p-3 w-9/10 h-2" placeholder="Type message.." name="msg" required/>

          <button type="submit" onClick={sendChatMessage} className=" p-2  w-full">Send</button>

        </div>
        <aside className=" flex flex-col h-full w-1/3 border-solid border text-center p-2" id="chatUsers">
          {allData.current.presences.length > 0 && allData.current.presences.map(presence => 
            <button onClick = {()=> GetConversation({reciever:presence})}> {presence} </button>
          )
          }
        </aside>
      </div>
    </div>
 )


 }
 
 
 
 
 export {Chat};