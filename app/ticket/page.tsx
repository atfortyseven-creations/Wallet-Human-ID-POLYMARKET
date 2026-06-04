import { redirect } from "next/navigation";

export default function TicketPageFallback() {
  redirect("/dashboard");
}
