
import Footer from "@/components/user/Footer/Footer";
import Header from "@/components/user/Header/Header";
import FloatingButtons from "@/components/user/FloatingButtons";
import { Outlet } from "react-router";

export default function UserLayout() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-100">
        <Outlet />
      </main>
      <FloatingButtons />
      <Footer />
    </>
  )
}
