package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

func (service *AllDbMethodsWrapper) ConversationHandler(w http.ResponseWriter, r *http.Request) {
	
	var chat Chat
	err := json.NewDecoder(r.Body).Decode(&chat)
	if err != nil {
		fmt.Println("handleConversation: jsonDecoder failed")
		fmt.Print("Conversation data:", chat)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	response := make(map[string]interface{})

	// check if it it a request to add a chat notification
	if chat.Status == "delivered" {
		fmt.Println("new chat notification")
		// add chat notification to database 
		oldChats, count, err := service.repo.CheckForNotification(chat)
		//add new notif to database or add 1 to count
		if !oldChats || oldChats && err == nil {
			fmt.Println("succesfully checked for notification")
			fmt.Println("notif added")
			service.repo.AddChatNotification(chat, count)
			response["status"] = "notification added"
			response["notifCount"] = count + 1
		} else{

			response["status"] = "notification error"
		}

	} else {
		// new chat box has been opened get convoersation id 
		// delete any notifs for this chat from notif table
		fmt.Println("converation", chat)
		conversation := service.repo.FindConversation(chat)
		//get chat history 
		chats:= service.repo.GetChatHistory(conversation)
		response["conversation"] = conversation
		response["chats"] = chats
	}
		w.Header().Set("Content-Type", "application/json")
		jsonErr := json.NewEncoder(w).Encode(response)
		if jsonErr != nil {
			log.Println(err)
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
			return
		}


	

}

func (repo *dbStruct) FindConversation(chat Chat) Conversation {
	query := `SELECT COUNT (*) FROM PrivateChat WHERE participant1 = ? AND participant2 = ? OR participant1 = ? AND participant2 = ?`
	stmt, err := repo.db.Prepare(query)
	if err != nil {
		fmt.Println("FindConversation: db Prepare Error", err, chat)
	}

	var count int
	err2 := stmt.QueryRow(chat.Sender, chat.Reciever, chat.Reciever, chat.Sender).Scan(&count)
	if err2 != nil {
		fmt.Println("FindConversation: QueryRow Error", err2, chat)
	}

	if count == 0 {
		fmt.Println("conversationID not found")
		//add conversation to db
		repo.NewPrivateChatToDB(chat)
	}
	fmt.Println("getting conversation id")
	query2 := `SELECT conversationID FROM PrivateChat WHERE participant1 IN (?, ?) AND participant2 IN (?,?)`
	row, err3 := repo.db.Query(query2, chat.Sender, chat.Reciever, chat.Sender, chat.Reciever)
	if err3 != nil {
		fmt.Println("FindConversation: convoID Query Error", err3, chat)
	}

	fmt.Println("conversationID found")
	var conversationId string
	for row.Next() {
		err := row.Scan(&conversationId)
		if err != nil {
			fmt.Println("FindConversation: Scan Error", err, chat)
		}
	}
	convo:= Conversation{
		Participant1: chat.Sender,
		Participant2: chat.Reciever,
		ConversationId: conversationId,
	}

	return convo
}

func (repo *dbStruct) NewPrivateChatToDB(chat Chat)  {
	query1 := ` INSERT INTO PrivateChat (participant1, participant2) VALUES (?, ?)`
	_, err := repo.db.Exec(query1, chat.Sender, chat.Reciever)
	if err != nil {
		fmt.Println("NewPrivateChatToDB: Exec Error", err, chat)
		
	}
	// result, err2 := repo.db.Exec(`SELECT SCOPE_IDENTITY()`)
	// // query2:= `SELECT conversationID FROM PrivateChat WHERE participant1 = ? AND participant2 = ?`
	// if err2 != nil {
	// 	fmt.Println("NewPrivateChatToDB: Exec Error2", err, convo)
	// 	return convo
	// }
	// fmt.Println(result)

	
}

func (r *dbStruct) GetChatHistory(convo Conversation) []Chat{
	var chats []Chat
	query := `SELECT chatID, chatMessage, sender, creationDate FROM MessageHistory WHERE sender IN (?, ?) AND recipient IN (?,?)`
	row, err := r.db.Query(query, convo.Participant1, convo.Participant2, convo.Participant1, convo.Participant2)
	if err != nil {
		fmt.Println("GetChatHistory: Query Error", err, convo)
		return chats 
	}

	fmt.Println("chat messages found")
	var chat Chat
	for row.Next() {
		err := row.Scan(&chat.ConversationId, &chat.Message, &chat.Sender, &chat.Date)
		if err != nil {
			fmt.Println("FindConversation: Scan Error", err, convo)
			return chats 
		}
		chats = append(chats, chat)
		chat = Chat{}

	}

 	return chats
}

func (r *dbStruct) AddChatToDatabase(chat Chat) {
	date := time.Now()

	_, err := r.db.Exec("INSERT INTO MessageHistory (chatID, chatMessage, sender, recipient, creationDate) VALUES (?, ?, ?, ?, ?)", chat.ChatId, chat.Message, chat.Sender, chat.Reciever, date)
	if err != nil {
		log.Println(err)
		fmt.Println("failed to add Chat to Database")
	}

}

func (r *dbStruct) CheckForNotification(chat Chat) (bool, int, error) {
	count := 0
	fmt.Println("checking for notifictations")
	rows, err := r.db.Query(`SELECT count FROM Notifications WHERE (sender, recipient, type) = (?,?,?) `, chat.Sender, chat.Reciever, "chat")
	if err != nil {
		log.Println(err)
		fmt.Println("failed to check Notification count in Database")
		//no chat notifications yet
		return false, count, err
	}
	//notification exsists already
	for rows.Next() {
		//get notification count
		err := rows.Scan(&count)
		if err != nil {
			return true, count, err
		}
	}
	return true, count, nil
}

func (r *dbStruct) AddChatNotification(chat Chat, count int) {
	if count == 0 {
		fmt.Println("Adding new notification to database")
		count++
		_, err := r.db.Exec("INSERT INTO Notifications (sender, recipient, type, count) VALUES (?, ?, ?, ?)", chat.Sender, chat.Reciever, "chat", count)
		if err != nil {
			log.Println(err)
			fmt.Println("failed to add Notification to Database")
		}
	} else {
		fmt.Println("Icreasing count on chat notification")
		count++
		_, err := r.db.Exec("UPDATE Notifications SET count = ? WHERE (sender, recipient) = (?,?)", count, chat.Sender, chat.Reciever)
		if err != nil {
			log.Println(err)
			fmt.Println("failed to change count of  Notification in Database")
		}
	}

}
