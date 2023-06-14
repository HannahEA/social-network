package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	uuid "github.com/satori/go.uuid"
	"golang.org/x/crypto/bcrypt"
)

func (service *AllDbMethodsWrapper) HandleLogin(w http.ResponseWriter, r *http.Request) {
	// Parse the request body into a LoginData struct
	var data LoginData
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validate the login credentials
	valid, err := service.repo.ValidateLogin(data.Email, data.Password)
	if err != nil {
		log.Println(err)
		response := map[string]interface{}{
			"message": "Login unsuccessful",
		}
		w.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(w).Encode(response)
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
			return
		}
		return
	}

	// Send a response back to the client based on validation result
	if valid {

		// make a sessionToken to be used as session cookie
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

		// var uID int
		userId, err3 := service.repo.ReturnId(data.Email)
		if err3 != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("ERROR"))
			fmt.Println("error with currentUser", err3)
		}

		// populate the Sessions database table
		err4 := service.repo.PopulateTheSessionsDB(userId, user_session.Name, user_session.Value)
		if err4 != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Println("err4 with inserting session:", err4)
			return
		}

		userAvatar, err5 := service.repo.getAvatar(data.Email)
		if err5 != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Println("err5: missing userAvatar", err5)
			return
		}

		fmt.Print(userAvatar)

		response := map[string]interface{}{
			"message":    "Login successful",
			"email":      data.Email,
			"userAvatar": userAvatar,
		}

		w.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(w).Encode(response)
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
			return
		}
	} else {
		response := map[string]interface{}{
			"message": "Login unsuccessful",
			"email":   data.Email,
		}
		w.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(w).Encode(response)
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
			return
		}
	}
}

func (repo *dbStruct) PopulateTheSessionsDB(userID int, cookieName, cookieValue string) error {
	insertsessStmt, err4 := repo.db.Prepare(`INSERT INTO Sessions (userID, cookieName, cookieValue) VALUES (?, ?, ?)`)
	if err4 != nil {
		fmt.Println("err4 with inserting session:", err4)
		return err4
	}

	defer insertsessStmt.Close()
	insertsessStmt.Exec(userID, cookieName, cookieValue)
	return nil
}

func (repo *dbStruct) ValidateLogin(email, password string) (bool, error) {
	var count int

	// retrieve passwordhash from db.  Turn user supplied password into a hash
	// and compare both hashes to see if they match
	var hash []byte

	// err := db.QueryRow("SELECT COUNT(*) FROM Users WHERE email = ? AND password = ?", email, password).Scan(&count)
	err := repo.db.QueryRow("SELECT password FROM Users WHERE email = ?", email).Scan(&hash)
	if err != nil {
		log.Println(err)
		return false, fmt.Errorf("failed to validate login")
	}

	// compare the hash value of user supplied pw with hash stored in db
	comparePass := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))

	// comparePass returns nil on success
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

func (repo *dbStruct) GetUserEmail(userID string) (string, error) {
	var email string
	err := repo.db.QueryRow("SELECT email FROM Users WHERE id = ?", userID).Scan(&email)
	if err != nil {
		return "", err
	}
	return email, nil
}

func (repo *dbStruct) ReturnId(email string) (int, error) {
	id := 0
	theID := "SELECT id FROM Users WHERE email = ?"
	rowCurrentUser := repo.db.QueryRow(theID, email)
	// Writing user id into User.id struct field
	err3 := rowCurrentUser.Scan(&id)
	if err3 != nil {
		// fmt.Println("error accessing DB")
		return id, err3
	}
	return id, nil
}

//Code to send avatar image back to the front end:
func (repo *dbStruct) getAvatar(email string) (string, error) {
	// Retrieve the avatar image or URL from the database
	query := "SELECT avatarURL, imageFile FROM Users WHERE email = ?"
	var avatarImage string // need to be handle
	var avatarURL string
	err := repo.db.QueryRow(query, email).Scan(&avatarURL, &avatarImage)
	if err != nil {
		//http.Error(w, "Failed to retrieve avatar", http.StatusInternalServerError)
		return "", err
	}

	if avatarImage != "" {
		// Set the response header for content type
		// w.Header().Set("Content-Type", "image/jpeg")

		return avatarImage, nil
	} else if avatarURL != "" {
		//Write the avatar URL to the response
		return avatarURL, nil
	} else {
		//Alternatively, give user a default avatar
		return "", err
	}

}
