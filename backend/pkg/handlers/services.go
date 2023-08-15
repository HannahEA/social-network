package handlers

import (
	"database/sql"
	"net/http"
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
	InsertSession(u *User, session *http.Cookie) *Session
	IsUserAuthenticated(w http.ResponseWriter, u *User) error
	//logout
	DeleteSession(w http.ResponseWriter, cookieValue string) error
	GetUserByCookie(cookieValue string) *User
	NewUser() *User
	FindByUserID(UID int64) *User
	PopulateTheSessionsDB(userID int, cookieName, cookieValue string) error
	ReturnId(email string) (int, error)
	DeleteCookieDB(cookieValue string) (int64, error)
	//post database queries
	AddPostToDB(data Post) error
	GetPublicPosts() ([]Post, error)
	UploadVisibilityValue(data ProfileVisibilityData) (string, error)
	//comment database queries
	AddCommentToDB(data Post) error
	GetComments(data Post) ([]Comment, error)
	getAvatar(email string) (string, error)
	checkCookieDB(cookieValue string) int
	BroadcastToChannel(msg BroadcastMessage)
	FindConversation(convo Conversation) Conversation
	NewPrivateChatToDB(convo Conversation) Conversation
	AddChatToDatabase(chat Chat)
	AddChatNotification(chat Chat, count int)
	CheckForNotification(chat Chat) (bool, int, error)
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
