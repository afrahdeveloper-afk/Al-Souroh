
export type CurrentUser = {
  id: number;
  username: string;
};

export type ApiErrorBody = {
  detail?: string;
  [field: string]: unknown;
};

/** Thrown by every service-module call on a non-2xx response. */
export class ApiError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null) {
    super(ApiError.messageFrom(status, body));
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }

  private static messageFrom(status: number, body: ApiErrorBody | null): string {
    if (body?.detail) return body.detail;
    if (body) {
      const firstField = Object.keys(body)[0];
      const firstValue = firstField ? body[firstField] : undefined;
      if (Array.isArray(firstValue) && typeof firstValue[0] === 'string') {
        return `${firstField}: ${firstValue[0]}`;
      }
    }
    return `Request failed with status ${status}`;
  }
}

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type ListParams = {
  page?: number;
  search?: string;
};

export type ContactUs = {
  id: number;
  phone_number: string;
  whatsapp_number: string;
  google_map_link: string;
  /** Optional/nullable on the backend — not every record has one saved yet. */
  email: string | null;
  address: string;
  address_ar: string;
  work_days: string;
  /** Optional/nullable on the backend, unlike `work_days` — added alongside `email`. */
  work_days_ar: string | null;
  work_hours: string;
  instagram_user: string;
  facebook_user: string;
  tiktok_user: string;
};

export type ContactUsInput = Omit<ContactUs, 'id'>;

export type GeneralInformation = {
  id: number;
  main_title: string;
  main_title_ar: string;
  second_title: string;
  second_title_ar: string;
  description: string;
  description_ar: string;
  hero_img: string;
};

export type GeneralInformationInput = {
  main_title: string;
  main_title_ar: string;
  second_title: string;
  second_title_ar: string;
  description: string;
  description_ar: string;
  /** Omit to leave the current image untouched on an update. */
  hero_img?: File;
};

export type News = {
  id: number;
  news_title: string;
  news_title_ar: string;
  news_description: string;
  news_description_ar: string;
  news_content: string;
  news_content_ar: string;
  news_img: string;
  /** At most one News item is ever featured at a time; none is also valid. */
  is_featured: boolean;
};

export type NewsInput = {
  news_title: string;
  news_title_ar: string;
  news_description: string;
  news_description_ar: string;
  news_content: string;
  news_content_ar: string;
  /** Required on create; omit on update to keep the current image. */
  news_img?: File;
  /** Optional — omit to leave the current featured state untouched. */
  is_featured?: boolean;
};

export type ProjectCategory = {
  id: string;
  category_name: string;
  category_name_ar: string;
};

export type ProjectCategoryInput = {
  category_name: string;
  category_name_ar: string;
};

export type Project = {
  id: string;
  category: string;
  category_name: string;
  category_name_ar: string;
  project_name: string;
  project_name_ar: string;
  car_model: string;
  date: string;
  project_description: string;
  project_description_ar: string;
  cover_img: string | null;
  before_img: string | null;
  after_img: string | null;
};

export type ProjectInput = {
  category: string;
  project_name: string;
  project_name_ar: string;
  car_model: string;
  date: string;
  project_description: string;
  project_description_ar: string;
  /** Omit any of the three to leave that image untouched on an update. */
  cover_img?: File | null;
  before_img?: File | null;
  after_img?: File | null;
};

export type Service = {
  id: number;
  service_name: string;
  service_name_ar: string;
  service_description: string;
  service_description_ar: string;
  service_rank: string;
  service_rank_ar: string;
  /**
   * Display order of this service in the public site's service rail —
   * lower numbers come first (the backend's own field description). Not in
   * the `required` list on the schema, so an older record can come back
   * without it.
   */
  service_priority?: number;
  /** JSONField on the backend — this codebase always writes/reads string[]. */
  service_problems: string[];
  service_problems_ar: string[];
  service_procedures: string[];
  service_procedures_ar: string[];
  img: string;
};

export type ServiceInput = {
  service_name: string;
  service_name_ar: string;
  service_description: string;
  service_description_ar: string;
  service_rank: string;
  service_rank_ar: string;
  /** Optional on every write — omit to leave the backend's own default/current value. */
  service_priority?: number;
  service_problems: string[];
  service_problems_ar: string[];
  service_procedures: string[];
  service_procedures_ar: string[];
  /** Required on create; omit on update to keep the current image. */
  img?: File;
};


/** Field keys of one static-image group, in the order they're presented in the Dashboard. */
export const STATIC_IMAGE_FIELDS = {
  'home-page': [
    'first_step_image',
    'second_step_image',
    'third_step_image',
    'fourth_step_image',
    'story_image',
    'case_study_before_image',
    'case_study_after_image',
    'process_image_first',
    'process_image_second',
    'process_image_third',
    'process_image_fourth',
    'process_image_fifth',
    'process_image_sixth',
    'end_image',
  ],
  'about-us': [
    'main_image',
    'center_image_first',
    'center_image_second',
    'center_image_third',
    'center_image_fourth',
  ],
  services: ['main_image'],
  projects: ['main_image'],
  news: ['main_image'],
  'contact-us': ['main_image'],
} as const;

export type StaticImageGroupKey = keyof typeof STATIC_IMAGE_FIELDS;

export type HomePageImages = {
  id: number;
  first_step_image: string;
  second_step_image: string;
  third_step_image: string;
  fourth_step_image: string;
  story_image: string;
  case_study_before_image: string;
  case_study_after_image: string;
  process_image_first: string;
  process_image_second: string;
  process_image_third: string;
  process_image_fourth: string;
  process_image_fifth: string;
  process_image_sixth: string;
  end_image: string;
};

export type AboutUsImages = {
  id: number;
  main_image: string;
  center_image_first: string;
  center_image_second: string;
  center_image_third: string;
  center_image_fourth: string;
};

/** Services / Projects / News / Contact each hold exactly one hero image. */
export type SingleStaticImage = {
  id: number;
  main_image: string;
};

/** Maps a group key to the record shape its endpoint returns. */
export type StaticImageRecordMap = {
  'home-page': HomePageImages;
  'about-us': AboutUsImages;
  services: SingleStaticImage;
  projects: SingleStaticImage;
  news: SingleStaticImage;
  'contact-us': SingleStaticImage;
};

export type StaticImageRecord = StaticImageRecordMap[StaticImageGroupKey];

/** The write payload for a group: a `File` per field the admin actually picked. */
export type StaticImageInput<K extends StaticImageGroupKey = StaticImageGroupKey> = Partial<
  Record<(typeof STATIC_IMAGE_FIELDS)[K][number], File>
>;
