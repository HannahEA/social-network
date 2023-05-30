package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"
)

func (repo *movieRepository) AddPostToDB(post Post) error {
	// time
	date := time.Now()
	//cookie
	cookieArr := strings.Split(post.Cookie, "=")
	cookieID := cookieArr[1]
	//user info
	user := repo.GetUserByCookie(cookieID)
	//category
	post.Category = "filler"
	_, err := repo.db.Exec("INSERT INTO Posts ( authorId, Author, title, content, category, creationDate, cookieID, postVisibility) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", user.id, user.NickName, post.Title, post.Content, post.Category, cookieID, date, post.Visibility)
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to add Post to Database")
	}
	return nil
}

func (service *movieService) PostHandler(w http.ResponseWriter, r *http.Request) {
	var data Post
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		fmt.Println("postHandler: jsonDecoder failed")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	fmt.Println("Post Data recieved: ", data)

	if data.PostType == "newPost" {
		err := service.repo.AddPostToDB(data)
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to add new post", http.StatusInternalServerError)
			return
		}
	}

}
