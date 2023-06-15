package handlers

import (
	"time"
)

type User struct {
	id        int
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	NickName  string `json:"username"`
	Age       string `json:"age"`
	Gender    string `json:"gender"`
	Email     string `json:"email"`
	Password  string `json:"passWord"`
	Avatar    string `json:"avatar"`
	Image     []byte `json:"image"`
	AboutMe   string `json:"aboutMe"`
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

//	type RegistrationData struct {
//		Email    string `json:"email"`
//		Password string `json:"password"`
//	}
type RegistrationData struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	NickName  string `json:"username"`
	Age       string `json:"age"`
	Gender    string `json:"gender"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	ConfPwd   string `json:"confirPwd"`
	Avatar    string `json:"avatar"`
	Image     string `json:"image"`
	AboutMe   string `json:"aboutMe"`
}

type LoginData struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Post struct {
	PostID     int       `json:"postId"`
	Author     string    `json:"author"`
	Title      string    `json:"title"`
	Content    string    `json:"content"`
	Category   string    `json:"category"`
	Date       string    `json:"date"`
	Visibility string    `json:"visibility"`
	Cookie     string    `json:"cookie"`
	PostType   string    `json:"type"`
	Comments   []Comment `json:"comments"`
}

type Comment struct {
	CommentID int    `json:"commentId"`
	PostID    int    `json:"postId"`
	AuthorID  int    `json:"authorId"`
	Author    string `json:"author"`
	Content   string `json:"content"`
	Date      string `string:"date"`
}

// type Profile struct {
// 	FirstName string `json:"FirstName"`
// 	LastName  string `json:"LastName"`
// 	Username string `json:"Username"`
// 	Avatar	string `json:"Avatar"`
// }
