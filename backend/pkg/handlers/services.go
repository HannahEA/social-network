package handlers

import (
	"database/sql"
	"net/http"
)

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
type movieService struct {
	repo MovieRepository
}
//HS: I think it should look like this:
// func NewService(repo MovieRepository) *movieService {
// 	return &movieService{repo}
// }

func NewService(repo MovieRepository) MovieService {
	return &movieService{repo}
}

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
type movieRepository struct {
	db *sql.DB
	
}

func NewRepository(db *sql.DB) MovieRepository {
	return &movieRepository{db}
}
