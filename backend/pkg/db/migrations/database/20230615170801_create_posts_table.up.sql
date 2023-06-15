CREATE TABLE IF NOT EXISTS "Posts" ( 
		"postID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
		"authorID" INTEGER NOT NULL,
		"Author" TEXT,
		"title" TEXT NOT NULL, 
		"content" TEXT NOT NULL, 
		"category" TEXT NOT NULL,
		"creationDate" TIMESTAMP,
		"cookieID" BLOB,
		"postVisibility" TEXT NOT NULL,
		FOREIGN KEY(authorID)REFERENCES Users(id)
		);