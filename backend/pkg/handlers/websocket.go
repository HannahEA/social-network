package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/websocket"
)

type TypeCheck struct {
	Type string `json:"type,omitempty"`
}

// map of clients: key - webcoket connection value-username
var Clients = make(map[*websocket.Conn]string)

//stores the number of clients
var prevLen int = 0

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func checkWebSocketConnections(client map[*websocket.Conn]string) int {
	for conn := range client {
		err := conn.WriteMessage(websocket.PingMessage, nil)
		if err != nil {
			// Connection is closed
			_ = conn.Close()
			delete(client, conn)
		}
	}
	return len(Clients)
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
	// newLen stores the new number of clients after a new web connection has been added
	newLen := checkWebSocketConnections(Clients)
	fmt.Println("client list before", prevLen, "after", newLen)

	// if it's zero, no messages were ever sent/saved
	// STORE OLD MESSAGES

	for {

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

			// Unmarshal full message as into WebsocketMessage struct as 'connect' messsage only contains the users cookie

			var msg WebsocketMessage

			jsonErr := json.Unmarshal(b, &msg)
			fmt.Println("connection message", msg)
			if jsonErr != nil {
				fmt.Println("there is an error with json msg: Websocket")
				break
			}
			//get username from cookie to send to other clients
			cookie := strings.Split(msg.Cookie, "=")[1]
			user := service.repo.GetUserByCookie(cookie)
			Clients[ws] = user.NickName

			// if the number of clients before the new connection was added is less than the number of clients after the conn was added (and closed connections were deleted) a new client is online
			if newLen > prevLen {

				fmt.Println("new web connection - new client logged in")

				//create message in websocket message struct to send to clients following the newly logged in user
				webMessage := WebsocketMessage{
					Presences: Presences{
						Clients:  []string{user.NickName},
						LoggedIn: []string{"yes"},
					},
					Type: "connect",
				}

				// which clients, if any, are following this user? return map of clients
				list := service.repo.ClientsFollowingUser(user)

				//  if any clients are following the newly online user
				if len(list) > 0 {
					// send  websocket message in a broadcast message truct to channel, with map of incluencer connections to send to
					service.repo.BroadcastToChannel(BroadcastMessage{
						WebMessage:  webMessage,
						Connections: list,
					})
				}

				//set prevLen to the current number of clients
				prevLen = newLen
			}

			// get full list of influencers with online/offline to send to the user with a new websocket connection
			// return a Presence struct which contains an array of username and an array of online status (either yes or no)
			presences := service.repo.FullChatUserList(user)

			//make a map of only the user with a new websocket connection
			reciever := make(map[*websocket.Conn]string)

			//ws - new connection pointer
			reciever[ws] = user.NickName

			//message to send to user in websocket message struct
			webMessage := WebsocketMessage{
				Presences: presences,
				Type:      "connect",
			}

			// send websocket message to channel in broadcast message  struct with the reciever map
			if len(presences.Clients) > 0 {
				service.repo.BroadcastToChannel(BroadcastMessage{
					WebMessage:  webMessage,
					Connections: reciever,
				})
			}

			// less connections than before - logout
			// which clients are following this user? return list of clients

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

			//send Chat message to channel with reciever web conn
			if online {
				service.repo.BroadcastToChannel(BroadcastMessage{
					WebMessage: WebsocketMessage{
						Chat: chat,
						Type: "chat"},
					Connections: reciever,
				})
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
			uploadFollowInfo.InfluencerVis = fInfo.InfluencerVisib
			//Can follow public profile influencer straight away
			if uploadFollowInfo.InfluencerVis == "public" && fInfo.UnFollow == "" {
				uploadFollowInfo.Accept = "Yes"
				//Private profile influencer needs to approve follow request
			} else if uploadFollowInfo.InfluencerVis == "private" && fInfo.UnFollow == "" {
				uploadFollowInfo.Accept = "Pending"
			}
			//This is an un-follow request so will delete the record from 'Followers' table
			uploadFollowInfo.UFollow = fInfo.UnFollow

			fmt.Println("uploadFollowInfo to upload in db", uploadFollowInfo)

			if uploadFollowInfo.InfluencerVis == "public" {
				fmt.Println("Checking if follow request goes to 'visibility public' branch")
				//populate the db table 'followers'
				_, err := service.repo.InsertFollowRequest(uploadFollowInfo)
				if err != nil {
					log.Fatalf(err.Error())
				}

			} else if uploadFollowInfo.InfluencerVis == "private" {
				fmt.Println("Checking if follow request goes to 'visibility private' branch")
				//populate the db table 'followers' and get the followID
				followID, err := service.repo.InsertFollowRequest(uploadFollowInfo)
				if err != nil {
					log.Fatalf(err.Error())
				}
				//check if the private user is online
				online := false
				fmt.Println("Printing to get rid of the error", online)
				reciever := make(map[*websocket.Conn]string)

				for conn, client := range Clients {
					if client == uploadFollowInfo.InfluencerUN {
						reciever[conn] = client
						online = true
						fmt.Printf("follow request client/ receiver %v %v is %v", client, reciever, online)
						//instantiate the 'Notif' struct
						var fNotification FollowNotif
						//populate the Notif struct with the notification data
						fNotification.FollowID = strconv.Itoa(followID)
						fNotification.NotifMsg = uploadFollowInfo.FollowerUN + " wishes to follow you. Do you accept?"
						fNotification.Type = "FollowNotif"
						fmt.Println("notification via ws: ", fNotification.FollowID, fNotification.NotifMsg, fNotification.Type)
						//if online, send a notification to the owner of the private profile
						service.repo.BroadcastToChannel(BroadcastMessage{WebMessage: WebsocketMessage{FollowNotif: fNotification, Type: "followNotif"}, Connections: reciever})
					} else {
						fmt.Println("Influencer is off-line. Has accept been put to pending for private profile?", uploadFollowInfo.Accept)
						//db query to return the number of pending notifications

					}
				}

			} else {
				//fmt.Println("has accept been put to pending for private profile?", uploadFollowInfo.Accept)
				/*OR
				//TO DO: check for uploadFollowInfo notif
				oldChats, count, err := service.repo.CheckForNotification(uploadFollowInfo)
				//add new notif to database or add 1 to count
				if !olduploadFollowInfo || olduploadFollowInfo && err == nil {
					service.repo.AddChatNotification(uploadFollowInfo, count)
				}*/
				//fmt.Println("Influencer is not online, must send notification and store some details")
				fmt.Println("What is this third option for?")
			}

		case "followReply":
			var fReply FollowReply
			//populate the FollowReply struct
			jsonErr := json.Unmarshal(b, &fReply)
			fmt.Println("fInfo:", fReply)
			if jsonErr != nil {
				fmt.Println("there is an error with json msg: Websocket")
			}
			//Update the 'accepted' field in 'Followers' table
			err := service.repo.InsertFollowReply(fReply)
			if err != nil {
				fmt.Println("error inserting the follow reply", err)
			}
		}

	}
}

