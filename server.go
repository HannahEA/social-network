package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"text/template"

	_ "github.com/mattn/go-sqlite3"
)

type RegistrationData struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

var db *sql.DB

func handleRegistration(w http.ResponseWriter, r *http.Request) {
	// Parse the request body into a RegistrationData struct
	var data RegistrationData
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

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

func handleLogin(w http.ResponseWriter, r *http.Request) {
	// Parse the request body into a LoginData struct
	var data RegistrationData
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



func ValidateLogin(email, password string) (bool, error) {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM Users WHERE email = ? AND password = ?", email, password).Scan(&count)
	if err != nil {
		log.Println(err)
		return false, fmt.Errorf("Failed to validate login")
	}
	return count > 0, nil
}


// func handleFeed(w http.ResponseWriter, r *http.Request) {
// 	userID := r.Header.Get("UserID")
// 	email, err := getUserEmail(userID)
// 	if err != nil {
// 		log.Println(err)
// 		http.Error(w, "Failed to retrieve user email", http.StatusInternalServerError)
// 		return
// 	}

// 	response := map[string]string{"email": email}
// 	w.Header().Set("Content-Type", "application/json")
// 	err = json.NewEncoder(w).Encode(response)
// 	if err != nil {
// 		log.Println(err)
// 		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
// 		return
// 	}
// }



func getUserEmail(userID string) (string, error) {
	var email string
	err := db.QueryRow("SELECT email FROM Users WHERE id = ?", userID).Scan(&email)
	if err != nil {
		return "", err
	}
	return email, nil
}

func main() {
	createDatabase()
	defer db.Close()

	http.HandleFunc("/", reactHandler)
	http.HandleFunc("/register", handleRegistration)
	http.HandleFunc("/login", handleLogin)
	// http.HandleFunc("/feed", handleFeed) // Add the /feed route

	fmt.Println("Server started on http://localhost:8000")
	log.Fatal(http.ListenAndServe(":8000", nil))
}


func createDatabase() {
	sqliteDatabase, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		log.Fatal(err.Error())
	}

	_, err = sqliteDatabase.Exec(`
		CREATE TABLE IF NOT EXISTS Users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			email TEXT UNIQUE,
			password TEXT
		)
	`)
	if err != nil {
		log.Fatal(err.Error())
	}

	db = sqliteDatabase
}

func IsEmailTaken(email string) bool {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM Users WHERE email = ?", email).Scan(&count)
	if err != nil {
		log.Println(err)
		return false
	}
	return count > 0
}

func RegisterUser(email, password string) error {
	if IsEmailTaken(email) {
		return fmt.Errorf("Email already taken")
	}

	_, err := db.Exec("INSERT INTO Users (email, password) VALUES (?, ?)", email, password)
	if err != nil {
		log.Println(err)
		return fmt.Errorf("Failed to register user")
	}

	return nil
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
