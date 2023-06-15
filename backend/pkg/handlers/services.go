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
	// checkCookieHandler(w http.ResponseWriter, r *http.Request)
}
// A wrapper for 'AllDbMethods' that groups all database methods.
type AllDbMethodsWrapper struct {
	repo AllDbMethods
}


//Receives a group of database methods (= AllDbMethods) and returns a new database methods wrapper
func NewService(repo AllDbMethods) AllHandlersMethods {
	return &AllDbMethodsWrapper{repo}
}

type AllDbMethods interface {
	//registration
	IsEmailNicknameTaken(email string, nickname string) bool
	RegisterUser(data RegistrationData) error
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
	//post database queries
	AddPostToDB(data Post) error
	GetPublicPosts() ([]Post,error)
	//comment database queries
	AddCommentToDB(data Post) error
	GetComments(data Post) ([]Comment,error)
	getAvatar(email string)(string, error)
}
//The dabataseStruct
type dbStruct struct {
	db *sql.DB
	
}

//To instantiate a new database struct
func NewDbStruct(db *sql.DB) AllDbMethods {
	return &dbStruct{db}
}

