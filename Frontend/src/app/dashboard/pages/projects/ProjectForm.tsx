import { CalendarDays, Save } from "lucide-react";
import * as React from "react";
import { useId, useRef, useState } from "react";

import { Button } from "../../../components/ui/button";
import { DialogClose, DialogFooter } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { useLang } from "../../../providers/LanguageProvider";
import { ImageDropzone } from "../../components/ImageDropzone";
import type { ProjectCategory } from "./projectCategoriesStore";

/**
 * The Projects Add/Edit form body (figma-spec.md §6.3's 708×621.66 centered
 * modal, §1.5's "modal, not a route" pattern) — one component reused by
 * both Add and Edit inside `ProjectsListPage`'s `Dialog`, since Figma has
 * no distinct Edit design to diverge from (spec §1.6: Edit is pixel-
 * identical to Add except header copy). Pre-filling is handled by the
 * caller passing `initialValues`/`initialImages`; this component itself
 * has no notion of add-vs-edit beyond that.
 *
 * Rewired to the real API (`services/projects.ts`'s `ProjectInput`): the
 * date field is a real ISO `YYYY-MM-DD` (backend `format: date`), so the
 * control changed from `type="month"` to `type="date"` — the native input
 * already yields the right string shape, no parsing needed. The three
 * image fields now track the actual picked `File` alongside a preview URL
 * (`ImageDropzone`'s own `value` prop), instead of only ever holding a
 * `URL.createObjectURL` string as the "real" value — there is nothing to
 * upload a blob URL as. `onSubmit` receives the text values and the three
 * File-or-null picks separately; the caller (`ProjectsListPage`) only
 * includes a field in the API request when its File is non-null, so an
 * edit that doesn't touch a given photo leaves the existing one on the
 * server untouched. Clearing a dropzone (its own "X" remove button) resets
 * that field back to "not touched" (file → null) rather than signaling
 * "delete this image" — there is deliberately no remove-without-replace
 * affordance in this pass, only replace, per the task brief.
 *
 * `isSubmitting` is owned by the caller (`ProjectsListPage`, which awaits
 * the real create/update request), not this component — the exact same
 * split `ArticleForm`/`NewsListPage` already use. This form only disables
 * its own fields/buttons and swaps the submit label off of it; the caller
 * is what actually guards against a double request and keeps the dialog
 * open until the request settles.
 */
export type ProjectFormValues = {
  titleAr: string;
  titleEn: string;
  category: string;
  date: string;
  model: string;
  summaryAr: string;
  summaryEn: string;
};

export const EMPTY_PROJECT_FORM_VALUES: ProjectFormValues = {
  titleAr: "",
  titleEn: "",
  category: "",
  date: "",
  model: "",
  summaryAr: "",
  summaryEn: "",
};

export type ProjectImageFiles = {
  coverImage: File | null;
  beforeImage: File | null;
  afterImage: File | null;
};

const EMPTY_PROJECT_IMAGE_FILES: ProjectImageFiles = {
  coverImage: null,
  beforeImage: null,
  afterImage: null,
};

/** Existing, already-uploaded image URLs to preview on Edit (null = no image on that field yet). */
export type ProjectImagePreviews = {
  coverImage: string | null;
  beforeImage: string | null;
  afterImage: string | null;
};

type ProjectFormProps = {
  categories: ProjectCategory[];
  categoriesLoading?: boolean;
  initialValues?: ProjectFormValues;
  initialImages?: ProjectImagePreviews;
  onSubmit: (
    values: ProjectFormValues,
    images: ProjectImageFiles,
  ) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
};

