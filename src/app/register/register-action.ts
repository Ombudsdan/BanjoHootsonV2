"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { setCookies } from "@/auth";
import IUser from "../interfaces/user";

export default async function register(
  previousState: any,
  formData: FormData
): Promise<any> {
  // Example usage
  const newUser: IUser = {
    id: uuidv4(),
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  try {
    saveUser(newUser);
  } catch {
    return {
      error: "whatever the error is",
    };
  }

  await setCookies(newUser.id);

  redirect("/");
}

// Function to save a user to the SQLite database
function saveUser(user: IUser) {
  // Open a connection to the database
  const db = new Database("./src/data/auth.db", {
    verbose: console.log, // Optional: Logs SQL queries to the console
  });

  // Hash the password
  const saltRounds = 10;
  const hashedPassword = bcrypt.hashSync(user.password, saltRounds);

  try {
    // Prepare the SQL statement for inserting a new user
    const insertUser = db.prepare(`
      INSERT INTO user (id, email, password) VALUES (?, ?, ?)
    `);

    // Execute the insert statement with the user data
    insertUser.run(user.id, user.email, hashedPassword);

    console.log("User saved successfully with hashed password.");
  } catch (error) {
    console.error("Error saving user:", error);
  } finally {
    db.close(); // Close the database connection
  }
}
