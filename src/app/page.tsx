/* eslint-disable @typescript-eslint/no-explicit-any */
import { lucia, validateRequest } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Button from "./button";

export default async function Home() {
  const { session, user } = await validateRequest();

  if (!session || !user) {
    redirect("/login");
  }

  const isLoggedIn = session && user;
  return (
    <div>
      {isLoggedIn ? "Hello" : "Who are you?"}
      {isLoggedIn && <Button text="Logout" onClick={logout} />}
    </div>
  );
}

async function logout(): Promise<any> {
  "use server";

  const { session, user } = await validateRequest();

  if (!session || !user) {
    redirect("/");
  }

  if (session) {
    await lucia.invalidateSession(session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  }

  redirect("/");
}
