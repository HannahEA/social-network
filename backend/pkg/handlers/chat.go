package handlers

import (
	"encoding/json"
	"fmt"
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

	service.repo.FindConversation(conversation)

}

func (repo *dbStruct) FindConversation (convo Conversation) Conversation{
	return Conversation{}
}