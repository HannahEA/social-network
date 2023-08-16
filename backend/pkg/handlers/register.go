package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

var data RegistrationData

func (service *AllDbMethodsWrapper) HandleRegistration(w http.ResponseWriter, r *http.Request) {
	// Parse the request body into a RegistrationData struct
	// var data User
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		fmt.Println("handleRegistration: jsonDecoder failed")
		fmt.Print("Registration data:", data)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	//never used
	//fmt.Println("Data", data.Image)
	// Remove the data URI scheme prefix before unmarshalling data.Image
	//imageDataString := strings.SplitN(data.Image, ",", 2)[1]
	// Trim leading and trailing whitespace
	//imageDataString = strings.TrimSpace(imageDataString)
	//fmt.Print("image payload", data.Image)
	//fmt.Print("image payload", imageDataString)
	// Decode the base64-encoded image data
	//imageData, err := base64.StdEncoding.DecodeString(imageDataString)
	/*if err != nil {
		fmt.Println("handleRegistration: failed to decode image data")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}*/
	//fmt.Print("data.Image after unmarshalling", data.Image)
	//fmt.Println("Registration Data recieved: ", data)
	//fmt.Println("ImageData:", imageData)

	// Check if the email & nickname already exists
	if service.repo.IsEmailNicknameTaken(data.Email, data.NickName) {
		fmt.Println("isEmailTaken", data.Email)
		response := map[string]string{"message": "Email already taken"}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(response)
		return
	}

	// Register the user
	id, err := service.repo.RegisterUser(data)
	if err != nil {
		log.Println(err)
		http.Error(w, "Failed to register user", http.StatusInternalServerError)
		return
	}

	// Send a response back to the client
	response := map[string]string{
		"message": "Registration successful",
		"userID":  strconv.Itoa(id),
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (r *dbStruct) IsEmailNicknameTaken(email string, nickname string) bool {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM Users WHERE email = ? OR nickName = ?", email, nickname).Scan(&count)
	if err != nil {
		fmt.Println("IsEmailTaken: Failed to access user database")
		log.Println(err)
		return false
	}
	return count > 0
}

func (repo *dbStruct) RegisterUser(data RegistrationData) (int, error) {
	// if repo.IsEmailNicknameTaken(email, nickname) {
	// 	return fmt.Errorf("email already taken")
	// }
	// turn the password into a hash to be stored into the db
	fmt.Println("the User image we upload in DB", data.Image)
	fmt.Println("the User avatar we upload in DB", data.Avatar)
	var hash []byte
	hash, err1 := bcrypt.GenerateFromPassword([]byte(data.Password), bcrypt.DefaultCost)
	if err1 != nil {
		fmt.Println("bcrypt err1:", err1)
	}

	fmt.Println("hash: ", hash)
	pVisibility := "public"
	//the 'id' value of the new user
	lastInsertId := 0
	LoggedIn := "No"
	//registerTime := time.Now();

	err := repo.db.QueryRow("INSERT INTO Users (firstName, lastName, nickName, age, gender, email, password, avatarURL, imageFile, aboutMe, profileVisibility, loggedIn) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id", data.FirstName, data.LastName, data.NickName, data.Age, data.
		Gender, data.Email, hash, data.Avatar, data.Image, data.AboutMe, pVisibility, LoggedIn).Scan(&lastInsertId)
	if err != nil {
		log.Println(err)
		return 0, fmt.Errorf("failed to register user")
	}
	//return user id
	fmt.Println("new user ID is: ", lastInsertId)
	return lastInsertId, nil
}

/*This is an application of Ricky's and Kievon's approach
  that stores image file in the 'uploads' folder:
var data RegistrationData
var imgPath string

func (service *AllDbMethodsWrapper) HandleRegistration(w http.ResponseWriter, r *http.Request) {
	//=====> Start of avatar file handling <=====
	var imgName string

	// avtPath, err2 := service.SaveAvatarFile(w, r)
	// if err2 != nil {
	// 	fmt.Println("Avatar file error", err2)

	// }
	//=====> End of avatar file handling <=====

	// Parse the request body into a RegistrationData struct

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		fmt.Println("handleRegistration: jsonDecoder failed")
		fmt.Print("Registration data:", data)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	fmt.Println("Registration Data recieved: ", data)
	//If avatar = image file, make unique image name
	//and append img type to it, join folder path and file name,
	//and store folder path to db.
	if data.ImgType != "" {
		id := uuid.New()
		imgName = id.String() + "." + data.ImgType
		fmt.Print("imgName:", imgName)
		path := "./backend/pkg/uploads/"
		imgPath = path + imgName
		fmt.Print("imgPath:", imgPath)
		//Store the avatar image file itself into the 'uploads' folder.
		//First, create a new file on the server and read image file data into it
		newFile, err := os.Create(imgPath)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer newFile.Close()

		// Write the file content to the new file in the 'uploads' directory
		_, err = newFile.Write(data.Image)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		fmt.Fprintf(w, "File uploaded successfully")

	} else {
		imgPath = ""
	}

	// Check if the email & nickname already exists
	if service.repo.IsEmailNicknameTaken(data.Email, data.NickName) {
		fmt.Println("isEmailTaken", data.Email)
		response := map[string]string{"message": "Email already taken"}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(response)
		return
	}

	// Register the user
	err = service.repo.RegisterUser(data.Email, data.Password)
	if err != nil {
		log.Println(err)
		http.Error(w, "Failed to register user", http.StatusInternalServerError)
		return
	}

	// Send a response back to the client
	response := map[string]string{"message": "Registration successful"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (r *dbStruct) IsEmailTaken(email string) bool {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM Users WHERE email = ?", email).Scan(&count)
	if err != nil {
		fmt.Println("IsEmailTaken: Failed to access user database")
		log.Println(err)
		return false
	}
	return count > 0
}

func (r *dbStruct) IsEmailNicknameTaken(email string, nickname string) bool {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM Users WHERE email = ? OR nickName = ?", email, nickname).Scan(&count)
	if err != nil {
		fmt.Println("IsEmailTaken: Failed to access user database")
		log.Println(err)
		return false
	}
	return count > 0
}

func (repo *dbStruct) RegisterUser(email, password string) error {
	if repo.IsEmailTaken(email) {
		return fmt.Errorf("email already taken")
	}
	// turn the password into a hash to be stored into the db
	var hash []byte
	hash, err1 := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err1 != nil {
		fmt.Println("bcrypt err1:", err1)
	}

	fmt.Println("hash: ", hash)

	_, err := repo.db.Exec("INSERT INTO Users (firstName, lastName, nickName, age, gender, email, password, avatarURL, imageFile, aboutMe) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", data.FirstName, data.LastName, data.NickName, data.Age, data.
		Gender, email, hash, data.Avatar, imgPath, data.AboutMe)
	if err != nil {
		log.Println(err)
		return fmt.Errorf("failed to register user")
	}

	return nil
}*/

// Not being used:
// func (service *AllDbMethodsWrapper) checkEmailHandler(w http.ResponseWriter, r *http.Request) {
// 	email := r.URL.Query().Get("email")
// // 	if service.repo.IsEmailTaken(email) {
// // 		w.WriteHeader(http.StatusConflict)
// // 		fmt.Fprint(w, "Email already taken")
// // 		return
// // 	}
// 	w.WriteHeader(http.StatusOK)
// 	fmt.Fprint(w, "Email available")
// }
