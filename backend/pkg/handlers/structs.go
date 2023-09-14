package handlers

import (
	"time"

	"github.com/gorilla/websocket"
)

type User struct {
	id         int
	FirstName  string `json:"firstName"`
	LastName   string `json:"lastName"`
	NickName   string `json:"username"`
	Age        string `json:"age"`
	Gender     string `json:"gender"`
	Email      string `json:"email"`
	Password   string `json:"passWord"`
	Avatar     string `json:"avatar"`
	Image      string `json:"image"`
	AboutMe    string `json:"aboutMe"`
	ProfVisib  string `json:"profVisib"`
	Created_At string `json:"created_at"`
	LoggedIn   string `json:"loggedIn"`
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

type ProfileVisibilityData struct {
	NickName  string `json:"username"`
	ProfVisib string `json:"profVisib"`
}

type AllUsersData struct {
	ID         int    `json:"id"`
	NickName   string `json:"username"`
	Avatar     string `json:"avatar"`
	Image      string `json:"image"`
	ProfVisib  string `json:"profVisib"`
	AboutMe    string `json:"aboutMe"`
	LoggedIn   string `json:"loggedIn"`
	Influencer int    `json:"influencer"`
}

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
	Category   []string  `json:"category"`
	ImageFile  string    `json:"file"`
	ImageURL   string    `json:"url"`
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

//	type Profile struct {
//		FirstName string `json:"FirstName"`
//		LastName  string `json:"LastName"`
//		Username string `json:"Username"`
//		Avatar	string `json:"Avatar"`
//	}

type BroadcastMessage struct {
	WebMessage WebsocketMessage
	//clients who will recieve the message
	Connections map[*websocket.Conn]string
}
type WebsocketMessage struct {
	Cookie string `json:"cookie"`

	Presences Presences `json:"presences"`

	Chat Chat `json:"chat"`

	Conversation Conversation `json:"conversation"`

	UploadFollow UploadFollow `json:"uploadFollow"`

	Type string `json:"type"`
}

type Presences struct {
	//logged in users nicknames
	Clients           [][]string `json:"clients"`
	LoggedIn          []string   `json:"loggedIn"`
	NotificationCount []int      `json:"notifCount"`
}

type Conversation struct {
	Chats []Chat `json:"chats"`
	//chat sender username
	Participant1 string `json:"username"`
	//chat reciever username
	Participant2   string `json:"reciever"`
	ConversationId string `json:"converstionID"`
}

type Chat struct {
	Message string `json:"message"`
	//chat sender username
	Sender string `json:"username"`
	//chat reciever username
	Reciever       string `json:"reciever"`
	Date           string `json:"date"`
	ChatId         string `json:"chatID"`
	ConversationId string `json:"convoID"`
	Status         string `json:"status"`
}

type Follow struct {
	Type            string `json:"type"`
	FollowerEmail   string `json:"followerEmail"`
	InfliuencerUN   string `json:"influencerUN"`
	InfluencerID    int    `json:"influencerID"`
	InfluencerVisib string `json:"influencerVisib"`
	UnFollow        string `json:"unfollow"`
}

type UploadFollow struct {
	FollowerId    int    `json:"followerID"`
	FollowerUN    string `json:"followerUN"`
	InfluencerId  int    `json:"influencerID"`
	InfluencerUN  string `json:"influencerUN"`
	InfluencerVis string `json:"influencerVisib"`
	Accept        string `json:"accept"`
	UFollow       string `json:"unfollow"`
	NotifMsg      string `json:"notifMsg"`
}
