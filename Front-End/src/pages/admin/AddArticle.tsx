import ArticlePageWrapper from "@/components/admin/articles/ArticlePageWrapper"; 

export default function AddArticle() {
  return (
    <ArticlePageWrapper
      mode="add"
      title="Thêm Bài Viết Mới"
      description="Điền thông tin chi tiết cho bài viết mới"
      successMessage="Thêm bài viết thành công"
      errorMessage="Không thể thêm bài viết"
      submitButtonText="Thêm bài viết"
    />
  );
}