package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"text/template"

	"social-network-backend/pkg/db/database"
	"social-network-backend/pkg/handlers"

	_ "github.com/mattn/go-sqlite3"
)

//moved to handlers/structs.go
/*type RegistrationData struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}*/

// var db *sql.DB

// moved to handlers/register.go
// func handleRegistration(w http.ResponseWriter, r *http.Request) {
// 	// Parse the request body into a RegistrationData struct
// 	var data RegistrationData
// 	err := json.NewDecoder(r.Body).Decode(&data)
// 	if err != nil {
// 		fmt.Println("handleRegistratio: jsonDecoder failed")
// 		http.Error(w, err.Error(), http.StatusBadRequest)
// 		return
// 	}
// 	fmt.Println("Registration Data recieved: ", data)
// 	// Check if the email already exists
// 	if IsEmailTaken(data.Email) {
// 		response := map[string]string{"message": "Email already taken"}
// 		w.Header().Set("Content-Type", "application/json")
// 		w.WriteHeader(http.StatusConflict)
// 		json.NewEncoder(w).Encode(response)
// 		return
// 	}

// 	// Register the user
// 	err = RegisterUser(data.Email, data.Password)
// 	if err != nil {
// 		log.Println(err)
// 		http.Error(w, "Failed to register user", http.StatusInternalServerError)
// 		return
// 	}

// 	// Send a response back to the client
// 	response := map[string]string{"message": "Registration successful"}
// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(response)
// }

//==>Moved to handlers/login.go
// func handleLogin(w http.ResponseWriter, r *http.Request) {
// 	// Parse the request body into a LoginData struct
// 	var data handlers.RegistrationData
// 	err := json.NewDecoder(r.Body).Decode(&data)
// 	if err != nil {
// 		http.Error(w, err.Error(), http.StatusBadRequest)
// 		return
// 	}

// Validate the login credentials
// 	valid, err := ValidateLogin(data.Email, data.Password)
// 	if err != nil {
// 		log.Println(err)
// 		http.Error(w, "Failed to process login", http.StatusInternalServerError)
// 		return
// 	}

// 	// Send a response back to the client based on validation result
// 	if valid {
// 		response := map[string]interface{}{
// 			"message": "Login successful",
// 			"email":   data.Email,
// 		}
// 		w.Header().Set("Content-Type", "application/json")
// 		err := json.NewEncoder(w).Encode(response)
// 		if err != nil {
// 			log.Println(err)
// 			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
// 			return
// 		}
// 	} else {
// 		response := map[string]string{"message": "Invalid credentials"}
// 		w.Header().Set("Content-Type", "application/json")
// 		w.WriteHeader(http.StatusUnauthorized)
// 		err := json.NewEncoder(w).Encode(response)
// 		if err != nil {
// 			log.Println(err)
// 			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
// 			return
// 		}
// 	}
// }

//==>moved to handlers/login.go
// func ValidateLogin(email, password string) (bool, error) {
// 	var count int
// 	err := db.QueryRow("SELECT COUNT(*) FROM Users WHERE email = ? AND password = ?", email, password).Scan(&count)
// 	if err != nil {
// 		log.Println(err)
// 		return false, fmt.Errorf("failed to validate login")
// 	}
// 	return count > 0, nil
// }

//==>moved to handlers/login.go
// func getUserEmail(userID string) (string, error) {
// 	var email string
// 	err := db.QueryRow("SELECT email FROM Users WHERE id = ?", userID).Scan(&email)
// 	if err != nil {
// 		return "", err
// 	}
// 	return email, nil
// }

func main() {
	db := database.CreateDatabase()

	newRepo := handlers.NewRepository(db)
	newService := handlers.NewService(newRepo)
	defer database.Database.Close()

	http.HandleFunc("/", reactHandler)
	http.HandleFunc("/register", newService.HandleRegistration)
	http.HandleFunc("/login", newService.HandleLogin)
	http.HandleFunc("/checkCookie", checkCookieHandler)
	// http.HandleFunc("/feed", handleFeed) // Add the /feed route

	fmt.Println("Server started on http://localhost:8000")
	log.Fatal(http.ListenAndServe(":8000", nil))
}


// checkCookieHandler handles the "/checkCookie" endpoint
func checkCookieHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("cookie function called")

	// Retrieve the cookie value from the request
	cookie, err := r.Cookie("user_session")
	if err != nil {
		// Cookie is not found
		fmt.Fprint(w, "Cookie is not found")
		return
	}

	// Get the cookie value
	cookieValue := cookie.Value

	fmt.Println("cookie received:", cookieValue)

	// Open the SQLite3 database connection
	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Prepare the SQL statement to check the cookie value in the Sessions table
	stmt, err := db.Prepare("SELECT COUNT(*) FROM Sessions WHERE cookieValue = ?")
	if err != nil {
		log.Fatal(err)
	}

	// Execute the SQL statement and check if the cookie value exists
	var count int
	err = stmt.QueryRow(cookieValue).Scan(&count)
	if err != nil {
		log.Fatal(err)
	}

	// Return the result based on the count value
	if count > 0 {
		// Cookie is found
		fmt.Fprint(w, "Cookie is found")
	} else {
		// Cookie is not found
		fmt.Fprint(w, "Cookie is not found")
	}
}

//==>moved to handlers/register.go
// func IsEmailTaken(email string) bool {
// 	var count int
// 	err := db.QueryRow("SELECT COUNT(*) FROM Users WHERE email = ?", email).Scan(&count)
// 	if err != nil {
// 		fmt.Println("IsEmailTaken: Failed to access user database")
// 		log.Println(err)
// 		return false
// 	}
// 	return count > 0
// }

// func RegisterUser(email, password string) error {
// 	if IsEmailTaken(email) {
// 		return fmt.Errorf("email already taken")
// 	}

// 	_, err := db.Exec("INSERT INTO Users (email, password) VALUES (?, ?)", email, password)
// 	if err != nil {
// 		log.Println(err)
// 		return fmt.Errorf("failed to register user")
// 	}

// 	return nil
// }

func reactHandler(w http.ResponseWriter, r *http.Request) {
	http.FileServer(http.Dir("build")).ServeHTTP(w, r)
}

// Where is this being used??
func indexHandler(w http.ResponseWriter, r *http.Request) {
	tmpl := template.Must(template.ParseFiles("build/index.html"))
	tmpl.Execute(w, nil)
}

//==>moved to handlers/register.go
// func checkEmailHandler(w http.ResponseWriter, r *http.Request) {
// 	email := r.URL.Query().Get("email")

// 	if IsEmailTaken(email) {
// 		w.WriteHeader(http.StatusConflict)
// 		fmt.Fprint(w, "Email already taken")
// 		return
// 	}

// 	w.WriteHeader(http.StatusOK)
// 	fmt.Fprint(w, "Email available")
// }
