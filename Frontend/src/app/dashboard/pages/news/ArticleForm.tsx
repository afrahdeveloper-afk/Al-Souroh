import * as React from 'react';
import { useState } from 'react';
import { Save } from 'lucide-react';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { DialogFooter } from '../../../components/ui/dialog';
import { ImageDropzone } from '../../components/ImageDropzone';
import { useLang } from '../../../providers/LanguageProvider';
import type { News, NewsInput } from '../../types';

/**
 * Shared Add/Edit form body for News & Articles (figma-spec.md §6.4), wired
 * to the real `POST/PATCH /api/news/` endpoints (`services/news.ts`) instead
 * of the local `NewsArticle` mock shape. The real `News` schema
 * ("Souroh Dashboard API.yaml") is only six fields — id, title/title_ar,
 * description/description_ar, content/content_ar, img — so several fields
 * this form used to carry no longer exist anywhere in the backend:
 *
 * - Category: REMOVED. No `category` field on `News` at all (unlike
 *   Services/Projects, News has no taxonomy in the real schema). Keeping the
 *   old category `<Select>` would silently collect a value the API has
 *   nowhere to store, misleading the admin into thinking it was saved.
 * - Publish date: REMOVED. No `date`/`published_at` field either — same
 *   reasoning.
 * - Reading time: REMOVED. There is no `reading_time` field, and computing
 *   one client-side had nowhere to persist it, so the whole
 *   `estimateReadingMinutes` calculation this form used to do on submit is
 *   gone along with it.
 * - Featured: not a field on this form — it lives on the List screen's star
 *   toggle instead (`NewsListPage.tsx`), which is where the real
 *   `is_featured` boolean is actually set/cleared.
 *
 * The body/content field keeps its "one paragraph per line" textarea UX —
 * still the right authoring pattern even though the wire format changed —
 * but `news_content`/`news_content_ar` are each ONE string, not an array.
 * Lines are joined with `\n\n` on submit (`joinParagraphs`) and, for Edit,
 * the fetched single string is split back on `\n` and blank lines are
 * filtered (`splitToLines`) to reconstruct the multi-line textarea value.
 */
type ArticleFormProps = {
  initialArticle?: News | null;
  onSubmit: (input: NewsInput) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
};

/** Reconstructs the "one paragraph per line" textarea value from a fetched
 *  `\n\n`-joined API string — splitting on any newline and dropping blank
 *  lines collapses the double-newline paragraph separator back to one line
 *  per paragraph. */
