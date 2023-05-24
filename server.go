package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"social-network/backend/pkg/db/database"
	"strings"
	"text/template"
	"time"
	"unicode/utf8"

	_ "github.com/mattn/go-sqlite3"
	uuid "github.com/satori/go.uuid"
	"golang.org/x/crypto/bcrypt"
)

// ===============> Structs : if moved to handlers/structs.go will throw error: 'struct has no field or method..'<===============================
type RegistrationData struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginData struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

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

type Post struct {
	Title      string `json:"title"`
	Content    string `json:"content"`
	Visibility string `json:"visibility"`
	PostType   string `json:"type"`
}

//==================> End of Structs <==============================

var db *sql.DB

// ====================> Start of Register 1 <=============================

func main() {
	database.CreateDatabase()
	db = database.Database
	defer database.Database.Close()

	http.HandleFunc("/", reactHandler)
	http.HandleFunc("/register", handleRegistration)
	http.HandleFunc("/login", handleLogin)
	http.HandleFunc("/post", postHandler)
	http.HandleFunc("/logout", Logout)
	// http.HandleFunc("/feed", handleFeed) // Add the /feed route

	fmt.Println("Server started on http://localhost:8000")
	log.Fatal(http.ListenAndServe(":8000", nil))
}

func reactHandler(w http.ResponseWriter, r *http.Request) {
	http.FileServer(http.Dir("build")).ServeHTTP(w, r)
}

func handleRegistration(w http.ResponseWriter, r *http.Request) {
	// Parse the request body into a RegistrationData struct
	var data RegistrationData
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		fmt.Println("handleRegistratio: jsonDecoder failed")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	fmt.Println("Registration Data recieved: ", data)
	// Check if the email already exists
	if IsEmailTaken(data.Email) {
		response := map[string]string{"message": "Email already taken"}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(response)
		return
	}

	// Register the user
	err = RegisterUser(data.Email, data.Password)
	if err != nil {
		log.Println(err)
		http.Error(w, "Failed to register user", http.StatusInternalServerError)
		return
	}

	// Send a response back to the client
	response := map[string]string{"message": "Registration successful"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

//==================> End of Register 1 <============================

// ====================> Register 2 <=======================
func IsEmailTaken(email string) bool {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM Users WHERE email = ?", email).Scan(&count)
	if err != nil {
		fmt.Println("IsEmailTaken: Failed to access user database")
		log.Println(err)
		return false
	}
	return count > 0
}

func RegisterUser(email, password string) error {
	if IsEmailTaken(email) {
		return fmt.Errorf("email already taken")
	}
	//turn the password into a hash to be stored into the db
	var hash []byte
	hash, err1 := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err1 != nil {
		fmt.Println("bcrypt err1:", err1)
	}

	fmt.Println("hash: ", hash)

	//_, err := db.Exec("INSERT INTO Users (email, password) VALUES (?, ?)", email, password)
	_, err := db.Exec("INSERT INTO Users (email, password) VALUES (?, ?)", email, hash)
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to register user")
	}

	return nil
}

//====> End of Register 2 <============================

//==================> Start of Login <=========================

var oneUser int

func handleLogin(w http.ResponseWriter, r *http.Request) {
	// Parse the request body into a LoginData struct
	var data LoginData
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validate the login credentials
	valid, err := ValidateLogin(data.Email, data.Password)
	if err != nil {
		log.Println(err)
		http.Error(w, "Failed to process login", http.StatusInternalServerError)
		return
	}

	// Send a response back to the client based on validation result
	if valid {

		//------> Start of making a sessionToken to be used as session cookie <---------------
		sessionToken := uuid.NewV4().String()
		expiresAt := time.Now().Add(120 * time.Minute)
		cookieNm := "user_session"

		// Set the browser cookie for "session_token = 'user_session' " as the session token we just generated
		// we also set an expiry time of 120 minutes
		http.SetCookie(w, &http.Cookie{
			Name:    cookieNm,
			Value:   sessionToken,
			MaxAge:  7200,
			Expires: expiresAt,
			// SameSite: true,
			// HttpOnly: true, //commented out in order to allow Javascript to access cookie
		})

		// storing the cookie values in struct
		user_session := Cookie{Name: cookieNm, Value: sessionToken, Expires: expiresAt}
		fmt.Println("Values in 'Cookie' struct :", user_session)

		//------>End of making a sessionToken to be used as session cookie <---------------

		//-----------> Start: Retrieve user id from db and populate User.id struct field <-----------

		theID := "SELECT id FROM Users WHERE email = ?"
		rowCurrentUser := db.QueryRow(theID, data.Email)
		//Writing user id into User.id struct field
		err3 := rowCurrentUser.Scan(&oneUser)
		if err3 != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("ERROR"))
			fmt.Println("error with currentUser", err3)
			// fmt.Println("error accessing DB")
			return
		}
		//populate the Sessions database table
		insertsessStmt, err4 := db.Prepare(`INSERT INTO Sessions (userID, cookieName, cookieValue) VALUES (?, ?, ?)`)
		if err4 != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Println("err4 with inserting session:", err4)
			return
		}

		defer insertsessStmt.Close()
		insertsessStmt.Exec(oneUser, user_session.Name, user_session.Value)
		fmt.Println("PASSWORD IS CORRECT")
		fmt.Println("User successfully logged in")

		response := map[string]interface{}{
			"message": "Login successful",
			"email":   data.Email,
		}
		w.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(w).Encode(response)
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
			return
		}
	} else {
		response := map[string]string{"message": "Invalid credentials"}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		err := json.NewEncoder(w).Encode(response)
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
			return
		}
	}
}

