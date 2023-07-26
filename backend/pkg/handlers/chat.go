package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

func (service *AllDbMethodsWrapper) ConversationHandler(w http.ResponseWriter, r *http.Request) {
	var conversation Conversation
	err := json.NewDecoder(r.Body).Decode(&conversation)
	if err != nil {
		fmt.Println("handleConversation: jsonDecoder failed")
		fmt.Print("Conversation data:", conversation)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	conversation = service.repo.FindConversation(conversation)

	response := map[string]interface{}{
		"conversation": conversation,
	}

	w.Header().Set("Content-Type", "application/json")
	jsonErr := json.NewEncoder(w).Encode(response)
	if jsonErr != nil {
		log.Println(err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}

}

func (repo *dbStruct) FindConversation(convo Conversation) Conversation {
	query := `SELECT COUNT (*) FROM PrivateChat WHERE participant1 IN (?, ?) AND participant2 IN (?,?)`
	stmt, err  := repo.db.Prepare(query)
	if err != nil {
		fmt.Println("FindConversation: db Prepare Error", err, convo)
	 }

	var count int
	 err2:= stmt.QueryRow(convo.Participant1, convo.Participant2, convo.Participant1, convo.Participant2).Scan(&count)
	 if err2 != nil {
		fmt.Println("FindConversation: QueryRow Error", err2, convo)
	 }

	if  count == 0 {
		fmt.Println("conversationID not found")
		//add conversation to db
		convo = repo.NewPrivateChatToDB(convo)
	} 
		query2 := `SELECT conversationID FROM PrivateChat WHERE participant1 IN (?, ?) AND participant2 IN (?,?)`
		row, err := repo.db.Query(query2, convo.Participant1, convo.Participant2, convo.Participant1, convo.Participant2)
		if err != nil {
			fmt.Println("FindConversation: convoID Query Error", err2, convo)
		}

		fmt.Println("conversationID found" )
		var conversationId string
		for row.Next() {
			err := row.Scan(&conversationId)
			if err != nil {
				fmt.Println("FindConversation: Scan Error", err, convo)
			}
		}
		convo.ConversationId = conversationId

	
	return convo
}









func (repo *dbStruct) NewPrivateChatToDB(convo Conversation) Conversation {
	query1 := ` INSERT INTO PrivateChat (participant1, participant2) VALUES (?, ?)`
	_, err := repo.db.Exec(query1, convo.Participant1, convo.Participant2)
	if err != nil {
		fmt.Println("NewPrivateChatToDB: Exec Error", err, convo)
		return convo
	}
	// result, err2 := repo.db.Exec(`SELECT SCOPE_IDENTITY()`)
	// // query2:= `SELECT conversationID FROM PrivateChat WHERE participant1 = ? AND participant2 = ?`
	// if err2 != nil {
	// 	fmt.Println("NewPrivateChatToDB: Exec Error2", err, convo)
	// 	return convo
	// }
	// fmt.Println(result)

	return convo
}