function splitToLines(value: string): string {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

/** Inverse of `splitToLines` — one paragraph per authored line, joined with
 *  a blank line between paragraphs for `news_content`/`news_content_ar`. */
function joinParagraphs(value: string): string {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n\n');
}

export function ArticleForm({
  initialArticle,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ArticleFormProps) {
  const { t } = useLang();
  const isEditing = Boolean(initialArticle);

  const [titleEn, setTitleEn] = useState(initialArticle?.news_title ?? '');
  const [titleAr, setTitleAr] = useState(initialArticle?.news_title_ar ?? '');
  const [descriptionEn, setDescriptionEn] = useState(initialArticle?.news_description ?? '');
  const [descriptionAr, setDescriptionAr] = useState(initialArticle?.news_description_ar ?? '');
  const [contentEn, setContentEn] = useState(
    initialArticle ? splitToLines(initialArticle.news_content) : '',
  );
  const [contentAr, setContentAr] = useState(
    initialArticle ? splitToLines(initialArticle.news_content_ar) : '',
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialArticle?.news_img ?? null);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
    if (file) setImageError(null);
  };

  const submittingRef = React.useRef(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting || submittingRef.current) return;

    if (!isEditing && !imageFile) {
      setImageError(t('صورة الخبر مطلوبة', 'A news image is required'));
      return;
    }

    const input: NewsInput = {
      news_title: titleEn.trim(),
      news_title_ar: titleAr.trim(),
      news_description: descriptionEn.trim(),
      news_description_ar: descriptionAr.trim(),
      news_content: joinParagraphs(contentEn),
      news_content_ar: joinParagraphs(contentAr),
    };
    if (imageFile) input.news_img = imageFile;

    submittingRef.current = true;
    Promise.resolve(onSubmit(input)).finally(() => {
      submittingRef.current = false;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-dashboard-6">
      <div className="grid grid-cols-1 gap-dashboard-4 sm:grid-cols-2">
        <div className="flex flex-col gap-dashboard-2">
          <Label htmlFor="article-title-en">{t('العنوان (إنجليزي)', 'Title (English)')}</Label>
          <Input
            id="article-title-en"
            dir="ltr"
            lang="en"
            required
            disabled={isSubmitting}
            value={titleEn}
            onChange={(event) => setTitleEn(event.target.value)}
            placeholder="Article title"
          />
        </div>
        <div className="flex flex-col gap-dashboard-2">
          <Label htmlFor="article-title-ar">{t('العنوان (عربي)', 'Title (Arabic)')}</Label>
          <Input
            id="article-title-ar"
            dir="rtl"
            lang="ar"
            required
            disabled={isSubmitting}
            value={titleAr}
            onChange={(event) => setTitleAr(event.target.value)}
            placeholder="عنوان المقال"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-dashboard-4 sm:grid-cols-2">
        <div className="flex flex-col gap-dashboard-2">
          <Label htmlFor="article-summary-en">{t('الوصف المختصر (إنجليزي)', 'Short description (English)')}</Label>
          <Textarea
            id="article-summary-en"
            dir="ltr"
            lang="en"
            required
            disabled={isSubmitting}
            rows={3}
            value={descriptionEn}
            onChange={(event) => setDescriptionEn(event.target.value)}
            placeholder="Shown in the news & articles table"
          />
        </div>
        <div className="flex flex-col gap-dashboard-2">
          <Label htmlFor="article-summary-ar">{t('الوصف المختصر (عربي)', 'Short description (Arabic)')}</Label>
          <Textarea
            id="article-summary-ar"
            dir="rtl"
            lang="ar"
            required
            disabled={isSubmitting}
            rows={3}
            value={descriptionAr}
            onChange={(event) => setDescriptionAr(event.target.value)}
            placeholder="يظهر في جدول الأخبار والمقالات"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-dashboard-4 sm:grid-cols-2">
        <div className="flex flex-col gap-dashboard-2">
          <Label htmlFor="article-body-en">{t('نص المقال (إنجليزي)', 'Article body (English)')}</Label>
          <Textarea
            id="article-body-en"
            dir="ltr"
            lang="en"
            required
            disabled={isSubmitting}
            rows={6}
            value={contentEn}
            onChange={(event) => setContentEn(event.target.value)}
            placeholder="One paragraph per line"
          />
        </div>
        <div className="flex flex-col gap-dashboard-2">
          <Label htmlFor="article-body-ar">{t('نص المقال (عربي)', 'Article body (Arabic)')}</Label>
          <Textarea
            id="article-body-ar"
            dir="rtl"
            lang="ar"
            required
            disabled={isSubmitting}
            rows={6}
            value={contentAr}
            onChange={(event) => setContentAr(event.target.value)}
            placeholder="فقرة واحدة في كل سطر"
          />
        </div>
      </div>

      <ImageDropzone
        label={t('صورة الخبر / المقال', 'News / article image')}
        aspectRatio="4 / 3"
        value={imagePreview}
        onChange={handleImageChange}
        error={imageError ?? undefined}
        disabled={isSubmitting}
      />

      <DialogFooter>
        <Button type="button" variant="outline" size="dashboard" onClick={onCancel} disabled={isSubmitting}>
          {t('إلغاء', 'Cancel')}
        </Button>
        <Button type="submit" size="dashboard" disabled={isSubmitting}>
          <Save className="size-4" aria-hidden="true" />
          {isSubmitting ? t('جاري الحفظ...', 'Saving...') : t('حفظ', 'Save')}
        </Button>
      </DialogFooter>
    </form>
  );
}
