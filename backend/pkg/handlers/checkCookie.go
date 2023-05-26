package handlers

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
)

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