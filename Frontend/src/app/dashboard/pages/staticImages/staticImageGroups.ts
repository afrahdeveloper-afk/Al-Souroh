import {
  FolderOpen,
  Home as HomeIcon,
  Info,
  Newspaper,
  Phone,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';

import { STATIC_IMAGE_FIELDS, type StaticImageGroupKey } from '../../types';

/**
 * Presentation metadata for the six `/api/static-images/` singletons.
 *
 * The backend's field names (`process_image_fourth`, `center_image_second`,
 * ...) say nothing about where an image actually lands on the public site,
 * so every slot below carries a bilingual label naming its real position —
 * the Transformation step's own verb, the Process chapter's own title, the
 * gallery position — plus the aspect ratio that slot renders at, so the
 * preview frame in the Dashboard matches the crop a visitor will see.
 *
 * Field order is kept identical to STATIC_IMAGE_FIELDS (../types), the same
 * list the API module validates a first-ever create against — the dev-only
 * guard at the bottom of this file fails loudly if the two ever drift.
 */

export type StaticImageSlot = {
  field: string;
  labelAr: string;
  labelEn: string;
  /** Where this image appears on the public site. */
  hintAr: string;
  hintEn: string;
  aspectRatio: string;
};

export type StaticImageGroup = {
  key: StaticImageGroupKey;
  icon: LucideIcon;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  /** Column count for this group's slot grid at desktop width. */
  columns: 1 | 2 | 3 | 4;
  slots: StaticImageSlot[];
};

const HERO_HINT_AR = 'الصورة الكبيرة في أعلى الصفحة، خلف العنوان.';
const HERO_HINT_EN = 'The large image at the top of the page, behind the title.';

/** One 16:9 banner slot — Services / Projects / News / Contact all share this shape. */
function heroSlot(pageAr: string, pageEn: string): StaticImageSlot {
  return {
    field: 'main_image',
    labelAr: `غلاف صفحة ${pageAr}`,
    labelEn: `${pageEn} page banner`,
    hintAr: HERO_HINT_AR,
    hintEn: HERO_HINT_EN,
    aspectRatio: '16 / 9',
  };
}

export const STATIC_IMAGE_GROUPS: StaticImageGroup[] = [
  {
    key: 'home-page',
    icon: HomeIcon,
    titleAr: 'الصفحة الرئيسية',
    titleEn: 'Home page',
    descriptionAr:
      'صور المشاهد المتحرّكة في الصفحة الرئيسية: مراحل التحوّل، الحكاية، قبل وبعد، مراحل العمل، والمشهد الختامي.',
    descriptionEn:
      'The scroll scenes on the home page: the transformation steps, the story, before/after, the process chapters, and the closing scene.',
    columns: 3,
    slots: [
      {
        field: 'first_step_image',
        labelAr: 'التحوّل — الخطوة الأولى',
        labelEn: 'Transformation — step 1',
        hintAr: 'خلفية عبارة «نشخّصها.»',
        hintEn: 'Backdrop for “We diagnose it.”',
        aspectRatio: '16 / 9',
      },
      {
        field: 'second_step_image',
        labelAr: 'التحوّل — الخطوة الثانية',
        labelEn: 'Transformation — step 2',
        hintAr: 'خلفية عبارة «نحميها.»',
        hintEn: 'Backdrop for “We protect it.”',
        aspectRatio: '16 / 9',
      },
      {
        field: 'third_step_image',
        labelAr: 'التحوّل — الخطوة الثالثة',
        labelEn: 'Transformation — step 3',
        hintAr: 'خلفية عبارة «نستعيدها.»',
        hintEn: 'Backdrop for “We restore it.”',
        aspectRatio: '16 / 9',
      },
      {
        field: 'fourth_step_image',
        labelAr: 'التحوّل — الخطوة الرابعة',
        labelEn: 'Transformation — step 4',
        hintAr: 'خلفية عبارة «ونعيد تعريف تفاصيلها.»',
        hintEn: 'Backdrop for “We refine every detail.”',
        aspectRatio: '16 / 9',
      },
      {
        field: 'story_image',
        labelAr: 'الحكاية — صورة القسم',
        labelEn: 'The story — section image',
        hintAr: 'الصورة المؤطّرة بجانب نص حكاية 1989.',
        hintEn: 'The framed image beside the 1989 story copy.',
        aspectRatio: '3 / 4',
      },
      {
        field: 'case_study_before_image',
        labelAr: 'دراسة الحالة — قبل',
        labelEn: 'Case study — before',
        hintAr: 'الصورة الظاهرة قبل تمرير المسح.',
        hintEn: 'Shown before the scroll wipe.',
        aspectRatio: '16 / 9',
      },
      {
        field: 'case_study_after_image',
        labelAr: 'دراسة الحالة — بعد',
        labelEn: 'Case study — after',
        hintAr: 'الصورة الظاهرة بعد تمرير المسح.',
        hintEn: 'Shown after the scroll wipe.',
        aspectRatio: '16 / 9',
      },
      {
        field: 'process_image_first',
        labelAr: 'مراحل العمل — 01 الاستقبال والتوثيق',
        labelEn: 'Process — 01 Intake & documentation',
        hintAr: 'خلفية الفصل الأول من مراحل العمل.',
        hintEn: 'Backdrop for process chapter 01.',
        aspectRatio: '16 / 9',
      },
      {
        field: 'process_image_second',
        labelAr: 'مراحل العمل — 02 الفحص والتشخيص',
        labelEn: 'Process — 02 Inspection & diagnosis',
        hintAr: 'خلفية الفصل الثاني من مراحل العمل.',
        hintEn: 'Backdrop for process chapter 02.',
        aspectRatio: '16 / 9',
      },
      {
        field: 'process_image_third',
        labelAr: 'مراحل العمل — 03 شرح الحالة والموافقة',
        labelEn: 'Process — 03 Explanation & approval',
        hintAr: 'خلفية الفصل الثالث من مراحل العمل.',
        hintEn: 'Backdrop for process chapter 03.',
        aspectRatio: '16 / 9',
      },
      {
        field: 'process_image_fourth',
        labelAr: 'مراحل العمل — 04 التنفيذ',
        labelEn: 'Process — 04 Execution',
        hintAr: 'خلفية الفصل الرابع من مراحل العمل.',
        hintEn: 'Backdrop for process chapter 04.',
        aspectRatio: '16 / 9',
      },
      {
        field: 'process_image_fifth',
        labelAr: 'مراحل العمل — 05 مراجعة الجودة',
        labelEn: 'Process — 05 Quality control',
        hintAr: 'خلفية الفصل الخامس من مراحل العمل.',
        hintEn: 'Backdrop for process chapter 05.',
        aspectRatio: '16 / 9',
      },
      {
        field: 'process_image_sixth',
        labelAr: 'مراحل العمل — 06 التسليم والمتابعة',
        labelEn: 'Process — 06 Handover & follow-up',
        hintAr: 'خلفية الفصل السادس من مراحل العمل.',
        hintEn: 'Backdrop for process chapter 06.',
        aspectRatio: '16 / 9',
      },
      {
        field: 'end_image',
        labelAr: 'المشهد الختامي',
        labelEn: 'Closing scene',
        hintAr: 'خلفية المشهد الأخير في أسفل الصفحة الرئيسية.',
        hintEn: 'Backdrop of the final scene at the bottom of the home page.',
        aspectRatio: '16 / 9',
      },
    ],
  },
  {
    key: 'about-us',
    icon: Info,
    titleAr: 'من نحن',
    titleEn: 'About us',
    descriptionAr: 'الصورة الرئيسية لصفحة من نحن، إضافةً إلى صور معرض «من داخل المركز» الأربع.',
    descriptionEn:
      'The About page main image, plus the four photos of the “Inside the center” gallery.',
    columns: 4,
    slots: [
      {
        field: 'main_image',
        labelAr: 'الصورة الرئيسية',
        labelEn: 'Main image',
        hintAr: 'أول صورة في صفحة من نحن — بجانب فقرة «الإرث والهوية».',
        hintEn: 'The first photo on the About page, beside the “Legacy & Identity” chapter.',
        aspectRatio: '1 / 1',
      },
      {
        field: 'center_image_first',
        labelAr: 'من داخل المركز — 1',
        labelEn: 'Inside the center — 1',
        hintAr: 'الصورة الأولى في معرض نهاية الصفحة.',
        hintEn: 'First photo of the closing gallery.',
        aspectRatio: '1 / 1',
      },
      {
        field: 'center_image_second',
        labelAr: 'من داخل المركز — 2',
        labelEn: 'Inside the center — 2',
        hintAr: 'الصورة الثانية في معرض نهاية الصفحة.',
        hintEn: 'Second photo of the closing gallery.',
        aspectRatio: '1 / 1',
      },
      {
        field: 'center_image_third',
        labelAr: 'من داخل المركز — 3',
        labelEn: 'Inside the center — 3',
        hintAr: 'الصورة الثالثة في معرض نهاية الصفحة.',
        hintEn: 'Third photo of the closing gallery.',
        aspectRatio: '1 / 1',
      },
      {
        field: 'center_image_fourth',
        labelAr: 'من داخل المركز — 4',
        labelEn: 'Inside the center — 4',
        hintAr: 'الصورة الرابعة في معرض نهاية الصفحة.',
        hintEn: 'Fourth photo of the closing gallery.',
        aspectRatio: '1 / 1',
      },
    ],
  },
  {
    key: 'services',
    icon: SlidersHorizontal,
    titleAr: 'الخدمات',
    titleEn: 'Services',
    descriptionAr: 'صورة الغلاف في أعلى صفحة الخدمات.',
    descriptionEn: 'The banner at the top of the Services page.',
    columns: 1,
    slots: [heroSlot('الخدمات', 'Services')],
  },
  {
    key: 'projects',
    icon: FolderOpen,
    titleAr: 'المشاريع',
    titleEn: 'Projects',
    descriptionAr: 'صورة الغلاف في أعلى صفحة المشاريع.',
    descriptionEn: 'The banner at the top of the Projects page.',
    columns: 1,
    slots: [heroSlot('المشاريع', 'Projects')],
  },
  {
    key: 'news',
    icon: Newspaper,
    titleAr: 'الأخبار والمقالات',
    titleEn: 'News & Articles',
    descriptionAr: 'صورة الغلاف في أعلى صفحة الأخبار والمقالات.',
    descriptionEn: 'The banner at the top of the News & Articles page.',
    columns: 1,
    slots: [heroSlot('الأخبار والمقالات', 'News & Articles')],
  },
  {
    key: 'contact-us',
    icon: Phone,
    titleAr: 'تواصل معنا',
    titleEn: 'Contact us',
    descriptionAr: 'صورة الغلاف في أعلى صفحة التواصل.',
    descriptionEn: 'The banner at the top of the Contact page.',
    columns: 1,
    slots: [heroSlot('التواصل', 'Contact')],
  },
];

if (import.meta.env.DEV) {
  for (const group of STATIC_IMAGE_GROUPS) {
    const declared = STATIC_IMAGE_FIELDS[group.key] as readonly string[];
    const rendered = group.slots.map((slot) => slot.field);
    if (declared.length !== rendered.length || declared.some((f, i) => f !== rendered[i])) {
      console.error(
        `[staticImageGroups] "${group.key}" slots do not match STATIC_IMAGE_FIELDS`,
        { declared, rendered },
      );
    }
  }
}

export function findStaticImageGroup(key: string): StaticImageGroup | undefined {
  return STATIC_IMAGE_GROUPS.find((group) => group.key === key);
}
