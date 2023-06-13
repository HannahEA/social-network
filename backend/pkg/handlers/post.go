package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"
)

func (repo *dbStruct) AddPostToDB(post Post) error {
	// time
	date := time.Now()
	//cookie
	cookieArr := strings.Split(post.Cookie, "=")
	cookieID := cookieArr[1]
	//user info
	user := repo.GetUserByCookie(cookieID)
	//category
	post.Category = "filler"
	_, err := repo.db.Exec("INSERT INTO Posts ( authorId, Author, title, content, category, creationDate, cookieID, postVisibility) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", user.id, user.NickName, post.Title, post.Content, post.Category, date, cookieID, post.Visibility)
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to add Post to Database")
	}
	return nil
}

func (repo *dbStruct) GetPublicPosts(post Post) ([]Post, error) {
	posts := []Post{}
	rows, err :=repo.db.Query(`SELECT (author, title, content, category, creationDate) FROM posts WHERE postVisbility = Public`)
	if err != nil {
		return posts, fmt.Errorf("GetPosts DB Query error: %+v\n", err)
	}
	var creationDate string
	var author string
	var title string
	var category string
	var postcontent string
	for rows.Next() {
		err := rows.Scan( &author, &title, &category, &postcontent, &creationDate)
		if err != nil {
			return posts, fmt.Errorf("GetPosts rows.Scan error: %+v\n", err)
		}
		posts = append(posts, Post{
			Title:      title,
			Category: category,
			Content:       postcontent,
		})
	}
	err = rows.Err()
	if err != nil {
		return posts, err
	}
	return posts, nil
}

func (service *AllDbMethodsWrapper) PostHandler(w http.ResponseWriter, r *http.Request) {
	var data Post
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		fmt.Println("postHandler: jsonDecoder failed")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	//We get the cookie
	c, err := r.Cookie("user_session")
	if err != nil {
		fmt.Println("Cookie is empty", err)
		return
	}
	fmt.Println("Cookie -----", c)
	fmt.Println("Post Data recieved: ", data)
	data.Cookie = c.String()
	if data.PostType == "newPost" {
		err := service.repo.AddPostToDB(data)
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to add new post", http.StatusInternalServerError)
			return
		}
	} else if data.PostType == "getPosts" {
		posts, err := service.repo.GetPublicPosts(data)
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to get public post", http.StatusInternalServerError)
			return
		}
		fmt.Println(posts)
	}
	fmt.Println("Post")
}
