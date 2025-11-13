import ArticlePageWrapper from "@/components/admin/articles/ArticlePageWrapper"; 

export default function EditArticle() {
  return (
    <ArticlePageWrapper
      mode="edit"
      title="Chỉnh Sửa Bài Viết"
      description="Chỉnh sửa thông tin chi tiết cho bài viết"
      successMessage="Cập nhật bài viết thành công"
      errorMessage="Không thể cập nhật bài viết"
      submitButtonText="Cập nhật bài viết"
    />
  );
}