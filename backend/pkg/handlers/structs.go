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
	ID         int      `json:"id"`
	NickName   string   `json:"username"`
	Avatar     string   `json:"avatar"`
	Image      string   `json:"image"`
	ProfVisib  string   `json:"profVisib"`
	AboutMe    string   `json:"aboutMe"`
	LoggedIn   string   `json:"loggedIn"`
	Influencer int      `json:"influencer"`
	FirstName  string   `json:"firstName"`
	LastName   string   `json:"lastName"`
	Age        string   `json:"age"`
	Gender     string   `json:"gender"`
	Email      string   `json:"email"`
	Followers  []any `json:"followers"`
	Following  []any `json:"following"`
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
	Page       string    `json:"page"`
	Comments   []Comment `json:"comments"`
	Viewers    []string  `json:"postViewers"`
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

	FollowNotif FollowNotif `json:"followNotif"`

	OfflineFollowNotif OfflineFollowNotif `json:"offlineFollowNotif"`

	FollowReply FollowReply `json:"followReply"`

	NewGroupNotif NewGroupNotif `json:"newGroupNotif"`

	OfflineGroupInvites OfflineGroupInvites `json:"offlineGroupInvites"`

	JoinGroupReply JoinGroupReply `json:"joinGroupReply"`

	SendAllGroups SendAllGroups `json:"sendAllGroups"`

	Type string `json:"type"`
}

type Presences struct {
	//logged in users nicknames
	Clients  [][]string `json:"clients"`
	LoggedIn []string   `json:"loggedIn"`
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
	FollowAction    string `json:"fAction"`
	InfluLogged     string `json:"influLogged"`
}

type UploadFollow struct {
	FollowerId    int    `json:"followerID"`
	FollowerUN    string `json:"followerUN"`
	InfluencerId  int    `json:"influencerID"`
	InfluencerUN  string `json:"influencerUN"`
	InfluencerVis string `json:"influencerVisib"`
	Accept        string `json:"accept"`
	FollowAction  string `json:"fAction"`
	NotifMsg      string `json:"notifMsg"`
}

// follow request notification sent to online private influencer
type FollowNotif struct {
	FollowID string `json:"followID"`
	NotifMsg string `json:"notifMsg"`
	Type     string `json:"type"`
}

// single instance of f.r.n. sent to offline private influencer
type FollowNotifOffline struct {
	FollowID      string `json:"followID"`
	FollowerUN    string `json:"followerUN"`
	InfluencerUN  string `json:"influencerUN"`
	FollowerURL   string `json:"followerURL"`
	FollowerImage string `json:"followerImage"`
}

// all follow request notifications (f.r.n.) sent to offline private influencer
type OfflineFollowNotif struct {
	PendingFollows   []FollowNotifOffline `json:"pendingFollows"`
	NumFollowPending string               `json:"numFollowPending"`
}

// all group invites notifications sent to offline user
type OfflineGroupInvites struct {
	PendingGroupInvites []NewGroupNotif `json:"pendingGroupInvites"`
	NumGrpsPending      string          `json:"numGrpsPending"`
}

// follow notification reply by private influencer
type FollowReply struct {
	FollowID    string `json:"followID"`
	FollowReply string `json:"followReply"`
	Type        string `json:"type"`
}

// new group information
type NewGroup struct {
	ID        int      `json:"id"`
	Creator   string   `json:"creator"`
	GpMembers []string `json:"gpMembers"`
	GrpDescr  string   `json:"grpDescr"`
	GrpName   string   `json:"grpName"`
	Type      string   `json:"type"`
}

// group invite for online members
type NewGroupNotif struct {
	GrpName       string `json:"grpName"`
	GrpDescr      string `json:"grpDescr"`
	GrpID         int    `json:"grpID"`
	Creator       string `json:"creator"`
	Member        string `json:"member"`
	CreatorURL    string `json:"creatorURL"`
	CreatorImage  string `json:"creatorImage"`
	CreatorLogged string `json:"creatorLogged"`
	MemberLogged  string `json:"memberLogged"`
	MemberStatus  string `json:"memberStatus"`
	Type          string `json:"type"`
}

// follow notification reply by private influencer
type JoinGroupReply struct {
	GroupID        string `json:"grpID"`
	Member         string `json:"groupMember"`
	JoinGroupReply string `json:"joinReply"`
	Type           string `json:"type"`
}

// f.e. request to send list of existing groups
type RequestAllGroups struct {
	UsrEmail string `json:"usrEmail"`
	Type     string `json:"type"`
}

type SendAllGroups struct {
	Requestor     string     `json:"requestor"`
	NbGroups      string     `json:"nbGroups"`
	SliceOfGroups []NewGroup `json:"sliceOfGroups"`
	Type          string     `json:"type"`
}
