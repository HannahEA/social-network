CREATE TABLE IF NOT EXISTS "Comments" ( 
			"commentID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
			"postID" INTEGER NOT NULL,
			"authorID" INTEGER NOT NULL,
			"author" TEXT NOT NULL,
			"imageURL" TEXT,
			"content" TEXT NOT NULL, 
			"creationDate" TIMESTAMP,
		FOREIGN KEY(postID)REFERENCES Posts(postID),
		FOREIGN KEY(authorID)REFERENCES Users(id)
		);