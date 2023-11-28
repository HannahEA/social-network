import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const apiURL = process.env.REACT_APP_API_URL;


const GetConversation = ({reciever, name, allData, type}) => {
    // const cookie = (document.cookie).split(":")
    
    let input = document.getElementById("chatInput")
    let send = document.getElementById("sendButton")
    input.classList.remove("hidden")
    send.classList.remove("hidden")
    // remove notification icon
    // chat box is open, notif icon is present
    RemoveChatNotification({username: reciever, name:name, type:type})
    const sender = allData.userInfo.username
    const getConversation = {
        reciever: reciever,
        username: sender,
        type: type
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
      // revive converstion object with sender, reciever and conversation id
        //id should be attached to all chats
      
        let chat = document.getElementById("chats")
      chat.setAttribute("name", convo.conversation.converstionID)
      //to diffrentiate between group chat and private chat when you are sending a message
      chat.setAttribute("chattype", convo.type)
      console.log("all data conversation:", reciever, convo.conversation.converstionID)
      allData.conversation = {reciever: reciever, id:convo.conversation.converstionID} 
      //cear chat container 
      let chats = document.getElementById("chats")
      chats.innerHTML = ''
      //print chat history 
      if (convo.chats) {
        convo.chats.forEach((chat) => {
        PrintNewChat({chat: chat, who: name})
        })
      }
        
    
  }
    awaitConvo(data)    
  
}
const AddUserToChatList = ({type, allData})=>  {

  if (type == "user update" ) {
    //update not full list 
    EditToUserList({allData: allData}) 
  }
  // create presence set csss based on online offline
  let style = "flex items-left text-start p-1 w-full  font-medium text-sm rounded-md transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700" 
 
  if (allData.presences.clients && type != "group chat update") {
    console.log("private chat update")
    allData.presences.clients.forEach((p)=> {
      if (p[0] != allData.userInfo.username) {
        let button = document.createElement('button')
        let br = document.createElement('hr')
        button.addEventListener("click", () => {
          GetConversation({reciever: p[0], name: allData.userInfo.username, allData: allData, type:"private"})
        }
        )
          button.className = style
          button.innerHTML = p[0]
        if (p[1] == "yes") {
          let online = document.getElementById('online') 
          //add styling to button
          button.classList.add("text-gray-900" )
          online.append(button)
          online.append(br)
        } else {
          let offline = document.getElementById('offline')
          //add styling to button 
          button.classList.add("text-gray-300")
          
          offline.append(button)
          offline.append(br)
        }
        
      }
    } )
  }
   if (type != "user update" && allData.presences.groups)  {
    console.log("group chat update")
    //add group chat button
    allData.presences.groups.forEach((g)=>{
      let button = document.createElement('button')
      let br = document.createElement('hr')
        button.addEventListener("click", () => {
            console.log(g[0], 'add user to chat')
            GetConversation({reciever: g[0], name: allData.userInfo.username, allData: allData, type:"groupChat"})
          }
        )
          button.className = style
          button.innerHTML = g[0]
          button.classList.add("text-gray-900" )
          let groups = document.getElementById('groupChats') 
         
          groups.append(button)
          groups.append(br)
    })
    
  }
  
  }

const EditToUserList = ({allData}) => {
  let toDelete 
  if(allData.presences.clients[0][1] == "yes") {
    let offline = document.getElementById('offline')
    for (const child of offline.childNodes) {
      if (allData.presences.clients[0][0] == child.innerHTML) {
        //remove button from offline list 
        console.log("user button children", child.childNodes)
        toDelete = child
        offline.removeChild(toDelete)
        break
      }
    }
    
  } else {
      let online = document.getElementById('online')
      for (const child of online.childNodes) {
        if (allData.presences.clients[0][0] == child.innerHTML) {
          //remove button from online list
          toDelete = child
          online.removeChild(toDelete)
          break
        }
      }
      
  }

  
}
  
// original function by Hannah & Helena's styling
const PrintNewChat = ({chat, who}) => {
  
  let chats = document.getElementById("chats")
  let newChat = document.createElement('div')
  let name = document.createElement("p")
  if (chats.classList.contains('hidden') == false ) {
  let nameval = chat.username
  if (nameval == who) {
      newChat.classList.add("sender", "flex", "flex-col")
  }else{
     //if chat is by any other user
      newChat.classList.add("recipient", "flex", "flex-col", "flex-end")
  }
    let message = document.createElement("p")
    message.classList.add('text-sm', 'font-bold', 'ml-2')
    message.innerHTML = chat.message
    name = document.createElement("p")
    name.classList.add('cName', 'font-bold', 'text-sm')
    name.innerHTML = nameval
    newChat.append(message)
    newChat.append(name)
    chats.append(newChat)
  }
}

