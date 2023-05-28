package handlers

import (
	"time"
)

type User struct {
	id        int
	FirstName string   `json:"FirstName"`
	LastName  string   `json:"LastName"`
	NickName  string   `json:"NickName"`
	Age       string   `json:"Age"`
	Gender    string   `json:"Gender"`
	Email     string   `json:"email"`
	Password  string   `json:"passWord"`
	Avatar    []string `json:"Avatar"`
	Image     []string `json:"Image"`
	AboutMe   []string `json:"AboutMe"`
}

// each session contains the username of the user and the time at which it expires
type Session struct {
	UserID      int
	sessionName string
	sessionUUID string
}

type Cookie struct {
	Name    string
	Value   string
	Expires time.Time
}

type RegistrationData struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginData struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Post struct {
	Title      string `json:"title"`
	Content    string `json:"content"`
	Visibility string `json:"visibility"`
	PostType   string `json:"type"`
}

// type Profile struct {
// 	FirstName string `json:"FirstName"`
// 	LastName  string `json:"LastName"`
// 	Username string `json:"Username"`
// 	Avatar	string `json:"Avatar"`
// }