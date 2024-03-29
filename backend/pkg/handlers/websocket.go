package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/websocket"
)

type TypeCheck struct {
	Type string `json:"type,omitempty"`
}

// map of clients: key - webcoket connection value-username
var Clients = make(map[*websocket.Conn]string)

// stores the number of clients
var PrevLen int = 0

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
	fmt.Println("client list before", PrevLen, "after", newLen)

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
			if newLen > PrevLen {

				fmt.Println("new web connection - new client logged in")

				//create message in websocket message struct to send to clients following the newly logged in user

				client := []string{user.NickName, "yes"}
				webMessage := WebsocketMessage{
					Presences: Presences{
						Clients:  [][]string{client},
						LoggedIn: []string{"yes"},
					},
					Type: "user update",
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
				PrevLen = newLen
			}
			//get all group chats and notifs
			groups := service.repo.FullGroupChatList(user)
			// get full list of influencers with online/offline to send to the user with a new websocket connection
			// return a Presence struct which contains an array of username and an array of online status (either yes or no)
			presences := service.repo.FullChatUserList(user)
			presences.Groups = groups

			//make a map of only the user with a new websocket connection
			reciever := make(map[*websocket.Conn]string)

			//ws - new connection pointer
			reciever[ws] = user.NickName

			//pending follow requests moved to login.goconsole.log(chatId, " chatId")
			countPending, slicePending := service.repo.GetPendingFollowRequests(user.NickName)

			//instantiate the OfflineFollowNotif struct to be sent via ws
			var offlineFollowNotif = OfflineFollowNotif{
				PendingFollows:   slicePending,
				NumFollowPending: strconv.Itoa(countPending),
			}

			fmt.Println("the OfflineFollowNotif struct sent to front end: ", offlineFollowNotif)

			//get user's pending group invites
			countGroupInvites, sliceGroups := service.repo.GetPendingGroupInvites(user.NickName)

			//instantiate the OfflineFollowNotif struct to be sent via ws
			var offlineGroupInvites = OfflineGroupInvites{
				PendingGroupInvites: sliceGroups,
				NumGrpsPending:      strconv.Itoa(countGroupInvites),
			}

			//get user's pending join group requests
			countJoinReq, sliceJoinReq := service.repo.GetPendingJoinGroupRequests(user.NickName)

			//instantiate the OfflineJoinGroupRequests struct to be sent to f.e.
			var offlineJoinGroupRequests = OfflineJoinGroupRequests{
				NumGrpsPending:        countJoinReq,
				OfflineJoinGrRequests: sliceJoinReq,
			}

			//get user's pending event invites
			countEvtInvites, sliceEventInvites := service.repo.GetPendingEventInvites(user.NickName)

			//instantiate the NewEventNotif struct to be sent to f.e.
			var offlineEventsInvites = OfflineEventsInvites{
				NumEvtsPending:    countEvtInvites,
				OfflEventsInvites: sliceEventInvites,
			}

			webMessage := WebsocketMessage{
				Presences:                presences,
				OfflineFollowNotif:       offlineFollowNotif,
				OfflineGroupInvites:      offlineGroupInvites,
				OfflineJoinGroupRequests: offlineJoinGroupRequests,
				OfflineEventsInvites:     offlineEventsInvites,
				Type:                     "connect",
			}

			fmt.Println("the webMessage struct sent to f.e.: ", webMessage)

			// send websocket message to channel in broadcast message  struct with the reciever map
			// if len(presences.Clients) > 0 {
			fmt.Println("sending connect message")

			service.repo.BroadcastToChannel(BroadcastMessage{
				WebMessage:  webMessage,
				Connections: reciever,
			})
			// }

			// less connections than before - logout
			// which clients are following this user? return list of clients

		case "privateChat":
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
		case "groupChat":
			var chat Chat
			// Unmarshal full message as JSON and map it to a Message object
			// err := ws.ReadJSON(&msg)
			jsonErr := json.Unmarshal(b, &chat)
			fmt.Println("group chat message", chat)
			if jsonErr != nil {
				fmt.Println("there is an error with json msg: Websocket")
				break
			}
			//get list of all members and group id
			group, err := service.repo.GetGroupFromGroupName(chat.Reciever)
			if err != nil {
				fmt.Println("Websocket group chat: GetGroupFromGroupName err:", err)
			}
			// add chat to database
			service.repo.AddGroupMessageToDB(chat, group.ID)
			//check which members are online \
			reciever := make(map[*websocket.Conn]string)
			var offline []string
			var count int
			for _, member := range group.GpMembers {
				count = 0
				for conn, name := range Clients {
					count++
					if member == name && member != chat.Sender {
						fmt.Println("which group members are online?", member, name)
						reciever[conn] = name
						chat.Member = name
						service.repo.BroadcastToChannel(
							BroadcastMessage{
								WebMessage: WebsocketMessage{
									Chat: chat,
									Type: "groupMessage"},
								Connections: reciever,
							},
						)
						reciever = make(map[*websocket.Conn]string)
						break
					} else if member != chat.Sender && member != name && count == len(Clients) {
						fmt.Println("group message offline member:", member)
						offline = append(offline, member)
					}
				}
			}
			// send to members that are online, with type groupchatmessage
			// fmt.Println("group chat message sent to reciever", chat)
			// if len(reciever) > 0 {
			// 	service.repo.BroadcastToChannel(
			// 		BroadcastMessage{
			// 			WebMessage: WebsocketMessage{
			// 				Chat: chat,
			// 				Type: "groupMessage"},
			// 			Connections: reciever,
			// 		},
			// 	)
			// }

			//add notif for offline members with no existing notif
			for _, member := range offline {

				notifCount, err := service.repo.CheckGroupChatNotification(group.ID, member)
				if err != nil && notifCount == -1 {
					fmt.Println("Websocket group chat: CheckGroupChatNotification err:", err)
					continue
				}
				if notifCount == 0 {
					fmt.Println("adding new group chat notif to db")
					service.repo.AddNewGroupChatNotif(group.ID, member, chat.Sender)
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
			if uploadFollowInfo.InfluencerVis == "public" && fInfo.FollowAction == "follow" {
				uploadFollowInfo.Accept = "Yes"
				//Private profile influencer needs to approve follow request
			} else if uploadFollowInfo.InfluencerVis == "private" && fInfo.FollowAction == "follow" {
				uploadFollowInfo.Accept = "Pending"
			}
			//either "follow" or "un-follow"
			uploadFollowInfo.FollowAction = fInfo.FollowAction
			fmt.Println("the follow info received: ", fInfo)
			fmt.Println("uploadFollowInfo to upload in db", uploadFollowInfo)

			if uploadFollowInfo.InfluencerVis == "public" {
				fmt.Println("Checking if follow request goes to 'visibility public' branch")
				//populate the db table 'followers'
				_, err := service.repo.InsertFollowRequest(uploadFollowInfo)
				if err != nil {
					log.Fatalf(err.Error())
				}

			} else if uploadFollowInfo.InfluencerVis == "private" && uploadFollowInfo.FollowAction == "follow" && fInfo.InfluLogged == "Yes" {
				//private influencer is logged in
				//populate the db table 'followers' and get the followID
				followID, err := service.repo.InsertFollowRequest(uploadFollowInfo)
				if err != nil {
					log.Fatalf(err.Error())
				}
				//send request notification through influencer's channel
				online := false
				fmt.Println("Printing to get rid of the error", online)
				reciever := make(map[*websocket.Conn]string)
				//find influencer's channel
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
					}
				}

			} else if uploadFollowInfo.InfluencerVis == "private" && uploadFollowInfo.FollowAction == "follow" && fInfo.InfluLogged == "No" {
				fmt.Println("Entering the influencer offline branch. uploadfollowinfo: ", uploadFollowInfo)
				//influencer is off-line, populate the 'followers' table
				//offline countAlerts are sent from case: "connect"
				_, err := service.repo.InsertFollowRequest(uploadFollowInfo)
				if err != nil {
					log.Fatalf(err.Error())
				}

			} else if uploadFollowInfo.FollowAction == "un-follow" {
				//delete record from Followers table
				_, err := service.repo.InsertFollowRequest(uploadFollowInfo)
				if err != nil {
					log.Fatalf(err.Error())
				}
				fmt.Println("The follow record has been removed from the db")
			}

		case "followReply":
			var fReply FollowReply
			//populate the FollowReply struct
			jsonErr := json.Unmarshal(b, &fReply)
			fmt.Println("fInfo:", fReply)
			if jsonErr != nil {
				fmt.Println("there is an error with json msg: followReply")
			}
			//Update the 'accepted' field in 'Followers' table
			err := service.repo.InsertFollowReply(fReply)
			if err != nil {
				fmt.Println("error inserting the follow reply", err)
			}

		case "newGroup":
			var newGp NewGroup

			//populate the NewGroup struct
			jsonErr := json.Unmarshal(b, &newGp)

			if jsonErr != nil {
				fmt.Println("there is an error with json msg: newGp")
			}
			//insert new group data in the 'Groups' table
			newGp.ID, err = service.repo.InsertNewGroup(newGp)
			if err != nil {
				fmt.Println("error inserting new gp data", err)
			}

			fmt.Println("newGp:", newGp)

			//insert group members into the GroupMembers table
			for i := 0; i < len(newGp.GpMembers); i++ {

				err = service.repo.InsertGrpMember(newGp, i)
				if err != nil {
					fmt.Println("error inserting grpMember: ", newGp.GpMembers[i])
				}
				//create group chat
				m, err := service.repo.GetUserByEmail(newGp.Creator)
				if err != nil {
					fmt.Println("Websocket new group case:", err)
					m.NickName = ""
				}
				service.repo.AddGroupChatToDB(newGp.GrpName, newGp.ID, m.NickName)
				//send group chat info to  group creator
				reciever := make(map[*websocket.Conn]string)
				reciever[ws] = newGp.Creator
				group := []string{newGp.GrpName}
				service.repo.BroadcastToChannel(
					BroadcastMessage{
						WebMessage: WebsocketMessage{
							Presences: Presences{
								Groups: [][]string{group},
							},
							Type: "group chat update",
						},
						Connections: reciever})
				//return new group notification information
				newGpNotif, err1 := service.repo.CheckUserOnline(newGp.GrpName, newGp.GrpDescr, newGp.ID, newGp.GpMembers[i], newGp.Creator)
				if err1 != nil {
					fmt.Println("error returning newGpNotif data: ", err1)
				}

				fmt.Println("The new gp notification sent to f.e.: ", newGpNotif)

				//check if the group member is online and send notification
				if newGpNotif.MemberStatus == "memberPending" && newGpNotif.MemberLogged == "Yes" {
					//send new group notification to member
					online := false
					fmt.Println("Printing to get rid of the error", online)
					reciever := make(map[*websocket.Conn]string)
					//find member's channel
					for conn, client := range Clients {
						if client == newGpNotif.Member {
							reciever[conn] = client
							online = true
							service.repo.BroadcastToChannel(BroadcastMessage{WebMessage: WebsocketMessage{NewGroupNotif: newGpNotif, Type: newGpNotif.Type}, Connections: reciever})
						}
					}
				} else if newGpNotif.MemberStatus == "memberPending" && newGpNotif.MemberLogged == "No" {
					fmt.Println("Entering the new group offline branch")
					//new group member is off-line
					//offline countAlerts are sent from case: "connect"
				}

			} //end of inserting new group members in the GroupMembers table

		case "joinGroupReply":
			//reply to creator's invite
			var joinGrpReply JoinGroupReply

			//populate the JoinGroupReply struct
			jsonErr := json.Unmarshal(b, &joinGrpReply)
			fmt.Println("JoinGroupReply data:", joinGrpReply)
			if jsonErr != nil {
				fmt.Println("error unmarshalling joinGroupReply msg: ", jsonErr)
			}

			//insert member reply in the 'GroupMembers' table
			err = service.repo.InsertGroupMemberReply(joinGrpReply)
			if err != nil {
				fmt.Println("error inserting gp member reply into GroupMembers table", err)
			}

			if joinGrpReply.JoinGroupReply == "Yes" {
				// if user has accepted the invite then add to group chat
				id, _ := strconv.Atoi(joinGrpReply.GroupID)
				groupName := service.repo.GetGroupNameFromId(id)
				// service.repo.AddGroupChatMemeberToDB(groupName, id, joinGrpReply.Member)
				//send group chat info to  group member
				reciever := make(map[*websocket.Conn]string)
				online := false
				//check if newly accepted user is online as they might have been accepted by the creator and be offline
				for conn, name := range Clients {
					if name == joinGrpReply.Member {
						reciever[conn] = name
						online = true
						break
					}
				}
				if online {
					//send group chat update if the new member is online
					service.repo.BroadcastToChannel(
						BroadcastMessage{
							WebMessage: WebsocketMessage{
								NewGroupNotif: NewGroupNotif{
									Creator: joinGrpReply.Member,
									GrpID:   id,
									GrpName: groupName,
								},
								Type: "group chat update",
							},
							Connections: reciever,
						},
					)
				}

			}
		case "getGroups":
			//this is a request to send a slice of existing groups to the f.e.
			var rAllGps RequestAllGroups
			var sendAllGps SendAllGroups

			jsonErr := json.Unmarshal(b, &rAllGps)
			if jsonErr != nil {
				fmt.Println("error unmarshalling getGroups: ", jsonErr)
			}
			//retrieve a list of existing groups and their associated data
			grpCount, grpSlice := service.repo.GetExistingGroups()

			//get user's data
			theUsr, err := service.repo.GetUserByEmail(rAllGps.UsrEmail)
			if err != nil {
				fmt.Println("error from function GetUserByEmail: ", err)
			}

			//populate the sendAllGroups struct
			sendAllGps.Requestor = theUsr.NickName
			sendAllGps.NbGroups = grpCount
			sendAllGps.SliceOfGroups = grpSlice
			sendAllGps.Type = "sendAllGroups"

			fmt.Println("The slice of groups sent to the f.e. is: ", sendAllGps)

			//send the 'sendAllGps' struct to member
			online := false
			fmt.Println("Printing to get rid of the error", online)
			reciever := make(map[*websocket.Conn]string)
			//find member's channel
			for conn, client := range Clients {
				if client == sendAllGps.Requestor {
					reciever[conn] = client
					online = true
					service.repo.BroadcastToChannel(BroadcastMessage{WebMessage: WebsocketMessage{SendAllGroups: sendAllGps, Type: sendAllGps.Type}, Connections: reciever})
				}
			}

		//start of get all group events
		case "getGpEvents":
			//this is a request to send all group's events
			var sGpEvents SendGpEvents
			var oEvent OneEvent

			jsonErr := json.Unmarshal(b, &oEvent)
			if jsonErr != nil {
				fmt.Println("error unmarshalling getGpEvents: ", jsonErr)
			}

			evtCount, evtSlice := service.repo.GetOneGroupEvents(oEvent.EvtMember, oEvent.GrpID, oEvent.GrpName)

			//populate the SendGpEvents struct
			sGpEvents.Requestor = oEvent.EvtMember
			sGpEvents.NbEvents = evtCount
			sGpEvents.SliceOfEvents = evtSlice
			sGpEvents.Type = "sendGpEvents"

			fmt.Println("the SendGpEvents data sent to f.e. ===>", sGpEvents)

			//send group events to front end
			online := false
			fmt.Println("Printing to get rid of the error", online)
			reciever := make(map[*websocket.Conn]string)
			//find member's channel
			for conn, client := range Clients {
				if client == sGpEvents.Requestor {
					reciever[conn] = client
					online = true
					service.repo.BroadcastToChannel(BroadcastMessage{WebMessage: WebsocketMessage{SendGpEvents: sGpEvents, Type: sGpEvents.Type}, Connections: reciever})
				}
			}

		//end of get all group events

		case "allJoinGrRequests":
			//user requests group creator for permission to join group
			var joinGpsRequests JoinGroupsRequests

			jsonError := json.Unmarshal(b, &joinGpsRequests)
			if jsonError != nil {
				fmt.Println("error unmarshalling joinGroupRequest: ", jsonError)
				return
			}

			fmt.Println("the slice of join group requests: *******", joinGpsRequests)

			//iterate over slice of join grp requests
			for _, req := range joinGpsRequests.AllJoinGrRequests {
				//this is the email of user asking to join
				joinWhoEmail := req.JoinRequestBy
				//get user data
				joinWho, err1 := service.repo.GetUserByEmail(joinWhoEmail)
				if err1 != nil {
					fmt.Println("error retrieving gp creator data: ", err1)
					return
				}

				//assign nickName to requestor
				req.JoinRequestBy = joinWho.NickName

				fmt.Println("Checking the type inside req: ", req.Type)

				//get group creator's data
				askWho, err2 := service.repo.GetUserByNickName(req.GrpCreator)
				if err2 != nil {
					fmt.Println("error retrieving gp creator by nickName: ", err2)
					return
				}
				//upload join group request data to the GroupMembers table
				joinStatus := "creatorPending"

				err3 := service.repo.InsertJoinRequest(req, joinStatus)
				if err3 != nil {
					fmt.Println("error inserting a join group request: ", err3)
					return
				}

				fmt.Println("This is the join group request sent to the group creator: *****", req)
				fmt.Println("Is the group creator logged in and nickName: >>>>>", askWho.LoggedIn, askWho.NickName)
				fmt.Println("Is the askWho data: >>>>>", askWho)

				//if group creator is online send a notification
				if askWho.LoggedIn == "Yes" {
					//send request to group creator
					online := false
					fmt.Println("Printing to get rid of the error", online)
					reciever := make(map[*websocket.Conn]string)
					//find member's channel
					for conn, client := range Clients {
						if client == askWho.NickName {
							reciever[conn] = client
							online = true
							service.repo.BroadcastToChannel(BroadcastMessage{WebMessage: WebsocketMessage{OneJoinGroupRequest: req, Type: "oneJoinGroupRequest"}, Connections: reciever})
						}
					}

				} //Else if group creator is offline, Join group request will be added to offline alerts and sent from case: "connect"

			} //end of iteration over AllJoinGrRequests array

		case "groupInvite":
			//A group member has invited one of his followers to join
			var groupInvite NewGroupNotif

			jsonError := json.Unmarshal(b, &groupInvite)
			if jsonError != nil {
				fmt.Println("error unmarshalling groupInvite: ", jsonError)
				return
			}

			//get invitee's data
			askWho, err2 := service.repo.GetUserByNickName(groupInvite.Member)
			if err2 != nil {
				fmt.Println("error retrieving gp creator by nickName: ", err2)
				return
			}

			joinStatus := "memberPending"

			//upload join group request data to the GroupMembers table
			err3 := service.repo.InsertGrpInvite(groupInvite, joinStatus)
			if err3 != nil {
				fmt.Println("error inserting gp invite: ", err3)
				return
			}

			//get avatar for gp member extending the invite
			theAvtr, err4 := service.repo.getUserAvatar(groupInvite.InvitedBy)
			if err4 != nil {
				fmt.Println("error returning InvitedBy avatar: ", err4)
			}

			//here the creator is swapped with invitedBy for all fields in the 'groupInvite' struct
			//hence creatorURL and Image are actually the url and image of the user that extended the invite (= InvitedBy)
			//this is done so that front end notifications and alerts will work for both 'new group' and for 'join group' events
			groupInvite.CreatorURL = theAvtr.CreatorURL
			groupInvite.CreatorImage = theAvtr.CreatorImage
			//re-assign value for creator field to invitedBy
			groupInvite.Creator = groupInvite.InvitedBy
			groupInvite.CreatorLogged = "Yes"
			groupInvite.MemberLogged = askWho.LoggedIn
			groupInvite.MemberStatus = "memberPending"

			fmt.Println("the group invite notif object sent to front end: ", groupInvite)

			//check if follower is online and if so send notification
			if groupInvite.MemberStatus == "memberPending" && groupInvite.MemberLogged == "Yes" {
				//send new group notification to member
				online := false
				fmt.Println("Printing to get rid of the error", online)
				reciever := make(map[*websocket.Conn]string)
				//find member's channel
				for conn, client := range Clients {
					if client == groupInvite.Member {
						reciever[conn] = client
						online = true
						service.repo.BroadcastToChannel(BroadcastMessage{WebMessage: WebsocketMessage{NewGroupNotif: groupInvite, Type: "newGroupNotif"}, Connections: reciever})
					}
				}
			} else if groupInvite.MemberStatus == "memberPending" && groupInvite.MemberLogged == "No" {
				fmt.Println("Entering the new group offline branch")
				//new group member is off-line
				//offline countAlerts are sent from case: "connect"
			}

		case "newEvent":
			var newEv NewEventNotif
			status := "participantPending"

			//populate the newEv struct with f.e. data
			jsonErr := json.Unmarshal(b, &newEv)

			if jsonErr != nil {
				fmt.Println("there is an error with json msg: newEv")
			}
			//insert new event data in the 'Events' table
			eID, err := service.repo.InsertNewEvent(newEv)
			if err != nil {
				fmt.Println("error inserting new gp data", err)
			}

			newEv.ID = eID

			fmt.Println("newEv:", newEv)

			//insert event members into the EventsParticipants table
			for i := 0; i < len(newEv.GrpMembers); i++ {
				if newEv.GrpMembers[i] == "" {
					continue
				}

				err = service.repo.InsertEvtMember(newEv, i, status)
				if err != nil {
					fmt.Println("error inserting evtMember: ", newEv.GrpMembers[i])
				}

				//return new event notification information
				newEvNotif, err1 := service.repo.CheckEvParticipantOnline(newEv.EvtName, newEv.EvtDescr, newEv.ID, newEv.GrpMembers[i], newEv.EvtCreator, newEv.GrpID)
				if err1 != nil {
					fmt.Println("error returning newEvNotif data: ", err1)
				}

				//add missing info to the newEvNotif struct
				//the type is: newEventNotif
				newEvNotif.EvtDateTime = newEv.EvtDateTime
				newEvNotif.GrpCreator = newEv.GrpCreator
				newEvNotif.GrpDescr = newEv.GrpDescr
				newEvNotif.GrpName = newEv.GrpName
				newEvNotif.GrpMembers = newEv.GrpMembers

				//return group's events
				evtCount, evtSlice := service.repo.GetOneGroupEvents(newEv.GrpMembers[i], newEv.GrpID, newEv.GrpName)

				//add group events slice to newEvNotif struct
				newEvNotif.NbEvents = evtCount
				newEvNotif.SliceOfEvents = evtSlice

				fmt.Println("The new event notification sent to f.e.: ", newEvNotif)

				//check if the event participant is online and send notification
				if newEvNotif.EvtMemberStatus == "participantPending" && newEvNotif.EvtMemberLogged == "Yes" {
					//send new group notification to member
					online := false
					fmt.Println("Printing to get rid of the error", online)
					reciever := make(map[*websocket.Conn]string)
					//find member's channel
					for conn, client := range Clients {
						if client == newEvNotif.EvtMember {
							reciever[conn] = client
							online = true
							service.repo.BroadcastToChannel(BroadcastMessage{WebMessage: WebsocketMessage{NewEventNotif: newEvNotif, Type: newEvNotif.Type}, Connections: reciever})
						}
					}
				} else if newEvNotif.EvtMemberStatus == "participantPending" && newEvNotif.EvtMemberLogged == "No" {
					fmt.Println("Entering the new event offline branch")
					//new event participant is off-line
					//offline countAlerts are sent from case: "connect"
				}

			} //end of inserting new event participants in the EventsParticipants table

		case "attendEventReply":
			var evReply EvtReply

			//populate the newEv struct with f.e. data
			jsonErr := json.Unmarshal(b, &evReply)

			if jsonErr != nil {
				fmt.Println("there is an error with json msg: attendEventReply")
			}

			fmt.Println("the event reply from f.e. is =====>", evReply)

			err := service.repo.InsertEventPartReply(evReply)
			if err != nil {
				fmt.Println("error inserting event participant's reply: ", err)

			}

		} //end of 'switch for message type'

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
	var followAction = uploadFollowRequest.FollowAction
	fmt.Println("inside the InsertFollowRequest, followAction is: ", followAction)
	if followAction == "un-follow" {
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
	} else if followAction == "follow" {
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

// uploads private user reply to follow request
func (repo *dbStruct) InsertFollowReply(theReply FollowReply) error {
	var theAnswer = theReply.FollowReply

	if theAnswer == "Yes" {
		_, err := repo.db.Exec("UPDATE Followers SET accepted = ? WHERE follow = ?", theReply.FollowReply, theReply.FollowID)
		if err != nil {
			fmt.Println("error inserting follow reply", err)
			return err
		}
	} else if theAnswer == "No" {
		fmt.Println("User has declined")
		fmt.Println("before prepare delete request")
		stmnt, err := repo.db.Prepare("DELETE FROM Followers WHERE follow = ?")
		if err != nil {
			fmt.Println("error preparing the delete statement to remove rejected follow request", err)
			return err
		}
		fmt.Println("after prepare delete request")
		_, err = stmnt.Exec(theReply.FollowID)
		if err != nil {
			fmt.Println("error deleting record of rejected follow request")
			return err
		}
	}
	return nil
}

func (r *dbStruct) ClientsFollowingUser(user *User) map[*websocket.Conn]string {

	list := make(map[*websocket.Conn]string)
	for conn, name := range Clients {
		fmt.Println(" check if ", name, "follows ", user.NickName)
		stmt, err := r.db.Prepare(`SELECT COUNT (*) FROM Followers WHERE (followerUserName, influencerUserName) = (?,?) `)
		if err != nil {
			fmt.Println("ClientsFollowingUser:Prepare error", err)
			//client not following user
			continue
		}
		var count int
		err = stmt.QueryRow(name, user.NickName).Scan(&count)
		if err != nil {
			fmt.Println("ClientsFollowingUser: client not following user, query error", err)
			continue
		}
		if count > 0 {
			list[conn] = name
		}
	}
	return list
}
func (r *dbStruct) FullGroupChatList(user *User) [][]string {
	var groups [][]string
	rows, err := r.db.Query(`SELECT title FROM Groups G JOIN GroupMembers M ON G.groupID = M.grpID WHERE M.member = ? AND M.status = 'Yes'`, user.NickName)

	if err != nil {
		fmt.Println("FullGroupChatUserList: query error", err)
		return groups
	}

	for rows.Next() {
		var title string
		err = rows.Scan(&title)
		var group []string
		group = append(group, title)
		groupInfo, err := r.GetGroupFromGroupName(title)
		_, count, err := r.CheckForGroupNotification(groupInfo.ID, user.NickName)
		if err != nil {
			fmt.Println("FullGroupChatList:", err)
		}
		c := strconv.Itoa(count)
		group = append(group, c)
		groups = append(groups, group)
	}

	return groups
}
func (r *dbStruct) FullChatUserList(user *User) Presences {
	var list Presences
	rows, err := r.db.Query(`SELECT influencerUserName FROM Followers WHERE followerUserName = ? AND accepted = 'Yes'`, user.NickName)
	if err != nil {
		fmt.Println("FullChatUserList: query error", err)
		return list
	}
	rows2, err2 := r.db.Query(`SELECT followerUserName  FROM Followers WHERE influencerUserName = ? AND accepted = 'Yes'`, user.NickName)
	if err2 != nil {
		fmt.Println("FullChatUserList: query error", err2)
		return list
	}
	following := r.IsClientOnline(rows, user)
	followers := r.IsClientOnline(rows2, user)
	list.Clients = append(list.Clients, following...)
	list.Clients = append(list.Clients, followers...)
	bucket := make(map[string]bool)
	var result [][]string
	for _, str := range list.Clients {
		name := str[0]
		fmt.Println("the user you are following:", name)
		if _, ok := bucket[name]; !ok {
			bucket[name] = true
			result = append(result, str)
		}
	}
	list.Clients = result
	return list
}

func (r *dbStruct) IsClientOnline(rows *sql.Rows, user *User) [][]string {
	var list [][]string
	for rows.Next() {
		var influencer string
		err := rows.Scan(&influencer)
		if err != nil {
			fmt.Println("FullChatUserList: follower row scan error", err)
			return list
		}
		client := []string{}
		client = append(client, influencer)
		// list.Clients = append(list.Clients, influencer)
		loggedIn := false
		for _, name := range Clients {
			if name == influencer {
				client = append(client, "yes")
				// list.LoggedIn = append(list.LoggedIn, "yes")
				loggedIn = true
			}
		}
		if !loggedIn {
			client = append(client, "no")
			// list.LoggedIn = append(list.LoggedIn, "no")
		}
		chat := Chat{
			Sender:   influencer,
			Reciever: user.NickName,
		}
		_, count, err3 := r.CheckForNotification(chat)
		if err3 != nil {
			fmt.Println("the error returned by CheckForNotification: ", err3)
		}
		c := strconv.Itoa(count)
		client = append(client, c)
		list = append(list, client)

	}
	return list

}

// follow alerts sent to offline influencer
func (repo *dbStruct) GetPendingFollowRequests(nickname string) (int, []FollowNotifOffline) {
	var fPending []FollowNotifOffline
	var fCount int

	fmt.Println("From inside GetPendingFollowRequests, the influencer name is: ", nickname)

	//get data from 'Users' and 'Followers' tables for followers with status 'pending'
	//Abandoned as it caused the sqllite db to be locked
	/*query := `
		SELECT U.avatarURL, U.imageFile, F.follow, F.followerUserName, F.influencerUserName,
	    CASE
			WHEN F.influencerUserName = ? AND F.accepted = 'Pending' THEN 1
			ELSE 0
		END AS follower
	    FROM Users U
	    LEFT JOIN Followers F ON U.nickName = F.followerUserName AND  F.influencerUserName  = ?
	    WHERE U.nickName != ?
	`

	row, err := repo.db.Query(query, nickname, nickname, nickname)
	if err != nil {
		fmt.Println("GetPendingFollowRequest query error", err, fPending)
		return 0, fPending
	}
	for row.Next() {
	//err := row.Scan(&oneFollowPending.FollowerURL, &oneFollowPending.FollowerImage, &oneFollowPending.FollowID, &oneFollowPending.FollowerUN, &oneFollowPending.InfluencerUN, &oneFollowPending.Follower)
			if err != nil {
			fmt.Println("GetPendingFollowRequests scan Error", err, fPending)
			return 0, fPending
		}
	*/

	//The original query that is working but doesn't include follower avatar
	/*query := `SELECT follow, followerUserName, influencerUserName FROM Followers WHERE influencerUserName = ? AND accepted = ?`
	row, err := repo.db.Query(query, nickname, "Pending")
	if err != nil {
		fmt.Println("GetPendingFollowRequests query Error", err, fPending)
		return 0, fPending
	}

	var oneFollowPending FollowNotifOffline

	for row.Next() {

		err := row.Scan(&oneFollowPending.FollowID, &oneFollowPending.FollowerUN, &oneFollowPending.InfluencerUN)
		if err != nil {
			fmt.Println("GetPendingFollowRequests scan Error", err, fPending)
			return 0, fPending
		}*/

	var oneFollowPending FollowNotifOffline
	//returns avatar from 'Users' and info from 'Followers' table
	query := `
			SELECT U.avatarURL, U.imageFile, F.follow, F.followerUserName, F.influencerUserName
			FROM Users U
			INNER JOIN Followers F ON U.nickName = F.followerUserName
			WHERE F.influencerUserName = ? AND F.accepted = 'Pending' AND U.nickName != F.influencerUserName
		`
	rows, err := repo.db.Query(query, nickname)
	if err != nil {
		fmt.Println("error querying pending follow requests for offline user", err)
		return 0, fPending
	}

	defer rows.Close()

	for rows.Next() {

		err := rows.Scan(&oneFollowPending.FollowerURL, &oneFollowPending.FollowerImage, &oneFollowPending.FollowID, &oneFollowPending.FollowerUN, &oneFollowPending.InfluencerUN)
		if err != nil {
			fmt.Println("GetPendingFollowRequests for offline user scan Error", err, oneFollowPending)
			return 0, fPending
		}

		fmt.Println("One pending follower data for offline user: ", oneFollowPending)

		fPending = append(fPending, oneFollowPending)

		fmt.Println("Slice of pending followers for offline user", fPending)
		oneFollowPending = FollowNotifOffline{}

	}

	err = rows.Err()
	if err != nil {
		return 0, fPending
	}

	fCount = len(fPending)

	return fCount, fPending
}

// populate the Groups table
func (repo *dbStruct) InsertNewGroup(g NewGroup) (int, error) {
	//retrieve creator's user name
	creator, err := repo.GetUserByEmail(g.Creator)
	if err != nil {
		fmt.Println("error retrieving group creator data", err)
		return 0, err
	}

	//populate the db table 'Groups'
	stmnt, err := repo.db.Prepare("INSERT OR IGNORE INTO Groups (creator, title, description) VALUES (?, ?, ?)")
	if err != nil {
		fmt.Println("Error preparing insert stmt for follow request into DB: ", err)
		return 0, err
	}
	_, err = stmnt.Exec(creator.NickName, g.GrpName, g.GrpDescr)
	if err != nil {
		fmt.Println("Error inserting new group into DB: ", err)
		return 0, err
	}

	//return the auto-generated 'groupID'
	rows, err := repo.db.Query("SELECT seq FROM sqlite_sequence WHERE name = 'Groups'")
	if err != nil {
		fmt.Println("Error returning 'new group id'", err)
		return 0, err
	}
	for rows.Next() {
		err := rows.Scan(&g.ID)
		if err != nil {
			fmt.Println("group ID sqlite_sequence: row scan error", err)
			return 0, err
		}
	}
	return g.ID, nil

}

//Populate new group's GroupMembers table
func (repo *dbStruct) InsertGrpMember(newGp NewGroup, i int) error {
	var status string
	//retrieve creator's user name
	creator, err := repo.GetUserByEmail(newGp.Creator)
	if err != nil {
		fmt.Println("error retrieving group creator data", err)
		return err
	}

	creatorUN := creator.NickName

	//prepare the query
	stmt, err := repo.db.Prepare("INSERT OR IGNORE into GroupMembers (grpID, creator, member, status) values(?, ?, ?, ?)")
	if err != nil {
		fmt.Println("error preparing statement to insert group members", err)
		return err
	}

	//group creator is automatically a group member
	if newGp.GpMembers[i] == creatorUN {
		status = "Yes"
	} else {
		status = "memberPending"
	}

	fmt.Println("the index, gpMember and status are: ", i, newGp.GpMembers[i], status)

	_, err = stmt.Exec(newGp.ID, creatorUN, newGp.GpMembers[i], status)
	if err != nil {
		fmt.Println("error inserting group member", err)
		return err
	}

	return nil
}

// Populate join group request's GroupMembers table
func (repo *dbStruct) InsertJoinRequest(joinReq OneJoinGroupRequest, status string) error {

	//prepare the query
	stmt, err := repo.db.Prepare("INSERT OR IGNORE into GroupMembers (grpID, creator, member, status) values(?, ?, ?, ?)")
	if err != nil {
		fmt.Println("error preparing statement to insert join group request", err)
		return err
	}

	_, err = stmt.Exec(joinReq.GrpID, joinReq.GrpCreator, joinReq.JoinRequestBy, status)
	if err != nil {
		fmt.Println("error inserting group member", err)
		return err
	}

	return nil
}

//check if a user is online or offline,
//used for group notifications
func (repo *dbStruct) CheckUserOnline(grNm string, grDescr string, grId int, user string, creator string) (NewGroupNotif, error) {
	//instantiate the NewGroupNotif struct
	var newGpNotif NewGroupNotif

	//return 'loggedIn' value for member
	err1 := repo.db.QueryRow("SELECT loggedIn from Users where nickName = ?", user).Scan(&newGpNotif.MemberLogged)
	if err1 != nil {
		fmt.Println("error returning loggedIn data", err1)
		return newGpNotif, err1
	}

	//return 'member status' value for member
	err2 := repo.db.QueryRow("SELECT status from GroupMembers where member = ? AND grpID = ? ", user, grId).Scan(&newGpNotif.MemberStatus)
	if err2 != nil {
		fmt.Println("error returning member status data", err2)
		return newGpNotif, err2
	}

	//return avatar URL and image for creator
	err3 := repo.db.QueryRow("SELECT avatarURL, imageFile, nickName, loggedIn from Users where email = ?", creator).Scan(&newGpNotif.CreatorURL, &newGpNotif.CreatorImage, &newGpNotif.Creator, &newGpNotif.CreatorLogged)
	if err3 != nil {
		fmt.Println("error returning URL and image: ", err3)
		return newGpNotif, err3
	}

	newGpNotif.Member = user
	newGpNotif.GrpName = grNm
	newGpNotif.GrpDescr = grDescr
	newGpNotif.GrpID = grId
	newGpNotif.Type = "newGroupNotif"

	return newGpNotif, nil

}

// group invites sent to offline users
func (repo *dbStruct) GetPendingGroupInvites(member string) (int, []NewGroupNotif) {
	var gPending []NewGroupNotif
	var gCount int

	fmt.Println("From inside GetPendingGroupInvites, the user name is: ", member)

	var oneGroupPending NewGroupNotif
	//returns avatar from 'Users' and info from 'GroupMembers' table
	query := `
			SELECT U.avatarURL, U.imageFile, G.grpID, G.creator, G.member, G.status
			FROM Users U
			INNER JOIN GroupMembers G ON U.nickName = G.creator
			WHERE G.member = ? AND G.status = 'memberPending' AND U.nickName != G.member
		`
	rows, err := repo.db.Query(query, member)
	if err != nil {
		fmt.Println("error querying pending group invites for offline user", err)
		return 0, gPending
	}

	defer rows.Close()

	for rows.Next() {

		err := rows.Scan(&oneGroupPending.CreatorURL, &oneGroupPending.CreatorImage, &oneGroupPending.GrpID, &oneGroupPending.Creator, &oneGroupPending.Member, &oneGroupPending.MemberStatus)
		if err != nil {
			fmt.Println("GetPendingFollowRequests for offline user scan Error", err, oneGroupPending)
			return 0, gPending
		}

		//get group name and description
		err3 := repo.db.QueryRow("SELECT title, description from Groups where groupID = ?", oneGroupPending.GrpID).Scan(&oneGroupPending.GrpName, &oneGroupPending.GrpDescr)
		if err3 != nil {
			fmt.Println("error returning group name and description: ", err3)
			return 0, gPending
		}

		oneGroupPending.MemberLogged = "No"
		oneGroupPending.Type = "connect"

		fmt.Println("One pending new group for offline user: ", oneGroupPending)

		gPending = append(gPending, oneGroupPending)

		fmt.Println("Slice of pending group invites for offline user", gPending)
		oneGroupPending = NewGroupNotif{}

	}

	err = rows.Err()
	if err != nil {
		return 0, gPending
	}

	gCount = len(gPending)

	return gCount, gPending
}

func (repo *dbStruct) InsertGroupMemberReply(joinGrpReply JoinGroupReply) error {
	fmt.Println("the joinGrpReply data received from f.e.: ", joinGrpReply.GroupID, joinGrpReply.JoinGroupReply, joinGrpReply.Member, joinGrpReply.Type)
	//turn groupID into integer so it can be used in db query
	gID := joinGrpReply.GroupID
	gpID, err1 := strconv.Atoi(gID)
	if err1 != nil {
		fmt.Println("error converting GroupID struct field into integer ", err1)
		return err1
	}

	//if member wishes to join turn status field in GroupMembers table into "Yes"
	//If member does not wish to join delete his record from GroupMembers table

	var theAnswer = joinGrpReply.JoinGroupReply
	var member = joinGrpReply.Member

	if theAnswer == "Yes" {
		_, err := repo.db.Exec("UPDATE GroupMembers SET status = ? WHERE grpID = ? AND member = ?", theAnswer, gpID, member)
		if err != nil {
			fmt.Println("error inserting join group reply", err)
			return err
		}
	} else if theAnswer == "No" {
		fmt.Println("Member declined")
		stmnt, err := repo.db.Prepare("DELETE FROM GroupMembers WHERE grpID = ? AND member = ?")
		if err != nil {
			fmt.Println("error preparing the delete statement to remove member that declined to join", err)
			return err
		}
		fmt.Println("after prepare delete request")
		_, err = stmnt.Exec(gID, member)
		if err != nil {
			fmt.Println("error deleting record from GroupMembers")
			return err
		}
	}
	return nil

}

// get data for existing groups
// group invites sent to offline users
func (repo *dbStruct) GetExistingGroups() (string, []NewGroup) {
	var allGroups []NewGroup
	var gpMembers []string
	var aMember string
	var gCount string

	var oneGr NewGroup
	//return a single group info from 'Groups' table
	query1 := `
			SELECT groupID, creator, title, description FROM Groups
		`
	rows1, err1 := repo.db.Query(query1)
	if err1 != nil {
		fmt.Println("GetExistingGroups query error : ", err1)
		return "0", allGroups
	}

	defer rows1.Close()

	for rows1.Next() {

		err := rows1.Scan(&oneGr.ID, &oneGr.Creator, &oneGr.GrpName, &oneGr.GrpDescr)
		if err != nil {
			fmt.Println("GetExistingGroups scan Error", err, oneGr)
			return "0", allGroups
		}

		oneGr.Type = "arrayOfGroups"

		//for each group, build an array of group members from the 'GroupMembers' table
		//I restrict the query to members that have already joined
		query2 := `
				SELECT member FROM GroupMembers WHERE grpID = ? and status = ?
		`
		rows2, err2 := repo.db.Query(query2, oneGr.ID, "Yes")
		if err2 != nil {
			fmt.Println("GetExistingGroups error querying the list of group members: ", err2)
			return "0", allGroups
		}

		defer rows2.Close()

		for rows2.Next() {
			err3 := rows2.Scan(&aMember)
			if err3 != nil {
				fmt.Println("GetExistingGroups error scanning one group member: ", err3)
				return "0", allGroups
			}

			gpMembers = append(gpMembers, aMember)
		}
		//populate the oneGr struct with the slice of gp members
		oneGr.GpMembers = gpMembers
		fmt.Print("One group data: ", oneGr)
		//add the group to allGroups slice
		allGroups = append(allGroups, oneGr)

		//clear member variable
		aMember = ""

		//clear slice of gp members
		gpMembers = []string{""}

		//clear data from oneGr
		oneGr = NewGroup{}

	}

	fmt.Println("Slice of all existing groups: ===>", allGroups)

	gCount = strconv.Itoa(len(allGroups))

	return gCount, allGroups
}

// join group requests sent to offline group creator
func (repo *dbStruct) GetPendingJoinGroupRequests(creator string) (string, []OneOfflineJoinGroupRequest) {
	var gPending []OneOfflineJoinGroupRequest
	var gCount string

	fmt.Println("From inside GetPendingJoinGroupRequests, the creator name is: ", creator)

	var oneGroupPending OneOfflineJoinGroupRequest
	//returns avatar from 'Users' and info from 'GroupMembers' table
	query := `
			SELECT U.avatarURL, U.imageFile, G.grpID, G.creator, G.member, G.status
			FROM Users U
			INNER JOIN GroupMembers G ON U.nickName = G.member
			WHERE G.creator = ? AND G.status = 'creatorPending' AND U.nickName != G.creator
		`
	rows, err := repo.db.Query(query, creator)
	if err != nil {
		fmt.Println("error querying pending join group requests for offline creator", err)
		return "", gPending
	}

	defer rows.Close()

	for rows.Next() {

		err := rows.Scan(&oneGroupPending.MemberURL, &oneGroupPending.MemberImage, &oneGroupPending.GrpID, &oneGroupPending.GrpCreator, &oneGroupPending.Member, &oneGroupPending.MemberStatus)
		if err != nil {
			fmt.Println("GetPendingFollowRequests for offline user scan Error", err, oneGroupPending)
			return "", gPending
		}

		//get group name and description
		err3 := repo.db.QueryRow("SELECT title, description from Groups where groupID = ?", oneGroupPending.GrpID).Scan(&oneGroupPending.GrpName, &oneGroupPending.GrpDescr)
		if err3 != nil {
			fmt.Println("error returning group name and description: ", err3)
			return "", gPending
		}

		oneGroupPending.CreatorLogged = "No"
		oneGroupPending.Type = "connect"

		fmt.Println("One pending join group request for offline creator: ", oneGroupPending)

		gPending = append(gPending, oneGroupPending)

		fmt.Println("Slice of pending join group requests for offline creator", gPending)
		oneGroupPending = OneOfflineJoinGroupRequest{}

	}

	err = rows.Err()
	if err != nil {
		return "", gPending
	}

	gCount = strconv.Itoa((len(gPending)))

	return gCount, gPending
}

// Populate GroupMembers table with group invite where a member invites her follower
func (repo *dbStruct) InsertGrpInvite(gpInv NewGroupNotif, status string) error {

	//prepare the query
	stmt, err := repo.db.Prepare("INSERT OR IGNORE into GroupMembers (grpID, creator, member, status) values(?, ?, ?, ?)")
	if err != nil {
		fmt.Println("error preparing statement to insert group members", err)
		return err
	}
	//In this instance, the nickName of the member that extended the invite is uploaded in the 'creator' field
	_, err = stmt.Exec(gpInv.GrpID, gpInv.InvitedBy, gpInv.Member, status)
	if err != nil {
		fmt.Println("error inserting group invite", err)
		return err
	}

	return nil
}

// used for join group request
func (repo *dbStruct) getUserAvatar(nkName string) (NewGroupNotif, error) {
	var theInvite NewGroupNotif

	//return avatar URL and image for given nickName
	err3 := repo.db.QueryRow("SELECT avatarURL, imageFile from Users where nickName = ?", nkName).Scan(&theInvite.CreatorURL, &theInvite.CreatorImage)
	if err3 != nil {
		fmt.Println("error returning URL and image: ", err3)
		return theInvite, err3
	}

	return theInvite, nil
}

func (repo *dbStruct) AddGroupChatToDB(groupName string, id int, member string) {
	fmt.Println("adding group chat member to groupChat db----------")

	query1 := ` INSERT INTO GroupChats (groupID, groupName, participant) VALUES (?, ?, ?)`
	_, err := repo.db.Exec(query1, id, groupName, member)
	if err != nil {
		fmt.Println("AddGroupChatToDB: Exec Error", err)
	}
}

func (repo *dbStruct) GetGroupNameFromId(id int) string {
	fmt.Println("adding group chat member to groupChat db----------")
	query1 := ` SELECT groupName FROM GroupChats WHERE groupID = ?`
	rows, err := repo.db.Query(query1, id)
	if err != nil {
		fmt.Println("GetGroupNameFromId: Query Error", err)
	}
	var groupName string
	for rows.Next() {
		err := rows.Scan(&groupName)
		if err != nil {
			fmt.Println("GetGroupNameFromId: Row Scan Error", err)
			return groupName
		}
		break
	}
	err = rows.Close()
	return groupName
}

func (repo *dbStruct) AddGroupMessageToDB(chat Chat, id int) {
	fmt.Println("adding group message to db")
	query := `INSERT INTO GroupMessageHistory (chatMessage, sender, groupID, creationDate) VALUES (?,?,?,?)  `
	// stmt, err := repo.db.Prepare(query)
	// if err != nil {
	// 	fmt.Println("AddGroupMessageToDB: Prepare Error", err)
	// }
	date := time.Now()
	_, err := repo.db.Exec(query, chat.Message, chat.Sender, id, date)
	if err != nil {
		fmt.Println("AddGroupMessageToDB: Exec Error", err)
	}
}

func (repo *dbStruct) AddNewGroupChatNotif(groupId int, recip string, sender string) {
	query := `INSERT INTO ChatNotifications (sender, recipient, groupChatID, count) VALUES (?,?,?,?) `
	stmt, err := repo.db.Prepare(query)
	if err != nil {
		fmt.Println("AddGroupChatNotif: Prepare Error", err)
	}

	_, err = stmt.Exec(sender, recip, groupId, 1)
	if err != nil {
		fmt.Println("AddGroupChatNotif: Exec Error", err)
	}

}

func (repo *dbStruct) CheckGroupChatNotification(groupId int, member string) (int, error) {
	var count int

	query := `SELECT count FROM ChatNotifications WHERE groupChatID = ? AND recipient = ?`
	rows, err := repo.db.Query(query, groupId, member)
	if err != nil {
		fmt.Println("GetGroupFromGroupName: Scan Error", err)
		return count, err
	}
	for rows.Next() {
		err = rows.Scan(&count)
		if err != nil {
			fmt.Println("GetGroupFromGroupName: Scan Error", err)
			return 0, err
		}
	}
	return count, nil
}
func (repo *dbStruct) GetGroupFromGroupName(groupName string) (NewGroup, error) {
	var group NewGroup
	var id int
	query := `SELECT groupID FROM Groups WHERE title = ?`
	rows, err := repo.db.Query(query, groupName)
	if err != nil {
		fmt.Println("GetGroupFromGroupName: Scan Error", err)
		return group, err
	}
	for rows.Next() {
		err = rows.Scan(&id)
		if err != nil {
			fmt.Println("GetGroupFromGroupName: Scan Error", err)
			return group, err
		}
	}
	var members []string
	query2 := `SELECT member FROM GroupMembers WHERE grpID = ?`
	rows2, err := repo.db.Query(query2, id)
	if err != nil {
		fmt.Println("GetGroupFromGroupName: Scan Error", err)
		return group, err
	}
	for rows2.Next() {
		var member string
		err = rows2.Scan(&member)
		if err != nil {
			fmt.Println("GetGroupFromGroupName: Scan Error", err)
			return group, err
		}
		members = append(members, member)
	}
	group.ID = id
	group.GpMembers = members
	return group, nil
}

//populate the Events table
func (repo *dbStruct) InsertNewEvent(e NewEventNotif) (int, error) {
	fmt.Printf("from inside the InsertNewEvent the TYPE of grpID = %T", e.GrpID)
	//populate the db table 'Events'
	stmnt, err := repo.db.Prepare("INSERT OR IGNORE INTO Events (groupID, groupName, organizer, title, description, day_time) VALUES (?, ?, ?, ?, ?, ?)")
	if err != nil {
		fmt.Println("Error preparing insert stmt for new event: ", err)
		return 0, err
	}
	_, err = stmnt.Exec(e.GrpID, e.GrpName, e.EvtCreator, e.EvtName, e.EvtDescr, e.EvtDateTime)
	if err != nil {
		fmt.Println("Error inserting new event into DB: ", err)
		return 0, err
	}

	//return the auto-generated 'eventID'
	rows, err := repo.db.Query("SELECT seq FROM sqlite_sequence WHERE name = 'Events'")
	if err != nil {
		fmt.Println("Error returning 'new event id'", err)
		return 0, err
	}
	for rows.Next() {
		err := rows.Scan(&e.ID)
		if err != nil {
			fmt.Println("event ID sqlite_sequence: row scan error", err)
			return 0, err
		}
	}
	return e.ID, nil

}

//Populate new event's EventsParticipants table
func (repo *dbStruct) InsertEvtMember(newEv NewEventNotif, i int, status string) error {
	fmt.Printf("from inside the InsertEvtMember the TYPE of eventID = %T", newEv.ID)

	//prepare the query
	stmt, err := repo.db.Prepare("INSERT OR IGNORE into EventsParticipants (eventID, groupID, organizer, participant, option) values(?, ?, ?, ?, ?)")
	if err != nil {
		fmt.Println("error preparing statement to insert event participants", err)
		return err
	}

	_, err = stmt.Exec(newEv.ID, newEv.GrpID, newEv.EvtCreator, newEv.GrpMembers[i], status)
	if err != nil {
		fmt.Println("error inserting event participant", err)
		return err
	}

	return nil
}

//check if a user is online or offline,
//used for event notifications
func (repo *dbStruct) CheckEvParticipantOnline(EvtName string, EvtDescr string, ID int, gMember string, EvtCreator string, GrpID int) (NewEventNotif, error) {
	//instantiate the NewGroupNotif struct
	var newEvNotif NewEventNotif

	//return 'loggedIn' value for event participant
	err1 := repo.db.QueryRow("SELECT loggedIn from Users where nickName = ?", gMember).Scan(&newEvNotif.EvtMemberLogged)
	if err1 != nil {
		fmt.Println("error returning loggedIn data", err1)
		return newEvNotif, err1
	}

	//return 'member status' value for member
	err2 := repo.db.QueryRow("SELECT option from EventsParticipants where participant = ? AND eventID = ? ", gMember, ID).Scan(&newEvNotif.EvtMemberStatus)
	if err2 != nil {
		fmt.Println("error returning participant status data", err2)
		return newEvNotif, err2
	}

	//return avatar URL and image for creator
	err3 := repo.db.QueryRow("SELECT avatarURL, imageFile, loggedIn from Users where nickName = ?", EvtCreator).Scan(&newEvNotif.EvtCreatorURL, &newEvNotif.EvtCreatorImage, &newEvNotif.EvtCreatorLogged)
	if err3 != nil {
		fmt.Println("error returning URL, image, logged in for EvtCreator: ", err3)
		return newEvNotif, err3
	}

	newEvNotif.EvtCreator = EvtCreator
	newEvNotif.EvtMember = gMember
	newEvNotif.EvtName = EvtName
	newEvNotif.EvtDescr = EvtDescr
	newEvNotif.GrpID = GrpID
	newEvNotif.Type = "newEventNotif"

	return newEvNotif, nil

}

//event invites sent to offline users
//also used to populate event's group profile when visible
func (repo *dbStruct) GetPendingEventInvites(member string) (string, []NewEventNotif) {
	var ePending []NewEventNotif
	var eCount string
	var aMember string
	var gpMembers []string

	fmt.Println("From inside GetPendingEventInvites, the user name is: ", member)

	var oneGroupPending NewEventNotif
	//populate all 'oneGroupPending' fields

	//first, returns avatar from 'Users' and participant info from 'EventsMembers' table
	query := `
			SELECT U.avatarURL, U.imageFile, E.eventID, E.groupID, E.organizer, E.participant, E.option
			FROM Users U
			INNER JOIN EventsParticipants E ON U.nickName = E.organizer
			WHERE E.participant = ? AND E.option = 'participantPending' AND U.nickName != E.participant
		`
	rows, err := repo.db.Query(query, member)
	if err != nil {
		fmt.Println("error querying pending event invites for offline participant", err)
		return "", ePending
	}

	defer rows.Close()

	for rows.Next() {

		err := rows.Scan(&oneGroupPending.EvtCreatorURL, &oneGroupPending.EvtCreatorImage, &oneGroupPending.ID, &oneGroupPending.GrpID, &oneGroupPending.EvtCreator, &oneGroupPending.EvtMember, &oneGroupPending.EvtMemberStatus)
		if err != nil {
			fmt.Println("GetPendingEventsRequests for offline user scan Error", err, oneGroupPending)
			return "", ePending
		}

		//Then get event name, evt description, evt date and time
		err3 := repo.db.QueryRow("SELECT groupID, groupName, title, description, day_time from Events where eventID = ?", oneGroupPending.ID).Scan(&oneGroupPending.GrpID, &oneGroupPending.GrpName, &oneGroupPending.EvtName, &oneGroupPending.EvtDescr, &oneGroupPending.EvtDateTime)
		if err3 != nil {
			fmt.Println("error returning event details: ", err3)
			return "", ePending
		}

		//Next get group creator, group name and description
		err4 := repo.db.QueryRow("SELECT creator, title, description from Groups where groupID = ?", oneGroupPending.GrpID).Scan(&oneGroupPending.GrpCreator, &oneGroupPending.GrpName, &oneGroupPending.GrpDescr)
		if err4 != nil {
			fmt.Println("error returning group creator description and gpMembers: ", err4)
			return "", ePending
		}

		//make array of group members from the 'GroupMembers' table.
		//Only members that have already joined are included
		query2 := `
				SELECT member FROM GroupMembers WHERE grpID = ? and status = ?
		`
		rows2, err5 := repo.db.Query(query2, oneGroupPending.GrpID, "Yes")
		if err5 != nil {
			fmt.Println("GetPendingEventInvites error querying the list of group members: ", err5)
			return "", ePending
		}

		defer rows2.Close()

		for rows2.Next() {
			err3 := rows2.Scan(&aMember)
			if err3 != nil {
				fmt.Println("GetPendingEventInvites error scanning one group member: ", err3)
				return "", ePending
			}

			gpMembers = append(gpMembers, aMember)
		}

		//populate the oneGroupPending struct with the slice of gp members
		oneGroupPending.GrpMembers = gpMembers
		fmt.Print("group's members are: ", oneGroupPending.GrpMembers)

		//populate remaining fields for oneGroupPending struct
		oneGroupPending.EvtMemberLogged = "No"
		oneGroupPending.Type = "connect"

		fmt.Println("One pending new event for offline user: ", oneGroupPending)

		//add oneGroupPending to slice of pending events
		ePending = append(ePending, oneGroupPending)

		fmt.Println("Slice of pending events invites for offline user", ePending)
		oneGroupPending = NewEventNotif{}

	}

	err = rows.Err()
	if err != nil {
		return "", ePending
	}

	eCount = strconv.Itoa(len(ePending))

	return eCount, ePending
}

//insert the event participant's reply into EventParticipants table
func (repo *dbStruct) InsertEventPartReply(evReply EvtReply) error {
	fmt.Println("the eventReply data received from f.e.: ", evReply)

	//retrieve event id from Events table
	var evId int
	err3 := repo.db.QueryRow("SELECT eventID from Events where title = ?", evReply.EvtName).Scan(&evId)
	if err3 != nil {
		fmt.Println("error retrieving event id: ", err3)
		return err3
	}

	fmt.Println("the event id where we add event reply to db:", evId)

	//if member wishes to attend turn option field in EventsParticipants table into "going"
	if evReply.Reply == "going" {
		_, err := repo.db.Exec("UPDATE EventsParticipants SET option = ? WHERE eventID = ? AND participant = ?", evReply.Reply, evId, evReply.EvtMember)
		if err != nil {
			fmt.Println("error inserting attend event reply", err)
			return err
		}
	} else if evReply.Reply == "not going" {
		//If member does not wish to attend delete his record from EventsParticipants table
		fmt.Println("Member declined")
		stmnt, err := repo.db.Prepare("DELETE FROM EventsParticipants WHERE eventID = ? AND participant = ?")
		if err != nil {
			fmt.Println("error preparing the delete statement to remove participant that declined to attend event", err)
			return err
		}
		fmt.Println("after prepare delete request")
		_, err = stmnt.Exec(evId, evReply.EvtMember)
		if err != nil {
			fmt.Println("error deleting record from EventsParticipants")
			return err
		}
	}
	return nil

}

//get all events for one group
func (repo *dbStruct) GetOneGroupEvents(EvtMember string, GrpID int, GrpName string) (string, []OneEvent) {
	var eSlice []OneEvent
	var eCount string

	fmt.Println("the inputs to GetOneGroupEvents are ------------->>", EvtMember, GrpID, GrpName)

	//returns option and event ID from 'EventsMembers' table
	query := `
			SELECT DISTINCT eventID, option FROM EventsParticipants WHERE groupID = ? AND participant= ?
		`
	rows, err := repo.db.Query(query, GrpID, EvtMember)
	if err != nil {
		fmt.Println("error querying pending evt option and evt ID for one group", err)
		return "", eSlice
	}

	defer rows.Close()

	//========

	// Create a map to track unique event IDs
	// uniqueEventIDs := make(map[int]bool)

	for rows.Next() {
		var oneEv OneEvent // Initialize oneEv here, inside the loop

		err := rows.Scan(&oneEv.ID, &oneEv.EvtOption)
		if err != nil {
			fmt.Println("GetOneGroupEvents scan Error", err, oneEv)
			return "", eSlice
		}

		err4 := repo.db.QueryRow("SELECT organizer, title, description, day_time from Events where eventID = ?", oneEv.ID).Scan(&oneEv.EvtCreator, &oneEv.EvtName, &oneEv.EvtDescr, &oneEv.EvtDateTime)
		if err4 != nil {
			fmt.Println("error querying event details: ", err4)
		}

		fmt.Println("One event data: ", oneEv)

		oneEv.EvtMember = EvtMember
		oneEv.GrpName = GrpName
		oneEv.GrpID = GrpID
		oneEv.Type = "sendGpEvents"
		eSlice = append(eSlice, oneEv)

		fmt.Println("Slice of events for one group", eSlice)
		oneEv = OneEvent{}

	}

	err = rows.Err()
	if err != nil {
		return "", eSlice
	}

	eCount = strconv.Itoa(len(eSlice))

	return eCount, eSlice
}
