package main

import (
	"socialNetwork/backend/pkg/db/database"

	_ "github.com/mattn/go-sqlite3"
)

func main() {

	database.CreateDatabase()
	defer database.Database.Close()
}
