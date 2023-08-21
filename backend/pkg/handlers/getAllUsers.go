package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

//The error check function
func check(err error) {
	if err != nil {
		log.Print(err)
		return
	}
}

func (service *AllDbMethodsWrapper) HandleGetAllUsers(w http.ResponseWriter, r *http.Request) {
	//retrieve the cookie from 'r'
	var userEmail string
	err := json.NewDecoder(r.Body).Decode(&userEmail)
	check(err)
	fmt.Println("the current user's email:", userEmail)

	//returns an array of all users except the logged-in user
	theUsers, err2 := service.repo.GetUsersData(userEmail)
	fmt.Println("All users in db:", theUsers)
	//list of users not available error
	if err2 != nil {
		response := map[string]interface{}{
			"message": "Error retrieving all users",
		}
		err0 := json.NewEncoder(w).Encode(response)
		check(err0)
	}

	//add header "All users retrieved ok" if successful and send slice of users to front end"
	response := map[string]interface{}{
		"message":  "All users retrieved ok",
		"allUsers": theUsers,
	}
	err1 := json.NewEncoder(w).Encode(response)
	check(err1)

}

func (repo *dbStruct) GetUsersData(email string) ([]AllUsersData, error) {
	uData := []AllUsersData{}
	rows, err := repo.db.Query(`SELECT id, nickName, avatarURL, imageFile, aboutMe, profileVisibility, loggedIn FROM Users WHERE email != ? `, email)
	//rows, err := repo.db.Query(`SELECT id, nickName, avatarURL, imageFile, profileVisibility, loggedIn FROM Users`)
	if err != nil {
		return uData, fmt.Errorf("get allUserData db query error %v", err)
	}
	var oneUser AllUsersData

	for rows.Next() {
		err := rows.Scan(&oneUser.ID, &oneUser.NickName, &oneUser.Avatar, &oneUser.Image, &oneUser.AboutMe, &oneUser.ProfVisib, &oneUser.LoggedIn)
		if err != nil {
			return uData, fmt.Errorf("getuData rows.Scan error %+v", err)
		}
		fmt.Println("one user db query to be appended:", oneUser)
		uData = append(uData, oneUser)
	}
	err = rows.Err()
	if err != nil {
		return uData, err
	}
	fmt.Println("all users slice from db query:", uData)
	return uData, nil
}
