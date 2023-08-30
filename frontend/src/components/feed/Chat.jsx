import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const apiURL = process.env.REACT_APP_API_URL;

const AddUserToChatList = ({type, allData})=>  {

  const GetConversation = ({reciever}) => {
    // const cookie = (document.cookie).split(":")
    let input = document.getElementById("chatInput")
    let send = document.getElementById("sendButton")
    input.classList.remove("hidden")
    send.classList.remove("hidden")
    const sender = allData.userInfo.username
    console.log("conversation participants", allData.userInfo.username, reciever)
    const getConversation = {
        reciever: reciever,
        username: sender,
    }
   
     let data = fetch(`${apiURL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(getConversation),
        credentials: 'include',
    })
    .then(response => response.json())
    .then((data) => {
        console.log("getConversation", {data})
        

        return data
    } )
    let awaitConvo = async(data) =>  {
      let convo = await data
      console.log(convo, "convo")
      // revive converstion object with sender, reciever and conversation id
        //id should be attached to all chats
      let chat = document.getElementById("chats")
      chat.setAttribute("name", convo.conversation.converstionID)
      allData.conversation = {reciever: reciever, id:convo.conversation.converstionID} 
      //cear chat container 
      let chats = document.getElementById("chats")
      chats.innerHTML = ''
      //print chat history 
      if (convo.chats) {
        convo.chats.forEach((chat) => {
        PrintNewChat({chat: chat})
        })
      }
      
      
    }
    awaitConvo(data)
    
 }

  console.log(allData, "new user online")

  if (type == "user update" ) {
    //update not full list 
    EditToUserList({allData: allData}) 
  }
  // create presence set css based on online offline
  let style = "flex items-center p-2 w-full text-base font-medium rounded-md transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700" 
  let icon = document.createElement("img")
  if (allData.presences.clients) {
    allData.presences.clients.forEach((p)=> {
      if (p[0] != allData.userInfo.username) {
        let button = document.createElement('button')
        button.addEventListener("click", () => {
          GetConversation({reciever: p[0]})
        }
        )
        
        if (p[1] == "yes") {
          let online = document.getElementById('online') 
          //add styling to button
          button.className = style
          icon.setAttribute("src", "https://icons8.com/icon/FkQHNSmqWQWH/green-circle")
          button.classList.add("text-gray-900" )
          button.append(icon)
          button.innerHTML = p[0]
          online.append(button)
        } else {
          let offline = document.getElementById('offline')
          //add styling to button 
          button.className = style
          button.classList.add("text-gray-300")
          icon.setAttribute("src", "/Users/admin/Desktop/Repos/social-network/frontend/src/components/feed/chatIcons/chatIcons/circle.png")
          button.append(icon)
          button.innerHTML = p[0]
          offline.append(button)
        }
        
      }
    } )
  }
  
  }

const EditToUserList = ({allData}) => {
  let toDelete 
  if(allData.presences.clients[0][1] == "yes") {
    let offline = document.getElementById('offline')
    for (const child of offline.childNodes) {
      if (allData.presences.clients[0][0] == child.innerHTML) {
        //remove button from offline list 
        toDelete = child
        break
      }
    }
    offline.removeChild(toDelete)
  } else {
      let online = document.getElementById('online')
      for (const child of online.childNodes) {
        if (allData.presences.clients[0][0] == child.innerHTML) {
          //remove button from online list
          toDelete = child
          break
        }
      }
      online.removeChild(toDelete)
  }

  
}
  
 

const PrintNewChat = ({chat}) => {
  
  let chats = document.getElementById("chats")
  let newChat = document.createElement('div')
  let name = document.createElement("p")
  if (chats.classList.contains('hidden') == false ) {
    let nameval = chat.username
    name.innerHTML = nameval
    name.classList.add('font-bold', 'text-sm', 'ml-2')
    let message = document.createElement("p")
    message.classList.add('text-sm', 'ml-4')
    message.innerHTML = chat.message
    newChat.classList.add("flex", "flex-row")
    newChat.append(name)
    newChat.append(message)
    chats.append(newChat)
  }
  
  
}

const RequestChatNotification = ({chat}) => {
  chat.status = "delivered"
  fetch(`${apiURL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chat),
    credentials: 'include',
  })
  .then(response => response.json())
  .then((data) => {
    console.log("Chat notification added to database")

  } )
}

 const Chat = ({websocketRef, isWebSocketConnected, allData}) => {
     // ---------CHAT FUNCTIONS--------------------
 const [chatMessage, setChatMessage] = useState("")


 const handleOpenChat = (e) => {
   let chat = document.getElementById("chatOpen")
   if (chat.style.display == "none") {
     chat.style.display = "flex"
   } else {
     chat.style.display = "none"
   }
 }

 const handleChatMessage = (event) => {
   
   setChatMessage(event.target.value)
 }

 const sendChatMessage = () => {
   console.log("...sending chat", chatMessage)
   if (websocketRef.current && isWebSocketConnected) {
    let chats = document.getElementById("chats")
    console.log(allData.current.conversation, "converation")
     websocketRef.current.send(
       JSON.stringify({
         message: chatMessage,
         type: "chat",
         username: allData.current.userInfo.username,
         reciever: allData.current.conversation.reciever,
         chatID: chats.getAttribute("name")
          
       })
     )
       console.log("chat message sent")

       
       let chat = document.createElement('div')
       let name = document.createElement("p")
       
       name.innerHTML = allData.current.userInfo.username
       name.classList.add('font-bold', 'text-sm', 'ml-2')
       let message = document.createElement("p")
       message.classList.add('text-sm', 'ml-4')
       message.innerHTML = chatMessage
       chat.classList.add("flex", "flex-row")
       chat.append(name)
       chat.append(message)
       chats.append(chat)
       setChatMessage("")
 
   } 
  
 }
 
 

 return (
    <div>
        <button onClick={handleOpenChat} className="fixed bg-gray-500 text-white font-bold bottom-3 right-6 w-40 p-2 rounded-md m-2" > Messages</button>
      <div className="hidden flex-row fixed bottom-16 right-6 border-solid border z-10 rounded-lg h-1/2 w-96 bg-white" id="chatOpen">
        
        <div id = "chatContainer" className="flex flex-col justify-end align-center w-2/3 overflow-scroll">
          
          <div id="chats" name="chats" className="flex flex-col overflow-scroll">
          
          </div>
          <input id="chatInput" type="text" onChange={handleChatMessage} value={chatMessage} className=" hidden bottom-4 bg-gray-300 border-none m-2 p-3 w-9/10 h-2" placeholder="Type message.." name="msg" required/>

          <button id="sendButton" onClick={() => {sendChatMessage()}} className="hidden p-2  w-full">Send</button>

        </div>
        <aside className=" flex flex-col h-full w-1/3 border-solid border text-center p-2" id="chatUsers">
        <div id="online"></div>
        <div id= "offline"></div>
        </aside>
      </div>
    </div>
 )


 }
 
 
 
 
 export {Chat, AddUserToChatList, PrintNewChat, RequestChatNotification};