package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"unicode/utf8"

	"github.com/gorilla/websocket"
)

// func Logout(w http.ResponseWriter, r *http.Request, hub *Hub) {
func (service *AllDbMethodsWrapper) HandleLogout(w http.ResponseWriter, r *http.Request) {
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
		service.repo.DeleteSession(w, string(cooky.Value))

	}
}

func (service *AllDbMethodsWrapper) DeleteCookie(w http.ResponseWriter, r *http.Request) {
	// Retrieve the cookie value from the request
	cookie, err := r.Cookie("user_session")
	if err != nil {
		fmt.Fprint(w, "No cookie provided by the client")
		return
	}

	// Get the cookie value
	cookieValue := cookie.Value

	//delete client from hub
	var conn *websocket.Conn
	//get username from cookie
	user := service.repo.GetUserByCookie(cookieValue)
	for con, name := range Clients {
		if name == user.NickName {
			//get websocket connection from client hub
			conn = con
		}
	}
	//delete client
	delete(Clients, conn)
	fmt.Println("Clients", Clients)
	//get usernames
	var users []string
			for _, name := range Clients {
				users= append(users, name)
			}
			webMessage:= WebsocketMessage{
				Presences: Presences {
					Clients: users,
				},
			}
	//send updated list to users
	service.repo.BroadcastToChannel(BroadcastMessage{WebMessage:webMessage, Connections: Clients})

	//=======> start of db query <============
	rowsAffected, err := service.repo.DeleteCookieDB(cookieValue)
	if err != nil {
		fmt.Print("Error deleting cookie in db", err)
		return
	}
	//=======> end of db query <============

	// Return the result based on the affected rows count
	if rowsAffected > 0 {
		// Cookie is deleted
		fmt.Fprint(w, "Cookie is deleted")
	} else {
		// Cookie is not found or not deleted
		fmt.Fprint(w, "Cookie is not found or not deleted")
	}
	
}

func (repo *dbStruct) DeleteCookieDB(cookieValue string) (int64, error) {
	// Prepare the SQL statement to delete the cookie value from the Sessions table
	stmt, err := repo.db.Prepare("DELETE FROM Sessions WHERE cookieValue = ?")
	if err != nil {
		fmt.Println("err with deleting cookie from db:", err)
		return 0, err
	}

	// Execute the SQL statement to delete the cookie value
	result, err := stmt.Exec(cookieValue)
	if err != nil {
		log.Fatal(err)
		return 0, err
	}
	// Check the affected rows count
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Fatal(err)
		return 0, err
	}
	return rowsAffected, err

}
