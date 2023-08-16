package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/gorilla/websocket"
)

type TypeCheck struct {
	Type string `json:"type,omitempty"`
}

var Clients = make(map[*websocket.Conn]string)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func sendPreviousMessages(ws *websocket.Conn) {
	//GET OLD MESSAGES

	// send previous messages
	// for _, chatMessage := range chatMessages {
	// 	var msg ChatMessage
	// 	json.Unmarshal([]byte(chatMessage), &msg)
	// 	messageClient(ws, msg)
	// }
}
func checkWebSocketConnections(client map[*websocket.Conn]string) {
	for conn := range client {
		err := conn.WriteMessage(websocket.PingMessage, nil)
		if err != nil {
			// Connection is closed
			_ = conn.Close()
			delete(client, conn)
		}
	}
}

// If a message is sent while a client is closing, ignore the error
func UnsafeError(err error) bool {
	return !websocket.IsCloseError(err, websocket.CloseGoingAway) && err != io.EOF
}
func (service *AllDbMethodsWrapper) HandleConnections(w http.ResponseWriter, r *http.Request) {
	//create websocket connection
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("new websocket connection")
	// ensure connection close when function returns
	defer ws.Close()
	// close any connctions ended on client side
	checkWebSocketConnections(Clients)

	// if it's zero, no messages were ever sent/saved
	// STORE OLD MESSAGES

	for {
		var msg WebsocketMessage
		// Read in a new message
		_, b, err := ws.ReadMessage()
		if err != nil {
			UnsafeError(err)
			return
		}
		fmt.Println(string(b))

		//unmarshall type, check message type
		sm := &TypeCheck{}
		if err := json.Unmarshal(b, sm); err != nil {
			UnsafeError(err)
		}
		switch sm.Type {
		case "connect":
			// Unmarshal full message as JSON and map it to a Message object
			// err := ws.ReadJSON(&msg)
			jsonErr := json.Unmarshal(b, &msg)
			fmt.Println("connection message", msg)
			if jsonErr != nil {
				fmt.Println("there is an error with json msg: Websocket")
				break
			}
			//get username to send to other logged in users
			cookie := strings.Split(msg.Cookie, "=")[1]
			user := service.repo.GetUserByCookie(cookie)
			Clients[ws] = user.NickName
			fmt.Println("clients", Clients)
			//list of evryone you want to send it too: everyone logged in
			//message you want to send: all usernames
			var users []string
			for _, name := range Clients {
				users = append(users, name)
			}
			webMessage := WebsocketMessage{
				Presences: Presences{
					Clients: users,
				},
				Type: "connect",
			}

			// send new message to the channel
			service.repo.BroadcastToChannel(BroadcastMessage{WebMessage: webMessage, Connections: Clients})

		case "chat":
			var chat Chat
			// Unmarshal full message as JSON and map it to a Message object
			// err := ws.ReadJSON(&msg)
			jsonErr := json.Unmarshal(b, &chat)
			fmt.Println("chat message", chat)
			if jsonErr != nil {
				fmt.Println("there is an error with json msg: Websocket")
				break
			}
			//
			//add chat to database
			service.repo.AddChatToDatabase(chat)
			//look for reciever in client list
			online := false
			reciever := make(map[*websocket.Conn]string)
			for conn, client := range Clients {
				if client == chat.Reciever {
					fmt.Println("chat reciever is online")
					reciever[conn] = client
					online = true
				}
			}

			//send Chat message to reciever web conn
			if online {
				service.repo.BroadcastToChannel(BroadcastMessage{WebMessage: WebsocketMessage{Chat: chat, Type: "chat"}, Connections: reciever})
			} else {
				//OR
				//check for chat notif
				oldChats, count, err := service.repo.CheckForNotification(chat)
				//add new notif to database or add 1 to count
				if !oldChats || oldChats && err == nil {
					service.repo.AddChatNotification(chat, count)
				}
			}
		case "followingRequest":

			var fInfo Follow
			jsonErr := json.Unmarshal(b, &fInfo)
			fmt.Println("fInfo:", fInfo)
			if jsonErr != nil {
				fmt.Println("there is an error with json msg: Websocket")
				break
			}
			//retrieve follower's details
			fEmail := fInfo.FollowerEmail

			follower, err := service.repo.GetUserByEmail(fEmail)
			if err != nil {
				fmt.Println("Error retrieving follower info by email", err)
			}
			//instantiate struct 'UploadFollow'
			var uploadFollowInfo UploadFollow

			//assign values to 'UploadFollow' struct
			uploadFollowInfo.FollowerId = follower.id
			uploadFollowInfo.FollowerUN = follower.NickName
			uploadFollowInfo.InfluencerId = fInfo.InfluencerID
			uploadFollowInfo.InfluencerUN = fInfo.InfliuencerUN
			uploadFollowInfo.Accept = "Yes"
			uploadFollowInfo.UFollow = ""

			if fInfo.InfluencerVisib == "public" {
				//populate the db table 'followers'
				err := service.repo.InsertFollowRequest(uploadFollowInfo)
				if err != nil {
					log.Fatalf(err.Error())
				}

			} else if fInfo.InfluencerVisib == "private " {
				online := false
				fmt.Println("Printing to get rid of the error", online)
				reciever := make(map[*websocket.Conn]string)

				for conn, client := range Clients {
					if client == uploadFollowInfo.InfluencerUN {
						fmt.Println("follow request receiver is online")
						reciever[conn] = client
						online = true
					}
				}
				//send a notification to the owner of the private profile
				service.repo.BroadcastToChannel(BroadcastMessage{WebMessage: WebsocketMessage{UploadFollow: uploadFollowInfo, Type: "followingRequest"}, Connections: reciever})
			} else {
				/*OR
				//TO DO: check for uploadFollowInfo notif
				oldChats, count, err := service.repo.CheckForNotification(uploadFollowInfo)
				//add new notif to database or add 1 to count
				if !olduploadFollowInfo || olduploadFollowInfo && err == nil {
					service.repo.AddChatNotification(uploadFollowInfo, count)
				}*/
				fmt.Println("Influencer is not online, must send notification and store some details")
			}
		}

	}
}

func GetUserByEmail(fEmail string) {
	panic("unimplemented")
}

func (r *dbStruct) BroadcastToChannel(msg BroadcastMessage) {
	fmt.Println("attempting to broadcast")
	r.broadcaster <- msg
}

func (repo *dbStruct) InsertFollowRequest(uploadFollowRequest UploadFollow) error {
	//populate the db table 'followers'
	stmnt, err := repo.db.Prepare("INSERT OR IGNORE INTO Followers (followerID, followerUserName, influencerID, influencerUserName, accepted, unfollow) VALUES (?, ?, ?, ?, ?, ?)")
	if err != nil {
		fmt.Println("Error preparing insert stmt for follow request into DB: ", err)
		return err
	}
	_, err = stmnt.Exec(uploadFollowRequest.FollowerId, uploadFollowRequest.FollowerUN, uploadFollowRequest.InfluencerId, uploadFollowRequest.InfluencerUN, uploadFollowRequest.Accept, uploadFollowRequest.UFollow)
	if err != nil {
		fmt.Println("Error inserting follow request into DB: ", err)
		return err
	}

	return nil

}
