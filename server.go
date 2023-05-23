package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"social-network/backend/pkg/db/database"
	"text/template"
	"time"

	_ "github.com/mattn/go-sqlite3"
	uuid "github.com/satori/go.uuid"
	"golang.org/x/crypto/bcrypt"
)

//===============> Structs <===============================
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

//==================> End of Structs <==============================

var db *sql.DB

//====================> Start of Register 1 <=============================

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

//====================> Register 2 <=======================

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

var oneUser User

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
		user_session := Cookie{cookieNm, sessionToken, expiresAt}
		fmt.Println("Values in 'Cookie' struct :", user_session)

		//------>End of making a sessionToken to be used as session cookie <---------------

		//-----------> Start: Retrieve user id from db and populate User.id struct field <-----------

		theID := "SELECT id FROM Users WHERE email = ?"
		rowCurrentUser := db.QueryRow(theID, data.Email)
		//Writing user id into User.id struct field
		err3 := rowCurrentUser.Scan(&oneUser.id)
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
		insertsessStmt.Exec(oneUser.id, user_session.Name, user_session.Value)
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


//====================> Start of Session <===========================




//====================> End of Session <===========================


func getUserEmail(userID string) (string, error) {
	var email string
	err := db.QueryRow("SELECT email FROM Users WHERE id = ?", userID).Scan(&email)
	if err != nil {
		return "", err
	}
	return email, nil
}
func main() {
	database.CreateDatabase()
	db = database.Database
	defer database.Database.Close()

	http.HandleFunc("/", reactHandler)
	http.HandleFunc("/register", handleRegistration)
	http.HandleFunc("/login", handleLogin)
	// http.HandleFunc("/feed", handleFeed) // Add the /feed route

	fmt.Println("Server started on http://localhost:8000")
	log.Fatal(http.ListenAndServe(":8000", nil))
}

//Included into Register Handler
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


func reactHandler(w http.ResponseWriter, r *http.Request) {
	http.FileServer(http.Dir("build")).ServeHTTP(w, r)
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
