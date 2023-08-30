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

//Queries the Users table only:
/*func (repo *dbStruct) GetUsersData(email string) ([]AllUsersData, error) {
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
		//fmt.Println("one user db query to be appended:", oneUser)
		uData = append(uData, oneUser)
	}
	err = rows.Err()
	if err != nil {
		return uData, err
	}
	//fmt.Println("all users slice from db query:", uData)
	return uData, nil
}*/

//Queries the 'Users' and the 'Followers' table
//to return influencer flag = 1
func (repo *dbStruct) GetUsersData(email string) ([]AllUsersData, error) {
	uData := []AllUsersData{}
	userData, err := repo.GetUserByEmail(email)
	if err != nil {
		fmt.Println("Error getting user data by email", err)
		return uData, err
	}
	var nickName1 = userData.NickName
	fmt.Println(nickName1)

	query := `
        SELECT U.id, U.nickName, U.avatarURL, U.imageFile, U.aboutMe, U.profileVisibility, U.loggedIn,
        CASE WHEN F.followerUserName = ? THEN 1 ELSE 0 END AS influencer
        FROM Users U
        LEFT JOIN Followers F ON U.nickName = F.influencerUserName AND F.followerUserName = ?
        WHERE U.nickName != ?
    `

	rows, err := repo.db.Query(query, nickName1, nickName1, nickName1)
	if err != nil {
		return uData, fmt.Errorf("get allUserData db query error %v", err)
	}

	var oneUser AllUsersData

	for rows.Next() {
		err := rows.Scan(&oneUser.ID, &oneUser.NickName, &oneUser.Avatar, &oneUser.Image, &oneUser.AboutMe, &oneUser.ProfVisib, &oneUser.LoggedIn, &oneUser.Influencer)
		if err != nil {
			return uData, fmt.Errorf("getuData rows.Scan error %+v", err)
		}
		//print scanned values
		fmt.Printf("Scanned values: ID=%v, NickName=%v, Avatar=%v, Image=%v, AboutMe=%v, ProfVisib=%v, LoggedIn=%v, Influencer=%v\n", oneUser.ID, oneUser.NickName, oneUser.Avatar, oneUser.Image, oneUser.AboutMe, oneUser.ProfVisib, oneUser.LoggedIn, oneUser.Influencer)

		fmt.Println("oneUser", oneUser)
		uData = append(uData, oneUser)
	}

	err = rows.Err()
	if err != nil {
		return uData, err
	}

	return uData, nil
}

/*func GetUserByEmail(email string) {
	panic("unimplemented")
}*/
