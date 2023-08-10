-- DROP TABLE IF EXISTS Users;
ALTER TABLE "Users" RENAME TO "Users_temp";
CREATE TABLE IF NOT EXISTS "Users" (
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
		"aboutMe" BLOB
        "profileVisibility" TEXT,
		"created_at" TEXT DEFAULT (datetime('now', 'localtime'))
			);
INSERT INTO "Users" SELECT * FROM "Users_temp";
DROP TABLE "Users_temp";