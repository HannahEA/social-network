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
		"loggedIn" TEXT,
		"created_at" TEXT DEFAULT (datetime('now', 'localtime'))
			);

--below code does not work:
-- -- Rename the table
-- ALTER TABLE "Users" RENAME TO "Users_temp";

-- -- Recreate the Users table with the added column
-- CREATE TABLE "Users" (
--     "id" INTEGER PRIMARY KEY AUTOINCREMENT,
--     "firstName" TEXT,
--     "lastName" TEXT,
--     "nickName" TEXT,
--     "age" INTEGER,
--     "gender" TEXT,
--     "email" TEXT NOT NULL UNIQUE,
--     "password" BLOB NOT NULL,
--     "avatarURL" STRING,
--     "imageFile" BLOB,
--     "aboutMe" BLOB,
--     "profileVisibility" TEXT,
--     "loggedIn" TEXT,
--     "created_at" TEXT DEFAULT (datetime('now', 'localtime'))
-- );

-- -- Copy data from the temporary table
-- INSERT INTO "Users" SELECT * FROM "Users_temp";

-- -- Drop the temporary table
-- DROP TABLE "Users_temp";



