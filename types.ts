export interface Client {
  id: string;
  name: string;
  logo: {
    base64: string;
    mimeType: string;
  };
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  // Default Typography
  headerFontFamily: string;
  header1FontSize: number;
  header2FontSize: number;
  bodyFontFamily: string;
  descriptionFontSize: number;
  ctaFontFamily: string;
  ctaFontSize: number;
}

export interface AdFormData {
  adName: string;
  brief?: string;
  header1: string;
  header2?: string;
  description?: string;
  price?: string;
  salePrice?: string;
  backgroundImage?: File | string;
  productImage?: File | string;
  templateStyleImage?: File | string;
  recreateTemplate?: boolean;
  
  // Logo specific fields
  logoImage?: string | File;
  logoPosition?: { x: number, y: number };
  logoScale?: number;

  creativeStyle: string;
  characterStyle?: string;
  
  adSizes: string[];
  numberOfAds: number; // This is now derived from adSizes length
  adType: string;

  cta?: string;
  prompt?: string;

  // CTA Styling
  ctaTextColor?: string;
  ctaBackgroundColor?: string;
  ctaPadding?: number;
  ctaCornerRadius?: number;

  // Typography
  header1FontFamily?: string;
  header1FontSize?: number;
  header2FontFamily?: string;
  header2FontSize?: number;
  descriptionFontFamily?: string;
  descriptionFontSize?: number;
  priceFontFamily?: string;
  priceFontSize?: number;
  salePriceFontFamily?: string;
  salePriceFontSize?: number;
  ctaFontFamily?: string;
  ctaFontSize?: number;

  // Element positions and scales for editor
  header1Position?: { x: number, y: number };
  header1Scale?: number;
  header2Position?: { x: number, y: number };
  header2Scale?: number;
  descriptionPosition?: { x: number, y: number };
  descriptionScale?: number;
  pricePosition?: { x: number, y: number };
  priceScale?: number;
  salePricePosition?: { x: number, y: number };
  salePriceScale?: number;
  ctaPosition?: { x: number, y: number };
  ctaScale?: number;
  productImagePosition?: { x: number, y: number };
  productImageScale?: number;
}

export interface ImageFile {
  file: File;
  previewUrl: string;
}

export interface GeminiImagePart {
  inlineData: {
    data: string;
    mimeType: string;
  }
}

// For saving generated ads
export interface GeneratedAd {
  id: string;
  name: string;
  formData: AdFormData;
  imageUrls: string[];
  createdAt: string;
  folderId?: string;
}

// For template gallery
export interface AdTemplate {
  id: string;
  name: string;
  description: string;
  previewImage: string; // URL to a preview image
  formData: Partial<AdFormData>;
}

// New type for handling results from the generation service
export interface GeneratedAdResult {
  imageUrl: string;
  formData: AdFormData;
}

// New type for Folders
export interface Folder {
    id: string;
    name: string;
}

// New type for Settings
export interface Settings {
    defaultPrompt?: string;
    defaultCreativeStyle?: string;
    defaultCtaTextColor?: string;
    defaultCtaBackgroundColor?: string;
    defaultCtaPadding?: number;
    defaultCtaCornerRadius?: number;
}