//-----------> End: Retrieve user id from db and populate User.id struct field <-----------

func ValidateLogin(email, password string) (bool, error) {
	//------> code replaced to compare password hashes instead of just passwords <--------------
	/*var count int
	err := db.QueryRow("SELECT COUNT(*) FROM Users WHERE email = ? AND password = ?", email, password).Scan(&count)
	if err != nil {
		log.Println(err)
		return false, fmt.Errorf("failed to validate login")
	}
	return count > 0, nil*/

	var count int

	// retrieve passwordhash from db.  Turn user supplied password into a hash
	//and compare both hashes to see if they match
	var hash []byte

	//err := db.QueryRow("SELECT COUNT(*) FROM Users WHERE email = ? AND password = ?", email, password).Scan(&count)
	err := db.QueryRow("SELECT password FROM Users WHERE email = ?", email).Scan(&hash)
	if err != nil {
		log.Println(err)
		return false, fmt.Errorf("failed to validate login")
	}

	// compare the hash value of user supplied pw with hash stored in db
	comparePass := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))

	fmt.Println("output of compare 'passwordhash' with user's pw: ", comparePass)
	fmt.Println("'passwordhash' and 'hash': ", []byte(password), []byte(hash))

	//comparePass returns nil on success
	if comparePass != nil {
		fmt.Println("Please enter correct password")
		log.Println(err)
		count = -1
	}
	if comparePass == nil {
		fmt.Println("User logged in")
		count = 1
	}

	return count > 0, nil

}

//===================> End of Login <============================
// each session contains the username of the user and the time at which it expires

//====================> Start of Session <=======================

// NewSession ...
func NewSession() *Session {
	return &Session{}
}

//======> Functions: 'AddSession' and 'InsertSession' are not needed as browser and Session tables get cookie in 'Login' <======

// Add session cookie to browser
/*func AddSession(w http.ResponseWriter, sessionName string, user *User) {
	sessionToken := uuid.NewV4().String()
	expiresAt := time.Now().Add(120 * time.Minute)
	cookieSession := &http.Cookie{
		Name:    sessionName,
		Value:   sessionToken,
		Expires: expiresAt,
	}
	http.SetCookie(w, cookieSession)
	if sessionName != "guest" {
		InsertSession(user, cookieSession)
	}
}

// Insert session to database
func InsertSession(u *User, session *Cookie) *Session {
	cookie := NewSession()
	stmnt, err := db.Prepare("INSERT OR IGNORE INTO Sessions (userID, cookieName, cookieValue) VALUES (?, ?, ?)")
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
}*/

// IsUserAuthenticated ...
func IsUserAuthenticated(w http.ResponseWriter, u *User) error {
	var cookieValue string
	//if user is not found in "sessions" db table return err = nil
	if err := db.QueryRow("SELECT cookieValue FROM Sessions WHERE userID = ?", u.id).Scan(&cookieValue); err != nil {
		fmt.Println("The cookie value", cookieValue)
		// w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("checking sessions table err:     ", err)
		return nil
	}
	if err := DeleteSession(w, cookieValue); err != nil {
		// w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("Error from inside delete sessions: ", err)
		return err
	}
	return nil
}

