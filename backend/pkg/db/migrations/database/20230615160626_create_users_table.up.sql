CREATE TABLE IF NOT EXISTS Users (
		"id" INTEGER PRIMARY KEY AUTOINCREMENT,
		"firstName" TEXT ,
		"lastName" TEXT,				
		"nickName" TEXT,
		"age" INTEGER,
		"gender" TEXT ,
		"email" TEXT NOT NULL UNIQUE, 
		"password" BLOB NOT NULL,
		"avatarURL" STRING,
		"imageFile" BLOB,
		"aboutMe" BLOB,
		"profileVisibility" TEXT,
		"created_at" TEXT DEFAULT (datetime('now', 'localtime'))
			);


