package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

func (service *movieService) HandleRegistration(w http.ResponseWriter, r *http.Request) {
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
	if service.repo.IsEmailTaken(data.Email) {
		fmt.Println("isEmailTaken", data.Email)
		response := map[string]string{"message": "Email already taken"}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(response)
		return
	}

	// Register the user
	err = service.repo.RegisterUser(data.Email, data.Password)
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

func (r *movieRepository) IsEmailTaken(email string) bool {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM Users WHERE email = ?", email).Scan(&count)
	if err != nil {
		fmt.Println("IsEmailTaken: Failed to access user database")
		log.Println(err)
		return false
	}
	return count > 0
}

func (repo *movieRepository) RegisterUser(email, password string) error {
	if repo.IsEmailTaken(email) {
		return fmt.Errorf("email already taken")
	}
	// turn the password into a hash to be stored into the db
	var hash []byte
	hash, err1 := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err1 != nil {
		fmt.Println("bcrypt err1:", err1)
	}

	fmt.Println("hash: ", hash)

	_, err := repo.db.Exec("INSERT INTO Users (email, password) VALUES (?, ?)", email, hash)
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to register user")
	}

	return nil
}

// Not being used:
func (service *movieService) checkEmailHandler(w http.ResponseWriter, r *http.Request) {
	email := r.URL.Query().Get("email")

	if service.repo.IsEmailTaken(email) {
		w.WriteHeader(http.StatusConflict)
		fmt.Fprint(w, "Email already taken")
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "Email available")
}