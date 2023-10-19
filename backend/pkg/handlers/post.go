package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"
)

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
	var user *User
	if data.Cookie != "" {
		fmt.Println("username sent with post data form frontend", data.Cookie)
		user = service.repo.FindByUsername(data.Cookie)
	} else {
		fmt.Println("no username sent with post data form frontend")
		data.Cookie = c.String()
		cookieArr := strings.Split(c.String(), "=")
		cookieID := cookieArr[1]
		user = service.repo.GetUserByCookie(cookieID)
	}

	if data.PostType == "newPost" {
		//return id of the new post
		id, err := service.repo.AddPostToDB(data)
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to add new post", http.StatusInternalServerError)
			return
		}
		// if post visibility is almost private add each of viewers to post viewers table with post id of post they are allowed to see
		fmt.Println("post Viewers", data.Visibility, data.Viewers)
		if data.Visibility == "Almost Private" {
			
			err:= service.repo.AddPostViewersToDB(data, id)
			if err != nil {
				log.Println(err)
				http.Error(w, "Failed to add users to Almost Private post", http.StatusInternalServerError)
				return
			}
		}
		fmt.Println("getting Public posts")
		posts, err := service.repo.GetPublicPosts(user)
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
		posts := []Post{}
		//use cookie to get user

		if data.Page == "myProfile" {
			//profile page
			// query database for all posts by this user
			userPosts, err := service.repo.GetAllUserPosts(user)
			
			posts = userPosts
			if err != nil {
				fmt.Println("Post Handler: GetAllUserPosts error: ", err)
			}
		} else {
			//feed page
			fmt.Println("getting Public posts")
			publicPosts, err := service.repo.GetPublicPosts(user)
			posts = publicPosts
			if err != nil {
				log.Println(err)
				http.Error(w, "Failed to get public post", http.StatusInternalServerError)
				return
			}
			fmt.Println("getting Private posts")
			privatePosts, err2 := service.repo.GetPrivatePosts(user)
			if err2 != nil {
				log.Println(err2)
				http.Error(w, "Failed to get private post", http.StatusInternalServerError)
				return
			}
			//search post table for almost private posts this user has been allowed to see and append to list
			almPrivatePosts, err3 := service.repo.GetAlmostPrivatePosts(user)
			if err3 != nil {
				log.Println(err3)
				http.Error(w, "Failed to get almost private post", http.StatusInternalServerError)
				return
			}
			fmt.Println("how many almost private posts?", len(almPrivatePosts))
			posts = append(posts, privatePosts...)
			posts = append(posts, almPrivatePosts...)

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

func ScanPosts(rows *sql.Rows) ([]Post, error) {
	var posts []Post
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
			return posts, fmt.Errorf("GetPosts rows.Scan error: %+v", err)
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
	err := rows.Err()
	if err != nil {
		return posts, err
	}
	return posts, nil
}

func (repo *dbStruct) GetPublicPosts(user *User) ([]Post, error) {
	posts := []Post{}
	rows, err := repo.db.Query(`SELECT postID, author, title, content, category, imageURL, imageFile, creationDate FROM posts WHERE postVisibility = 'Public' OR postVisibility = 'Private' AND Author = ? OR postVisibility = 'Almost Private' AND Author = ?`, user.NickName, user.NickName)
	if err != nil {
		return posts, fmt.Errorf("DB Query error: %+v", err)
	}

	posts, err2 := ScanPosts(rows)
	if err2 != nil {
		return posts, err2
	}

	return posts, nil
}

func (repo *dbStruct) GetAlmostPrivatePosts(user *User) ([]Post, error) {
	posts := []Post{}
	query := `SELECT P.postID, P.author, P.title, P.content, P.category, P.imageURL, P.imageFile, P.creationDate FROM Posts P JOIN PostViewers ON P.postID = PostViewers.postID WHERE PostViewers.username = ?`

	rows, err := repo.db.Query(query, user.NickName)
	if err != nil {
		return posts, err
	}
	posts, err2 := ScanPosts(rows)
	if err2 != nil {
		return posts, err2
	}

	return posts, nil

}

func (repo *dbStruct) GetPrivatePosts(user *User) ([]Post, error) {
	posts := []Post{}
	// Generate placeholders for the IN clause
	followers, err := repo.GetFollowers(user.NickName)
	fmt.Println("who user follows this user?", followers)
	placeholders := make([]string, len(followers))
	for i := range followers {
		placeholders[i] = "?"
	}
	placeholderString := "(" + strings.Join(placeholders, ", ") + ")"

	query := "SELECT postID, author, title, content, category, imageURL, imageFile, creationDate FROM Posts WHERE Author IN " + placeholderString + " AND postVisibility = 'Private' "

	rows, err := repo.db.Query(query, followers...)
	if err != nil {
		return posts, err
	}
	posts, err2 := ScanPosts(rows)
	if err2 != nil {
		return posts, err2
	}

	return posts, nil
}
func (repo *dbStruct) GetAllUserPosts(user *User) ([]Post, error) {
	posts := []Post{}
	query := `SELECT postID, author, title, content, category, imageURL, imageFile, creationDate FROM Posts WHERE author = ?`
	rows, err := repo.db.Query(query, user.NickName)

	if err != nil {
		return posts, fmt.Errorf("DB Query error: %+v", err)
	}

	posts, err2 := ScanPosts(rows)
	if err2 != nil {
		return posts, err2
	}

	return posts, nil
}

func (repo *dbStruct) AddPostToDB(post Post) (int,error) {
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
	
	rows, err := repo.db.Query(`Select last_insert_rowid()`)
	if err != nil {
		log.Println(err)
		return 0,fmt.Errorf("failed to add Post to Database")
	}
	var id int
	for rows.Next() {
		err:= rows.Scan(&id)
		if err != nil {
			log.Println(err)
			return 0,fmt.Errorf("failed to add Post to Database")
		}
	}
	return id,nil
}

func (repo *dbStruct) AddPostViewersToDB(data Post, id int) error {
	for _, name := range data.Viewers {
		_, err := repo.db.Exec("INSERT INTO PostViewers (postId, username) VALUES (?, ?)", id, name)
		if err != nil {
			log.Println(err)
			return fmt.Errorf("failed to add PostViewers to Database")
		}
	}
	return nil 
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
