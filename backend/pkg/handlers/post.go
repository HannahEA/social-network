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
	categories := strings.Join(post.Category, ",")
	_, err := repo.db.Exec("INSERT INTO Posts ( authorId, Author, title, content, category, imageURL, imageFile, creationDate, cookieID, postVisibility) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", user.id, user.NickName, post.Title, post.Content, categories, post.ImageURL, post.ImageFile, date, cookieID, post.Visibility)
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to add Post to Database")
	}
	return nil
}

func (repo *dbStruct) GetPublicPosts() ([]Post, error) {

	posts := []Post{}
	rows, err := repo.db.Query(`SELECT postID, author, title, content, category, imageURL, imageFile, creationDate FROM posts WHERE postVisibility = 'Public' `)
	if err != nil {
		return posts, fmt.Errorf("GetPosts DB Query error: %+v", err)
	}
	var postID int
	var postDate string
	var author string
	var title string
	var category string
	var imageURL string
	var imageFile string
	var postcontent string
	for rows.Next() {
		err := rows.Scan(&postID, &author, &title, &postcontent, &category, &imageURL, &imageFile, &postDate)
		if err != nil {
			return posts, fmt.Errorf("GetPosts rows.Scan error: %+v\n", err)
		}
		postTime, parseError := time.Parse("2006-01-02T15:04:05.999999999Z07:00", postDate)

		if parseError != nil {
			log.Fatal("getPublicPosts: parse creationDate Error")
		}
		//get the current date
		currTime := time.Now()
		currDate := currTime.Format("2006-01-02")
		//get the date the post was created
		postDate = postTime.Format("2006-01-02")
		//if the post was created today
		if currDate == postDate {
			//send the time insted of the date

			postDate = postTime.Format("3:04PM")

		}

		//tags
		tags := strings.Split(category, ",")
		posts = append([]Post{{
			PostID:    postID,
			Author:    author,
			Title:     title,
			Category:  tags,
			Content:   postcontent,
			ImageFile: imageFile,
			ImageURL:  imageURL,
			Date:      postDate,
		}}, posts...)
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

	data.Cookie = c.String()
	if data.PostType == "newPost" {
		err := service.repo.AddPostToDB(data)
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to add new post", http.StatusInternalServerError)
			return
		}
		fmt.Println("getting Public posts")
		posts, err := service.repo.GetPublicPosts()
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to get public post", http.StatusInternalServerError)
			return
		}
		fmt.Println("getting comments for latest post")

		comments, err := service.repo.GetComments(posts[0])
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to get comments", http.StatusInternalServerError)
			return
		}
		posts[0].Comments = comments

		fmt.Println("successfully retrieved comments")
		fmt.Println("Sending latest post")
		json.NewEncoder(w).Encode(posts[0])

	} else if data.PostType == "getPosts" {
		fmt.Println("getting Public posts")
		posts, err := service.repo.GetPublicPosts()
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to get public post", http.StatusInternalServerError)
			return
		}
		fmt.Println("getting comments for posts")
		for i, p := range posts {
			comments, err := service.repo.GetComments(p)
			if err != nil {
				log.Println(err)
				http.Error(w, "Failed to get comments", http.StatusInternalServerError)
				return
			}
			posts[i].Comments = comments
		}
		fmt.Println("successfully retrieved comments")
		json.NewEncoder(w).Encode(posts)
	} else if data.PostType == "getComments" {
		comments, err := service.repo.GetComments(data)
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to get public post", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(comments)
	} else if data.PostType == "newComment" {
		err := service.repo.AddCommentToDB(data)
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to add new comment", http.StatusInternalServerError)
			return
		}

	}

}

func (repo *dbStruct) GetComments(post Post) ([]Comment, error) {
	comments := []Comment{}
	rows, err := repo.db.Query(`SELECT commentID, author, content, creationDate FROM comments WHERE postID = ? `, post.PostID)
	if err != nil {
		return comments, fmt.Errorf("GetComments DB Query error %+v", err)
	}
	var commentID int
	var commentDate string
	var author string
	var content string
	for rows.Next() {
		err := rows.Scan(&commentID, &author, &content, &commentDate)
		if err != nil {
			return comments, fmt.Errorf("GetComments rows.Scan error %+v", err)
		}
		cTime, parseError := time.Parse("2006-01-02T15:04:05.999999999Z07:00", commentDate)

		if parseError != nil {
			log.Fatal("getPublicPosts: parse commentDate Error")
		}
		//get the current date
		currTime := time.Now()
		currDate := currTime.Format("2006-01-02")
		//get the date the post was created
		commentDate = cTime.Format("2006-01-02")
		//if the post was created today
		if currDate == commentDate {
			//send the time insted of the date

			commentDate = cTime.Format("3:04PM")

		}
		comments = append([]Comment{{
			CommentID: commentID,
			PostID:    post.PostID,
			Author:    author,
			Content:   content,
			Date:      commentDate,
		}}, comments...)
	}
	err = rows.Err()
	if err != nil {
		return comments, err
	}
	return comments, nil

}

func (repo *dbStruct) AddCommentToDB(post Post) error {
	// time
	date := time.Now()
	//cookie
	cookieArr := strings.Split(post.Cookie, "=")
	cookieID := cookieArr[1]
	//user info
	user := repo.GetUserByCookie(cookieID)

	_, err := repo.db.Exec("INSERT INTO Comments ( postID, authorID, author, content, creationDate) VALUES ( ?, ?, ?, ?, ?)", post.PostID, user.id, user.NickName, post.Content, date)
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to add Comment to Database")
	}
	return nil
}
