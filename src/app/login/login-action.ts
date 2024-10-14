"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import Database from "better-sqlite3";
import bcrypt from "bcrypt";
import { setCookies } from "@/auth";
import IUser from "../interfaces/user";

export default async function login(
  previousState: any,
  formData: FormData
): Promise<any> {
  const loginCredentials: ILoginCredentials = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const user = findUser(loginCredentials);

  if (!user) {
    return {
      error: "User could not be found.",
    };
  }

  const isCorrectPassword = await bcrypt.compare(
    loginCredentials.password,
    user.password
  );

  if (!isCorrectPassword) {
    return {
      error:
        "Incorrect password. Tough luck. You're now permanently locked out.",
    };
  }

  await setCookies(user.id);

  redirect("/");
}

function findUser(loginCredentials: ILoginCredentials): IUser | undefined {
  const db = new Database("./src/data/auth.db", {
    verbose: console.log, // Optional: Logs SQL queries to the console
  });

  try {
    // Prepare the SQL statement to select a user by email
    const getUser = db.prepare(`
      SELECT id, email, password FROM user WHERE email = ?
    `);

    // Execute the statement with the provided email and return the first result
    const result = getUser.get(loginCredentials.email);
    let user: IUser | undefined;

    if (result) {
      user = result as IUser;
      console.log("User found:", result);
    } else {
      console.log("User not found");
    }

    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return undefined;
  } finally {
    db.close();
  }
}
interface ILoginCredentials {
  email: string;
  password: string;
}
