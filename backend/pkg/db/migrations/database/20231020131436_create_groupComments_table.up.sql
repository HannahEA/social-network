CREATE TABLE IF NOT EXISTS "GroupComments" ( 
			"commentID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
			"groupID" INTEGER NOT NULL,
            "postID" INTEGER NOT NULL,
			"authorID" INTEGER NOT NULL,
			"author" TEXT NOT NULL,
			"content" TEXT NOT NULL, 
			"creationDate" TIMESTAMP,
		FOREIGN KEY(postID)REFERENCES GroupPosts(postID),
        FOREIGN KEY(groupID)REFERENCES Groups(groupID),
		FOREIGN KEY(authorID)REFERENCES Users(id)
		);