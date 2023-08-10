package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// checkCookieHandler handles the "/checkCookie" endpoint
func (service *AllDbMethodsWrapper) CheckCookieHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("cookie function called")

	// Retrieve the cookie value from the request
	cookie, err := r.Cookie("user_session")
	if err != nil {
		// Cookie is not found
		noCookie := map[string]interface{}{
			"message": "Cookie is not found",
		}
		err := json.NewEncoder(w).Encode(noCookie)
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to encode noCookie", http.StatusInternalServerError)
			return
		}
		return
	}

	// Get the cookie value
	cookieValue := cookie.Value

	fmt.Println("cookie received:", cookieValue)

	count := service.repo.checkCookieDB(cookieValue)

	//browser to show logged in user info
	//if browser window was previously closed down without logging out
	loggedInUser := service.repo.GetUserByCookie(cookieValue)
	var image string = string(loggedInUser.Image)
	
	loggedUserInfoFound := map[string]interface{}{
		"message": "Cookie is found",
		"email":   loggedInUser.Email,
		"username": loggedInUser.NickName,
		"firstName": loggedInUser.FirstName,
		"lastName": loggedInUser.LastName,
		"age": loggedInUser.Age,
		"gender": loggedInUser.Gender,
		"aboutMe": loggedInUser.AboutMe,
		"avatar":  loggedInUser.Avatar,
		"image":   image,
		"profVisib": loggedInUser.ProfVisib,
		"created_at": loggedInUser.Created_At,
	}

	loggedUserInfoNotFound := map[string]interface{}{
		"message": "Cookie is not found",
		"email":   "",
		"avatar":  "",
		"image":   "",
	}

	// Return the result based on the count value
	if count > 0 {
		// Cookie is found
		//fmt.Fprint(w, loggedUser)
		w.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(w).Encode(loggedUserInfoFound)
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
			return
		}
	} else {
		// Cookie is not found
		//fmt.Fprint(w,"Cookie is not found")
		w.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(w).Encode(loggedUserInfoNotFound)
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
			return
		}
	}

	// Open the SQLite3 database connection
	// db, err := sql.Open("sqlite3", "database.db")
	// if err != nil {
	// 	log.Fatal(err)
	// }
	//defer db.Close()

	// Prepare the SQL statement to check the cookie value in the Sessions table

}

func (repo *dbStruct) checkCookieDB(cookieValue string) int {
	stmt, err := repo.db.Prepare("SELECT COUNT(*) FROM Sessions WHERE cookieValue = ?")
	if err != nil {
		log.Fatal(err)
	}

	// Execute the SQL statement and check if the cookie value exists
	var count int
	err = stmt.QueryRow(cookieValue).Scan(&count)
	if err != nil {
		log.Fatal(err)
	}
	return count

}