//including chat formatting by Helena
/*const PrintNewChat = ({chat, who}) => {
  //let theUser = allData.userInfo.username
  console.log("chat from PrintNewChat", chat)
  let chats = document.getElementById("chats")
  let newChat = document.createElement('div')
  let name = document.createElement("p")
  if (chats.classList.contains('hidden') == false ) {
    let nameval = chat.username
    //if chat is by logged-on user
  if (nameval == who) {
    newChat.classList.add("sender", "flex", "flex-col")
  }else{
    //if chat is by any other user
    newChat.classList.add("recipient", "flex", "flex-col", "flex-end")
  }
  let message = document.createElement("p")
    message.classList.add('text-sm', 'font-bold', 'ml-2')
    message.innerHTML = chat.message
    name = document.createElement("p")
    name.classList.add('cName', 'font-bold', 'text-sm')
    name.innerHTML = nameval

    newChat.append(message)
    newChat.append(name)
    chats.append(newChat)

  }
   
}*/

const RequestChatNotification = ({chat}) => {
  console.log("adding chat Notification")
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
    if (data.status == "notification added") {
      console.log("Chat notification added to database")

    } else{
      console.log("server error: unable to add notification to database")
    }

  } )
}
const ChangeMessageNotification = ({chat, show}) => {
  let Icon = document.getElementById("notifIcon")
    // if the chat box is not open
    // and if the chat notif icon is not present and theres a new chat 
    if (Icon.style.display != "flex" && chat) {
      console.log("adding icon")
      //add the chat notif icon
      Icon.style.display = "flex"
    } else if (Icon.style.display == "flex" && show != 'yes'){
      // remove the chat notif icon
      Icon.style.display = "none"
    }
}


const ChangeChatNotification = ({usernames, type}) => {
    //range through offline users
    let users = document.getElementById("offline")
    for (let i = 0; i<3 ; i++) {
      for(const child of users.children) {
        for(var j = 0; j < usernames.length; j++) {
           //if the button is for the reicipient of the chat message
           if ( child.innerHTML == usernames[j][0]) {
             console.log(child.innerHTML, usernames[j][0])
            if (type == 'private' && (child.children.length == 0)&&(usernames.length == 1 ||   usernames[j][2] != '0')){
                //if you open the chat box for the first time add icon to all OR if the chatbox is open and a new chat is sent add icon 
                console.log("!chat icon: adding")
                //if the chat notif icon is not present and theres a new chat
                //add the chat notif icon
                let dot = document.createElement("div")
                dot.setAttribute("id", "red-dot")
                dot.classList.add('w-3', 'h-3', 'top-1', 'right-2', 'rounded-xl', 'bg-red-200')
                child.append(dot)
                break
              }else if (type == 'group' && (child.children.length == 0) &&(usernames.length == 1 ||   usernames[j][1] != '0')) {
                //if you open the chat box for the first time add icon to all OR if the chatbox is open and a new chat is sent add icon 
                console.log("!chat icon: adding", child.children.length, usernames.length, usernames[j][0])
                //if the chat notif icon is not present and theres a new chat
                //add the chat notif icon
                let dot = document.createElement("div")
                dot.setAttribute("id", "red-dot")
                dot.classList.add('w-3', 'h-3', 'top-1', 'right-2', 'rounded-xl', 'bg-red-200')
                child.append(dot)
                break
  
              }
              console.log("!chat icon: adding", child.children.length, usernames.length, usernames[j][0])
            } 
         }
      }
      //repeat for online users
      if (i == 0) {
        users = document.getElementById("online")
      } else if (i == 1) {
        users = document.getElementById("groupChats")
      }
      
    }  
} 