// User's cookie expires when browser is closed, delete the cookie from the database.
func DeleteSession(w http.ResponseWriter, cookieValue string) error {
	fmt.Println("-----> DeleteSession called")
	var cookieName string
	//if cookieName is not found in 'Sessions' db table return err = nil
	if err := db.QueryRow("SELECT cookieName FROM Sessions WHERE cookieValue = ?", cookieValue).Scan(&cookieName); err != nil {
		fmt.Println("there was an error selecting ", cookieValue)
		fmt.Println("the error: ",err.Error())
		return nil
	}
	//removing cookie from browser
	cookie := &http.Cookie{
		Name:   cookieName,
		Value:  "",
		MaxAge: -1,
		//HttpOnly: true,
	}

	fmt.Println("the cookie after changing its values -->", cookie)
	//to delete the cookie in the browser
	http.SetCookie(w, cookie)
	//to remove session record from 'Sessions' table
	stmt, err := db.Prepare("DELETE FROM Sessions WHERE cookieValue=?;")
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
func GetUserByCookie(cookieValue string) *User {
	var userID int64

	if err := db.QueryRow("SELECT userID from Sessions WHERE cookieValue = ?", cookieValue).Scan(&userID); err != nil {
		fmt.Println("cookieValue===", cookieValue)
		return nil
	}
	u := FindByUserID(userID)
	return u
}

// function for new user
func NewUser() *User {
	return &User{}
}

// Find the user by their ID
func FindByUserID(UID int64) *User {
	u := NewUser()
	if err := db.QueryRow("firstName, lastName, nickName, age, gender, email, password, Avatar, Image, aboutMe FROM Users WHERE userID = ?", UID).
		Scan(&u.FirstName, &u.LastName, &u.NickName, &u.Age, &u.Gender, &u.Email, &u.Password, &u.Avatar, &u.Image, &u.AboutMe); err != nil {
		fmt.Println("error FindByUserID: ", err)
		return nil
	}

	return u
}

// logout handle
// func Logout(w http.ResponseWriter, r *http.Request, hub *Hub) {
func Logout(w http.ResponseWriter, r *http.Request) {
	var cooky Cookie

	if r.URL.Path == "/logout" {

		cookieVal, err := io.ReadAll(r.Body)
		fmt.Println("cookieVal before unmarshalled", cookieVal)
		if err != nil {
			log.Fatal(err)
		}
		cookieStringBefore := string(cookieVal[:])
		//separate cookie name from cookie value
		cValue := strings.Split(cookieStringBefore, ":")
		//get cookie value
		cookieStringAfter := (cValue[1])
		//count the number of runes in coookieStringAfter
		//so that you drop the final '}'
		numRunes := utf8.RuneCountInString(cookieStringAfter)
		fmt.Println("the number of runes in cookie: ", numRunes)
		cookieStringByte := []byte(cookieStringAfter)
		//to remove the curly bracket at end of cookie value
		cookieStringAfter = string(cookieStringByte[0 : numRunes-1])
		fmt.Println("the correct cookie: --->", cookieStringAfter)
		//populate the Cookie struct field 'Value' with cookie value
		json.Unmarshal([]byte(cookieStringAfter), &cooky.Value)

		fmt.Println("cookie value before unmarshal: ", cookieStringBefore)
		fmt.Println("cookie value after unmarshal: ", string(cookieStringAfter))
		//delete corresponding row in 'Sessions' table
		//and delete cookie in browser
		//userName := GetUserByCookie(string(cooky.Value))
		//fmt.Print("the user", userName.id)
		DeleteSession(w, string(cooky.Value))

	}
}

//====================> End of Session <=========================

func getUserEmail(userID string) (string, error) {
	var email string
	err := db.QueryRow("SELECT email FROM Users WHERE id = ?", userID).Scan(&email)
	if err != nil {
		return "", err
	}
	return email, nil
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	tmpl := template.Must(template.ParseFiles("build/index.html"))
	tmpl.Execute(w, nil)
}

func checkEmailHandler(w http.ResponseWriter, r *http.Request) {
	email := r.URL.Query().Get("email")

	if IsEmailTaken(email) {
		w.WriteHeader(http.StatusConflict)
		fmt.Fprint(w, "Email already taken")
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "Email available")
}

func postHandler(w http.ResponseWriter, r *http.Request) {
	var data Post
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		fmt.Println("postHandler: jsonDecoder failed")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	fmt.Println("Post Data recieved: ", data)

	if data.PostType == "newPost" {
		err := addPostToDB(data)
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to add new post", http.StatusInternalServerError)
			return
		}
	}

}

func addPostToDB(post Post) error {
	//create post ID
	postID := uuid.NewV4()
	_, err := db.Exec("INSERT INTO Posts (postID, title, content, postVisibility) VALUES (?, ?, ?, ?)", postID, post.Title, post.Content, post.Visibility)
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to add Post to Database")
	}
	return nil
}
