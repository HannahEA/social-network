package pkg

type User struct {
	ID        string `json:"id,omitempty"`
	Nickname  string `json:"nickname,omitempty"`
	Nickname2 string `json:"nickname2,omitempty"`
	Age       string `json:"age,omitempty"`
	Gender    string `json:"gender,omitempty"`
	FirstName string `json:"firstname,omitempty"`
	LastName  string `json:"lastname,omitempty"`
	Email     string `json:"email,omitempty"`
	Password  string `json:"password,omitempty"`
	LoggedIn  bool   `json:"loggedin,omitempty"`
}
type Post struct {
	PostID     string    `json:"post_id,omitempty"`
	Nickname   string    `json:"nickname"`
	Title      string    `json:"title,omitempty"`
	Categories string    `json:"categories,omitempty"`
	Body       string    `json:"body,omitempty"`
	Comments   []Comment `json:"comments,omitempty"`
}
type Comment struct {
	CommentID string `json:"comment_id,omitempty"`
	PostID    string `json:"post_id,omitempty"`
	Nickname  string `json:"nickname"`
	Body      string `json:"body,omitempty"`
}
type Followers struct {
	ConvoID      string `json:"convo_id"`
	Participant1 string `json:"user1"`
	Participant2 string `json:"user2"`
}

type Groups struct {
	ConvoID      string `json:"convo_id"`
	Participants []User `json:"participants"`
	Chats        []Chat `json:"chats"`
}
type Chat struct {
	ConvoID      string `json:"convo_id"`
	ChatID       string `json:"chat_id"`
	Sender       User   `json:"sender"`
	Reciever     User   `json:"reciever,omitempty"`
	Date         string `json:"date,omitempty"`
	Body         string `json:"body,omitempty"`
	Notification bool   `json:"notification,omitempty"`
}
type GroupChat struct {
	ID                string `json:"id"`
	Nickname          string `json:"nickname"`
	Online            bool   `json:"online"`
	LastContactedTime string `json:"last_contacted_time"`
	Notification      bool   `json:"notification,omitempty"`
}

type GroupEvent struct {
	Nickname string `json:"nickname,omitempty"`
	Password string `json:"password,omitempty"`
}