const RemoveChatNotification = ({username, name, type}) => {
  let notif  = false
  console.log("receiver, username and name inside RemoveChatNotification", username, name)
  
  let users = document.getElementById("offline")
  for (let i = 0; i<3 ; i++) {
     for(const child of users.children) {
        //if the button is the one you pressed on 
        let user = child.innerHTML
        if (child.innerHTML.includes("<")) {
          const split = child.innerHTML.split("<")
          user = split[0]
        }
        if ( user == username) {
          // if the chat notif icon is already present 
          if (child.children.length == 1) {
            //remove the icon 
            notif = true
            console.log('removing chat notif icon')
            child.children[0].remove()
          }
        }
        
      }
      if(i == 0 ) {
        users = document.getElementById("online")
      }
      if (i == 1) {
        users = document.getElementById("groupChats")
      }
  }
  console.log("delete notif from ", username, " to ", name)
  let chat = {
    username: username,
    reciever: name,
    status: "seen",
    type: type
  }
  if (notif == true) {
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
    if (data.status == "notification removed") {
      console.log("Chat notification removed from database")

    } else{
      console.log("server error: unable to remove notification to database")
    }

  } )
  }
  
}

 const Chat = ({websocketRef, isWebSocketConnected, allData}) => {
     // ---------CHAT FUNCTIONS--------------------
 const [chatMessage, setChatMessage] = useState("")
 
 const handleOpenChat = (e) => {
   let chat = document.getElementById("chatOpen")
   if (chat.style.display == "flex") {
    chat.style.display = "none"
    // ChangeMessageNotification({chat:{}})
   } else {
    //remove chat notif if its present 
     ChangeMessageNotification({})
     chat.style.display = "flex"

   }
 }

 

 const handleChatMessage = (event) => {
   
   setChatMessage(event.target.value)
 }

//  Original function by Hannah & Helena's styling
 const sendChatMessage = () => {
   console.log("...sending chat", chatMessage)
   if (websocketRef.current && isWebSocketConnected) {
    let chats = document.getElementById("chats")
    console.log(allData.current.conversation, "converation")
     websocketRef.current.send(
       JSON.stringify({
         message: chatMessage,
         type: chats.getAttribute("chattype"),
         username: allData.current.userInfo.username,
         reciever: allData.current.conversation.reciever,
         chatID: chats.getAttribute("name")
          
       })
     )
       console.log("chat message sent")

       
       let chat = document.createElement('div')
       chat.classList.add("sender", "flex", "flex-col")
       let message = document.createElement("p")
       message.classList.add('text-sm', 'font-bold', 'ml-2')
       message.innerHTML = chatMessage
       let name = document.createElement("p")
       name.innerHTML = allData.current.userInfo.username
       name.classList.add('cName', 'font-bold', 'text-sm')
       chat.append(message)
       chat.append(name)
       chats.append(chat)
       setChatMessage("")
 
   } 
  
 }

//  Including chat formatting by Helena
/*const sendChatMessage = () => {
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
      chat.classList.add("sender", "flex", "flex-col")
      let message = document.createElement("p")
      message.classList.add('text-sm', 'font-bold', 'ml-2')
      message.innerHTML = chatMessage
      let name = document.createElement("p")
      name.innerHTML = allData.current.userInfo.username
      name.classList.add('cName', 'font-bold', 'text-sm')
      chat.append(message)
      chat.append(name)
      chats.append(chat)
      setChatMessage("")

  } 
 
}*/
 
 
 return (
    <div>
        <button onClick={handleOpenChat} id="messages" className="fixed items-center text-base
        transition duration-75 group bg-gray-500 hover:bg-gray-400 
        shadow-lg dark:text-white dark:hover:bg-gray-300 
        first-letter:[box-shadow:0_3px_0_0_gray-100] 
        [box-shadow:0_3px_0_0_gray-300]
         text-white font-bold bottom-3 right-6 w-40 p-2 rounded-md m-2" > Messages
        <div className="hidden bg-red-300 rounded-lg absolute -top-4 right-2 w-8 h-8 " id="notifIcon">
          <img src="https://www.svgrepo.com/show/533249/message-circle-notification.svg" alt=""  className=" w-5 absolute top-1 right-1"/>
        </div>
        </button>
        <div className="hidden flex-row fixed bottom-16 right-6 border-solid border z-10 rounded-lg h-1/2 bg-white dark:bg-gray-300" id="chatOpen" style={{width:400+"px"}}>
        
        <div id = "chatContainer" className="flex flex-col justify-end align-center w-2/3 overflow-scroll dark:bg-gray-400 ">
          
          <div id="chats" name="chats" className="flex flex-col overflow-scroll">
          
          </div>
          <input id="chatInput" type="text" onChange={handleChatMessage} value={chatMessage} className=" hidden bottom-4 bg-gray-100 border-none m-2 p-3 w-9/10 h-2" placeholder="Type message.." name="msg" required/>

          <button id="sendButton" onClick={() => {sendChatMessage()}} className="hidden mb-2 ml-20 w-1/3 bg-gray-400 rounded-lg text-white shadow-md"><strong>Send</strong></button>

        </div>
        <aside className="dark:bg-gray-400 flex flex-col h-full w-1/3 border-solid border text-center p-2" id="chatUsers">
        <div id="online" className="dark:bg-gray-500 rounded-md "></div>
        <div id= "offline"></div>
        <div id="groupChats"></div>
        </aside>
      </div>
    </div>
 )


 }
 
 
 
 
 export {Chat, AddUserToChatList, PrintNewChat, RequestChatNotification, ChangeChatNotification, ChangeMessageNotification};