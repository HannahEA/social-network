package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gorilla/websocket"
)

// To group all backend handlers
type AllHandlersMethods interface {
	// IsEmailTaken(email string) bool
	HandleRegistration(w http.ResponseWriter, r *http.Request)
	// checkEmailHandler(w http.ResponseWriter, r *http.Request)
	HandleLogin(w http.ResponseWriter, r *http.Request)
	HandleLogout(w http.ResponseWriter, r *http.Request)
	HandleSession(w http.ResponseWriter, r *http.Request)
	PostHandler(w http.ResponseWriter, r *http.Request)
	CheckCookieHandler(w http.ResponseWriter, r *http.Request)
	DeleteCookie(w http.ResponseWriter, r *http.Request)
	HandleConnections(w http.ResponseWriter, r *http.Request)
	ConversationHandler(w http.ResponseWriter, r *http.Request)
	HandleChangeProfileVisibility(w http.ResponseWriter, r *http.Request)
	HandleGetAllUsers(w http.ResponseWriter, r *http.Request)
}

// A wrapper for 'AllDbMethods' that groups all database methods.
type AllDbMethodsWrapper struct {
	repo AllDbMethods
}

// Receives a group of database methods (= AllDbMethods) and returns a new database methods wrapper
func NewService(repo AllDbMethods) AllHandlersMethods {
	return &AllDbMethodsWrapper{repo}
}

type AllDbMethods interface {
	//registration
	IsEmailNicknameTaken(email string, nickname string) bool
	RegisterUser(data RegistrationData) (int, error)
	//login
	ValidateLogin(email, password string) (bool, error)
	GetUserEmail(userId string) (string, error)
	AddSession(w http.ResponseWriter, sessionName string, user *User)
	InsertFollowRequest(uploadFollowRequest UploadFollow) (int, error)
	GetPendingFollowRequests(nickname string) (int, []FollowNotifOffline)
	InsertFollowReply(followData FollowReply) error
	InsertSession(u *User, session *http.Cookie) *Session
	IsUserAuthenticated(w http.ResponseWriter, u *User) error
	//logout
	DeleteSession(w http.ResponseWriter, cookieValue string) error
	GetUserByCookie(cookieValue string) *User
	NewUser() *User
	FindByUserID(UID int64) *User
	PopulateTheSessionsDB(userID int, cookieName, cookieValue string) error
	AddLoggedInFlag(userID int, flag string) error
	ReturnId(email string) (int, error)
	GetUserByEmail(email string) (User, error)
	GetUserByNickName(nickName string) (User, error) 
	FindByUsername(name string) *User
	DeleteCookieDB(cookieValue string) (int64, error)
	//post database queries
	AddPostToDB(data Post) (int,error)
	AddPostViewersToDB(data Post, id int) error 
	GetPublicPosts(user *User) ([]Post, error)
	UploadVisibilityValue(data ProfileVisibilityData) (string, error)
	GetUsersData(email string) ([]AllUsersData, error)
	GetAlmostPrivatePosts(user *User) ([]Post, error)
	GetPrivatePosts(user *User) ([]Post, error)
	GetFollowing(username string) ([]any, error)
	GetFollowers(username string) ([]any, error)
	//comment database queries
	AddCommentToDB(data Post) error
	GetComments(data Post) ([]Comment, error)
	getAvatar(email string) (string, error)
	checkCookieDB(cookieValue string) int
	BroadcastToChannel(msg BroadcastMessage)
	FindConversation(convo Chat) Conversation
	NewPrivateChatToDB(convo Chat)
	GetChatHistory(convo Conversation) []Chat
	AddChatToDatabase(chat Chat)
	AddChatNotification(chat Chat, count int)
	CheckForNotification(chat Chat) (bool, int, error)
	DeleteChatNotifDB(chat Chat) (int64, error)
	FullChatUserList(user *User) Presences
	ClientsFollowingUser(user *User) map[*websocket.Conn]string
	IsClientOnline(rows *sql.Rows, user *User) [][]string
	GetAllUserPosts(user *User) ([]Post, error)
	//Groups
	InsertNewGroup(g NewGroup) (int, error)
	InsertNewEvent(e NewEventNotif) (int, error)
	InsertGrpMember(newGp NewGroup, i int, status string) error
	InsertEvtMember(newEv NewEventNotif, i int, status string) error
	InsertGrpInvite(gpInv NewGroupNotif, status string) error 
	InsertJoinRequest(joinReq OneJoinGroupRequest, status string) error
	CheckUserOnline(grpName string, grpDescr string, grpID int, user string, creator string) (NewGroupNotif, error)
	CheckEvParticipantOnline(EvtName string, EvtDescr string, ID int, gMember string, EvtCreator string) (NewEventNotif, error) 
	GetPendingGroupInvites(member string) (int, []NewGroupNotif)
	GetPendingEventInvites(member string) (string, []NewEventNotif)
	InsertGroupMemberReply(joinGrpReply JoinGroupReply) error
	GetExistingGroups() (string, []NewGroup)
	GetPendingJoinGroupRequests(creator string) (string, []OneOfflineJoinGroupRequest)
	getUserAvatar(nkName string) (NewGroupNotif, error)
	GetGroupComments(post Post) ([]Comment, error) 
	GetGroupPosts(id int) ([]Post, error) 
	AddGroupPostToDB(post Post) (error) 
	AddGroupCommentToDB(post Post) error 
}

// The dabataseStruct
type dbStruct struct {
	db          *sql.DB
	broadcaster chan BroadcastMessage
}

// To instantiate a new database struct
func NewDbStruct(db *sql.DB, broadcaster chan BroadcastMessage) AllDbMethods {
	return &dbStruct{db, broadcaster}
}
