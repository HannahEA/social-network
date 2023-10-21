CREATE TABLE IF NOT EXISTS "GroupPosts" ( 
		"postID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "groupID" INTEGER NOT NULL,
		"authorID" INTEGER NOT NULL,
		"Author" TEXT,
		"title" TEXT NOT NULL, 
		"content" TEXT NOT NULL, 
		"category" TEXT NOT NULL,
		"imageURL" STRING,
		"imageFile" BLOB,
		"creationDate" TIMESTAMP,
		"cookieID" BLOB,
		"postVisibility" TEXT NOT NULL,
        FOREIGN KEY(groupID)REFERENCES Groups(groupID),
		FOREIGN KEY(authorID)REFERENCES Users(id)
		);