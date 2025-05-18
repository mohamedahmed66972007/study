import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { FileFormValues, PaginationState } from "@/lib/types";
import { FileWithRefs } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export const useFiles = (filters: {
  subject?: string | null;
  grade?: string | null;
  semester?: string | null;
  search?: string | null;
  page?: number;
  pageSize?: number;
}) => {
  const { subject, grade, semester, search, page = 1, pageSize = 6 } = filters;
  
  // Build query string
  const queryParams = new URLSearchParams();
  if (subject) queryParams.append("subject", subject);
  if (grade) queryParams.append("grade", grade);
  if (semester) queryParams.append("semester", semester);
  if (search) queryParams.append("search", search);
  queryParams.append("page", page.toString());
  queryParams.append("pageSize", pageSize.toString());
  
  const queryString = queryParams.toString();
  const endpoint = `/api/files${queryString ? `?${queryString}` : ""}`;

  return useQuery<{ files: FileWithRefs[], pagination: PaginationState }>({
    queryKey: ["/api/files", subject, grade, semester, search, page, pageSize],
    retryDelay: 1000,
  });
};

export const useUploadFile = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/files", {
        method: "POST",
        body: data,
        credentials: "include",
        headers: {
          // لا نضيف Content-Type هنا لأن الفورم داتا تحدد ذلك تلقائياً
        }
      });
      
      if (!response.ok) {
        let errorMessage = "فشل في رفع الملف";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // إذا لم تكن الاستجابة JSON صالحة، نستخدم النص العادي
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({
        title: "تم رفع الملف بنجاح",
        description: "تم إضافة الملف إلى قاعدة البيانات",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في رفع الملف",
        description: error.message || "حدث خطأ أثناء رفع الملف",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteFile = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (fileId: number) => {
      await apiRequest("DELETE", `/api/files/${fileId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({
        title: "تم حذف الملف بنجاح",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "فشل في حذف الملف",
        description: "حدث خطأ أثناء حذف الملف",
        variant: "destructive",
      });
    },
  });
};
