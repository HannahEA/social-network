package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

var theData ProfileVisibilityData

func (service *AllDbMethodsWrapper) HandleChangeProfileVisibility(w http.ResponseWriter, r *http.Request) {

	err := json.NewDecoder(r.Body).Decode(&theData)
	if err != nil {
		fmt.Println("handleChangeVisibility: jsonDecoder failed")
		fmt.Print("visibility data:", theData)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	v, err1 := service.repo.UploadVisibilityValue(theData)
	if err1 != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		fmt.Println("unable to upload profile visibility error", err1)
		return
	}

	// Send a response back to the client
	response := map[string]string{
		"message":   "Visibility update successful",
		"profVisib": v,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

}


func (repo *dbStruct) UploadVisibilityValue(data ProfileVisibilityData) (string, error) {

	res, err := repo.db.Exec("UPDATE Users SET profileVisibility = ? WHERE nickName = ?", data.ProfVisib, data.NickName)

	if err != nil {
		log.Println("This is the visibility upload error:",err)
		return data.ProfVisib, fmt.Errorf("failed to update profileVisibility")
	}

	rowsAffected, err := res.RowsAffected()
if err != nil {
    log.Println("the rowsAffected error", err)
}
	//return user id
	fmt.Printf("new user visibility is: %v, the rows affected are: %v", data.ProfVisib, rowsAffected)
	return data.ProfVisib, nil
}