export function ProjectForm({
  categories,
  categoriesLoading,
  initialValues,
  initialImages,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ProjectFormProps) {
  const { t } = useLang();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<ProjectFormValues>(
    initialValues ?? EMPTY_PROJECT_FORM_VALUES,
  );
  const [imageFiles, setImageFiles] = useState<ProjectImageFiles>(
    EMPTY_PROJECT_IMAGE_FILES,
  );
  const [imagePreviews, setImagePreviews] = useState<ProjectImagePreviews>({
    coverImage: initialImages?.coverImage ?? null,
    beforeImage: initialImages?.beforeImage ?? null,
    afterImage: initialImages?.afterImage ?? null,
  });

  const set = <K extends keyof ProjectFormValues>(
    key: K,
    value: ProjectFormValues[K],
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const setImage = (key: keyof ProjectImageFiles) => (file: File | null) => {
    setImageFiles((prev) => ({ ...prev, [key]: file }));
    setImagePreviews((prev) => ({
      ...prev,
      [key]: file ? URL.createObjectURL(file) : null,
    }));
  };

  const submittingRef = useRef(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting || submittingRef.current) return;
    submittingRef.current = true;
    Promise.resolve(onSubmit(values, imageFiles)).finally(() => {
      submittingRef.current = false;
    });
  };

  const openDatePicker = () => {
    const el = dateInputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else el.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-dashboard-6">
      <div className="grid gap-dashboard-4 sm:grid-cols-2">
        <Field label={t("اسم المشروع (عربي)", "Project Name (Arabic)")}>
          {(id) => (
            <Input
              id={id}
              dir="rtl"
              required
              value={values.titleAr}
              onChange={(event) => set("titleAr", event.target.value)}
            />
          )}
        </Field>
        <Field label={t("اسم المشروع (إنجليزي)", "Project Name (English)")}>
          {(id) => (
            <Input
              id={id}
              dir="ltr"
              required
              value={values.titleEn}
              onChange={(event) => set("titleEn", event.target.value)}
            />
          )}
        </Field>
      </div>

      <div className="grid gap-dashboard-4 sm:grid-cols-2">
        <Field label={t("نوع المشروع", "Project Type")}>
          {(id) => (
            <Select
              required
              value={values.category}
              onValueChange={(value) => set("category", value)}
              disabled={categoriesLoading}
            >
              <SelectTrigger id={id} size="dashboard" className="w-full">
                <SelectValue
                  placeholder={
                    categoriesLoading
                      ? t("جارٍ تحميل التصنيفات...", "Loading categories...")
                      : t("اختر التصنيف", "Select a category")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {t(category.ar, category.en)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Field>
        <Field label={t("تاريخ المشروع", "Project Date")}>
          {(id) => (
            <div className="relative" dir="ltr">
              <Input
                id={id}
                ref={dateInputRef}
                type="date"
                dir="ltr"
                required
                className="tabular-latin pe-9 [&::-webkit-calendar-picker-indicator]:hidden"
                value={values.date}
                onChange={(event) => set("date", event.target.value)}
              />
              <button
                type="button"
                onClick={openDatePicker}
                aria-label={t("فتح التقويم", "Open calendar")}
                className="absolute inset-y-0 end-0 flex w-9 items-center justify-center text-dashboard-primary outline-none"
              >
                <CalendarDays aria-hidden="true" className="size-4" />
              </button>
            </div>
          )}
        </Field>
      </div>

      <Field label={t("موديل المركبة", "Vehicle Model")}>
        {(id) => (
          <Input
            id={id}
            dir="ltr"
            required
            value={values.model}
            onChange={(event) => set("model", event.target.value)}
          />
        )}
      </Field>

      <div className="grid gap-dashboard-4 sm:grid-cols-2">
        <Field label={t("وصف مختصر (عربي)", "Short Description (Arabic)")}>
          {(id) => (
            <Textarea
              id={id}
              dir="rtl"
              required
              rows={3}
              value={values.summaryAr}
              onChange={(event) => set("summaryAr", event.target.value)}
            />
          )}
        </Field>
        <Field label={t("وصف مختصر (إنجليزي)", "Short Description (English)")}>
          {(id) => (
            <Textarea
              id={id}
              dir="ltr"
              required
              rows={3}
              value={values.summaryEn}
              onChange={(event) => set("summaryEn", event.target.value)}
            />
          )}
        </Field>
      </div>

      <div className="grid gap-dashboard-4 sm:grid-cols-3">
        <ImageDropzone
          label={t("صورة بعد", "After Photo")}
          value={imagePreviews.afterImage}
          onChange={setImage("afterImage")}
          disabled={isSubmitting}
        />
        <ImageDropzone
          label={t("صورة قبل", "Before Photo")}
          value={imagePreviews.beforeImage}
          onChange={setImage("beforeImage")}
          disabled={isSubmitting}
        />
        <ImageDropzone
          label={t("صورة الغلاف · 4:3", "Cover Photo · 4:3")}
          value={imagePreviews.coverImage}
          onChange={setImage("coverImage")}
          disabled={isSubmitting}
        />
      </div>

      <DialogFooter className="border-t border-dashboard-border pt-dashboard-6">
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            size="dashboard"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t("إلغاء", "Close")}
          </Button>
        </DialogClose>
        <Button type="submit" size="dashboard" disabled={isSubmitting}>
          <Save className="size-4" aria-hidden="true" />
          {isSubmitting ? t("جارٍ الحفظ...", "Saving...") : t("إتمام", "Complete")}
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * Label + control pairing, using the real `Label` primitive (auto-sized
 * EN/Lucida-11.2px vs AR/Lama-Medium-13px via dashboard-components.css's
 * existing `[data-slot="label"]` rules) rather than a hand-rolled span.
 */
function Field({
  label,
  children,
}: {
  label: string;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-dashboard-2">
      <Label htmlFor={id} className="text-dashboard-foreground-secondary">
        {label}
      </Label>
      {children(id)}
    </div>
  );
}
