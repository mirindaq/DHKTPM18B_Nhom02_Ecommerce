import ArticleHeader from "@/components/user/Header/ArticleHeader";
import ArticleFooter from "@/components/user/Footer/ArticleFooter";
import { Outlet } from "react-router";

export default function ArticleLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <ArticleHeader />
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <ArticleFooter />
    </div>
  );
}
