import { Link2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandAssignmentTab, VariantAssignmentTab } from "@/components/admin/category-assignment";

export default function CategoryAssignment() {
  return (
    <div className="space-y-3 p-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Link2 className="h-6 w-6" />
            Liên kết Danh mục
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý liên kết giữa danh mục với thương hiệu và variant
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="brands" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="brands">Thương hiệu</TabsTrigger>
          <TabsTrigger value="variants">Variant</TabsTrigger>
        </TabsList>
        
        <TabsContent value="brands" className="mt-6">
          <BrandAssignmentTab />
        </TabsContent>
        
        <TabsContent value="variants" className="mt-6">
          <VariantAssignmentTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

