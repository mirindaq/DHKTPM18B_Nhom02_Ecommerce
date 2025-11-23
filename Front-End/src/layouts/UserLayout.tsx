
import Footer from "@/components/user/Footer/Footer";
import Header from "@/components/user/Header/Header";
import FloatingButtons from "@/components/user/FloatingButtons";
import { Outlet } from "react-router";

export default function UserLayout() {
  return (
    <>
      <Header />
      {/* <main style={{ backgroundImage: "url('/images/background.webp')" }}> */}
      <main className="min-h-screen my-10 mx-auto max-w-7xl bg-gray-100 rounded-lg shadow-sm">
        <Outlet />
      </main>
      <FloatingButtons />
      <Footer />
    </>
  )
}
