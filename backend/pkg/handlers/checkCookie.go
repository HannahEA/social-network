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

	fmt.Println("the number of users logged in is? Here the db gets locked: ",count)

	//browser to show logged in user info
	//if browser window was previously closed down without logging out
	loggedInUser := service.repo.GetUserByCookie(cookieValue)
	var image string = string(loggedInUser.Image)

	//get followers
	followers, errf1:= service.repo.GetFollowers(loggedInUser.NickName)
	if errf1 != nil {
		fmt.Println("error with GetFollowers: ",errf1)
			return
	}
	//get following
	following, errf2:= service.repo.GetFollowing(loggedInUser.NickName)
	if errf2 != nil {
		fmt.Println("error with GetFollowing: ",errf2)
			return
	}
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
		"followers": followers,
		"following": following,
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

func (repo *dbStruct) GetFollowing(username string) ([]any, error) {
	var following []any
	rows, err2 := repo.db.Query(`SELECT influencerUserName FROM Followers WHERE followerUserName = ? AND accepted = 'Yes'`, username)
	if err2 != nil {
		fmt.Println("Get following: query error", err2)
		return following, err2
	}
	for rows.Next() {
		var follower string
		err := rows.Scan(&follower)
		if err != nil {
			fmt.Println("GetFollowing: row scan error:", err)
			continue
		}
		following = append(following, follower)
	}
	return following, nil
}
func (repo *dbStruct) GetFollowers(username string) ([]any, error) {
	var followers []any
	rows, err2 := repo.db.Query(`SELECT followerUserName FROM Followers WHERE influencerUserName  = ? AND accepted = 'Yes'`, username)
	if err2 != nil {
		fmt.Println("GetFollowers: query error", err2)
		return followers, err2
	}
	for rows.Next() {
		var follower string
		err := rows.Scan(&follower)
		if err != nil {
			fmt.Println("GetFollowers: row scan error:", err)
			continue
		}
		followers = append(followers, follower)
	}
	return followers, nil
}
