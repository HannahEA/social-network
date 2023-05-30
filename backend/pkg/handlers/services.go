package handlers

import (
	"database/sql"
	"net/http"
)
// To group all backend handlers
type MovieService interface {
	// IsEmailTaken(email string) bool
	HandleRegistration(w http.ResponseWriter, r *http.Request)
	checkEmailHandler(w http.ResponseWriter, r *http.Request)
	HandleLogin(w http.ResponseWriter, r *http.Request)
	HandleLogout(w http.ResponseWriter, r *http.Request)
	HandleSession(w http.ResponseWriter, r *http.Request)
	PostHandler(w http.ResponseWriter, r *http.Request)
	// checkCookieHandler(w http.ResponseWriter, r *http.Request)
}
// A wrapper for 'MovieRepository' that groups all database methods.
type movieService struct {
	repo MovieRepository
}


//Receive a group of database methods (= MovieRepository) and returns a new database methods wrapper
func NewService(repo MovieRepository) MovieService {
	return &movieService{repo}
}

// To group database methods
type MovieRepository interface {
	IsEmailTaken(email string) bool
	RegisterUser(email, password string) error
	ValidateLogin(email, password string) (bool, error)
	GetUserEmail(userId string) (string, error)
	AddSession(w http.ResponseWriter, sessionName string, user *User)
	InsertSession(u *User, session *http.Cookie) *Session
	IsUserAuthenticated(w http.ResponseWriter, u *User) error
	DeleteSession(w http.ResponseWriter, cookieValue string) error
	GetUserByCookie(cookieValue string) *User
	NewUser() *User
	FindByUserID(UID int64) *User
	PopulateTheSessionsDB(userID int, cookieName, cookieValue string) error
	ReturnId(email string) (int, error)
	//post database queries
	AddPostToDB(data Post) error
}
//The dabataseStruct
type movieRepository struct {
	db *sql.DB
	
}

//To instantiate a new database struct
func NewRepository(db *sql.DB) MovieRepository {
	return &movieRepository{db}
}