// func GetUserByEmail(fEmail string) {
// 	panic("unimplemented")
// }

func (r *dbStruct) BroadcastToChannel(msg BroadcastMessage) {
	fmt.Println("attempting to broadcast")
	r.broadcaster <- msg
}

func (repo *dbStruct) InsertFollowRequest(uploadFollowRequest UploadFollow) (int, error) {
	//check if influencer is being un-followed
	var uNfollow = uploadFollowRequest.UFollow
	if uNfollow == "Yes" {
		//remove the original 'follow' record in 'Followers' table
		stmnt, err := repo.db.Prepare(`DELETE FROM Followers WHERE (followerUserName = ? AND influencerUserName = ?)`)
		if err != nil {
			fmt.Println("Error preparing delete stmt for un-follow request: ", err)
			return 0, err
		}
		_, err = stmnt.Exec(uploadFollowRequest.FollowerUN, uploadFollowRequest.InfluencerUN)
		if err != nil {
			fmt.Println("error deleting follow record", err)
			return 0, err
		}
	} else if uNfollow == "" {
		//User wishes to follow the influencer so will create a new record in the db table 'followers'
		stmnt, err := repo.db.Prepare("INSERT OR IGNORE INTO Followers (followerID, followerUserName, influencerID, influencerUserName, accepted) VALUES (?, ?, ?, ?, ?)")
		if err != nil {
			fmt.Println("Error preparing insert stmt for follow request into DB: ", err)
			return 0, err
		}
		_, err = stmnt.Exec(uploadFollowRequest.FollowerId, uploadFollowRequest.FollowerUN, uploadFollowRequest.InfluencerId, uploadFollowRequest.InfluencerUN, uploadFollowRequest.Accept)
		if err != nil {
			fmt.Println("Error inserting follow request into DB: ", err)
			return 0, err
		}

	}
	//return the auto-generated 'followID'
	var followID int
	rows, err := repo.db.Query("SELECT seq FROM sqlite_sequence WHERE name = 'Followers'")
	if err != nil {
		fmt.Println("Error returning 'seq'", err)
		return 0, err
	}
	for rows.Next() {
		err := rows.Scan(&followID)
		if err != nil {
			fmt.Println("sqlite_sequence: row scan error", err)
			return 0, err
		}
	}
	return followID, nil
}

//uploads private user reply to follow request
func (repo *dbStruct) InsertFollowReply(theReply FollowReply) error {
	_, err := repo.db.Exec("UPDATE Followers SET accepted = ? WHERE follow = ?", theReply.FollowReply, theReply.FollowID)
	if err != nil {
		fmt.Println("error inserting follow reply", err)
		return err
	}
	return nil
}

func (r *dbStruct) ClientsFollowingUser(user *User) map[*websocket.Conn]string {

	list := make(map[*websocket.Conn]string)
	for conn, name := range Clients {
		fmt.Println(" check if ", name, "follows ", user.NickName)
		_, err := r.db.Query(`SELECT COUNT (*) FROM Followers WHERE (followerUserName, influencerUserName) = (?,?) `, name, user.NickName)
		if err != nil {
			fmt.Println("ClientsFollowingUser: client not following user, query error", err)
			//client not following user
			continue
		}
		list[conn] = name
	}
	return list
}

func (r *dbStruct) FullChatUserList(user *User) Presences {
	var list Presences
	rows, err := r.db.Query(`SELECT influencerUserName FROM Followers WHERE followerUserName = ? `, user.NickName)
	if err != nil {
		fmt.Println("FullChatUserList: query error", err)
		return list
	}
	for rows.Next() {
		var influencer string
		err := rows.Scan(&influencer)
		if err != nil {
			fmt.Println("FullChatUserList: row scan error", err)
			return list
		}
		list.Clients = append(list.Clients, influencer)
		loggedIn := false
		for _, name := range Clients {
			if name == influencer {
				list.LoggedIn = append(list.LoggedIn, "yes")
				loggedIn = true
			}
		}
		if !loggedIn {
			list.LoggedIn = append(list.LoggedIn, "no")
		}
	}
	return list
}
