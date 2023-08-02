package handlers

import (
	"fmt"
	"log"
	"net/http"
	"time"

	uuid "github.com/satori/go.uuid"
)

// NewSession ...
func NewSession() *Session {
	return &Session{}
}

func (service *AllDbMethodsWrapper) HandleSession(w http.ResponseWriter, r *http.Request) {

}

// Add session cookie to browser
func (repo *dbStruct) AddSession(w http.ResponseWriter, sessionName string, user *User) {
	sessionToken := uuid.NewV4().String()
	expiresAt := time.Now().Add(120 * time.Minute)
	cookieSession := &http.Cookie{
		Name:    sessionName,
		Value:   sessionToken,
		Expires: expiresAt,
	}
	http.SetCookie(w, cookieSession)
	if sessionName != "guest" {
		repo.InsertSession(user, cookieSession)
	}
}

// Insert session to database
func (repo *dbStruct) InsertSession(u *User, session *http.Cookie) *Session {
	cookie := NewSession()
	stmnt, err := repo.db.Prepare("INSERT OR IGNORE INTO Sessions (userID, cookieName, cookieValue) VALUES (?, ?, ?)")
	if err != nil {
		log.Fatalf(err.Error())
	}
	_, err = stmnt.Exec(u.id, session.Name, session.Value)
	if err != nil {
		fmt.Println("AddSession error inserting into DB: ", err)
	}
	cookie.sessionName = session.Name
	cookie.sessionUUID = session.Value
	cookie.UserID = u.id
	return cookie
}

// IsUserAuthenticated ...
func (repo *dbStruct) IsUserAuthenticated(w http.ResponseWriter, u *User) error {
	var cookieValue string
	// if user is not found in "sessions" db table return err = nil
	if err := repo.db.QueryRow("SELECT cookieValue FROM Sessions WHERE userID = ?", u.id).Scan(&cookieValue); err != nil {
		fmt.Println("The cookie value", cookieValue)
		// w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("checking sessions table err:     ", err)
		return nil
	}
	if err := repo.DeleteSession(w, cookieValue); err != nil {
		// w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("Error from inside delete sessions: ", err)
		return err
	}
	return nil
}

// User's cookie expires when browser is closed, delete the cookie from the database.
func (repo *dbStruct) DeleteSession(w http.ResponseWriter, cookieValue string) error {
	fmt.Println("-----> DeleteSession called")
	var cookieName string
	// if cookieName is not found in 'Sessions' db table return err = nil
	if err := repo.db.QueryRow("SELECT cookieName FROM Sessions WHERE cookieValue = ?", cookieValue).Scan(&cookieName); err != nil {
		fmt.Println("there was an error selecting ", cookieValue)
		return nil
	}
	// removing cookie from browser
	cookie := &http.Cookie{
		Name:   cookieName,
		Value:  "",
		MaxAge: -1,
		// HttpOnly: true,
	}

	fmt.Println("the cookie after changing its values -->", cookie)
	// to delete the cookie in the browser
	http.SetCookie(w, cookie)
	// to remove session record from 'Sessions' table
	stmt, err := repo.db.Prepare("DELETE FROM Sessions WHERE cookieValue=?;")
	if err != nil {
		log.Fatalf(err.Error())
	}
	defer stmt.Close()
	stmt.Exec(cookieValue)
	if err != nil {
		fmt.Println("DeleteSession err: ", err)
		return err
	}
	return nil
}

// GetUserByCookie ...
func (repo *dbStruct) GetUserByCookie(cookieValue string) *User {
	var userID int64

	if err := repo.db.QueryRow("SELECT userID from Sessions WHERE cookieValue = ?", cookieValue).Scan(&userID); err != nil {
		fmt.Println("cookieValue===", cookieValue)
		return nil
	}
	u := repo.FindByUserID(userID)
	return u
}

// function for new user
func (repo *dbStruct) NewUser() *User {
	return &User{}
}

// Find the user by their ID
func (repo *dbStruct) FindByUserID(UID int64) *User {
	u := repo.NewUser()
	//changed the 'WHERE userID to id
	if err := repo.db.QueryRow("SELECT id, firstName, lastName, nickName, age, gender, email, password, avatarURL, imageFile, aboutMe, profileVisibility, created_at  FROM Users WHERE id = ?", UID).
		Scan(&u.id, &u.FirstName, &u.LastName, &u.NickName, &u.Age, &u.Gender, &u.Email, &u.Password, &u.Avatar, &u.Image, &u.AboutMe, &u.ProfVisib, &u.Created_At); err != nil {
		fmt.Println("error FindByUserID: ", err)
		return nil
	}
	return u
}
