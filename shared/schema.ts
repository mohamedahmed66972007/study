import { pgTable, text, serial, integer, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Files table
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  subject: text("subject").notNull(), // 'arabic', 'english', 'math', etc.
  grade: text("grade").notNull(), // '10', '11', '12'
  semester: text("semester").notNull(), // '1', '2'
  filename: text("filename").notNull(),
  filepath: text("filepath").notNull(),
  filetype: text("filetype").notNull(), // 'pdf', 'docx', 'pptx', 'xlsx'
  filesize: integer("filesize").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Subjects table for reference
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(), // 'arabic', 'english', 'math', etc.
  displayName: varchar("display_name", { length: 100 }).notNull(), // 'اللغة العربية', 'اللغة الإنجليزية', etc.
});

// Grades table for reference
export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 10 }).notNull().unique(), // '10', '11', '12'
  displayName: varchar("display_name", { length: 100 }).notNull(), // 'الصف العاشر', 'الصف الحادي عشر', etc.
});

// Semesters table for reference
export const semesters = pgTable("semesters", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 10 }).notNull().unique(), // '1', '2'
  displayName: varchar("display_name", { length: 100 }).notNull(), // 'الفصل الأول', 'الفصل الثاني'
});

// Download counts table
export const downloadCounts = pgTable("download_counts", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").notNull().references(() => files.id, { onDelete: "cascade" }),
  count: integer("count").notNull().default(0),
});

// Schema validation for file insertion
export const insertFileSchema = createInsertSchema(files)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    subject: z.string().min(1, "يجب اختيار المادة"),
    grade: z.string().min(1, "يجب اختيار الصف الدراسي"),
    semester: z.string().min(1, "يجب اختيار الفصل الدراسي"),
    title: z.string().min(3, "العنوان يجب أن يحتوي على 3 أحرف على الأقل").max(100, "العنوان طويل جداً"),
    description: z.string().min(10, "الوصف يجب أن يحتوي على 10 أحرف على الأقل").max(500, "الوصف طويل جداً"),
  });

// Export types
export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type Subject = typeof subjects.$inferSelect;
export type Grade = typeof grades.$inferSelect;
export type Semester = typeof semesters.$inferSelect;
export type DownloadCount = typeof downloadCounts.$inferSelect;

// Extended types
export type FileWithRefs = File & {
  downloadCount: number;
  uploadDate: string;
};
