export interface GoogleReviewItem {
  id: string;
  authorName: string;
  rating: number;
  relativeTime: string;
  text: string;
  source: 'Google';
}

export interface GoogleReviewsPayload {
  overallRating: number | null;
  totalReviews: number | null;
  placeUrl: string | null;
  reviews: GoogleReviewItem[];
  isPlaceholder: boolean;
}

// Real Google reviews should be loaded through the Google Business Profile API
// or Google Places API. Do not scrape Google review pages.
import { businessInfo } from '@/data/businessInfo';

export const googleReviewsData: GoogleReviewsPayload = {
  overallRating: null,
  totalReviews: null,
  placeUrl: businessInfo.mapsUrl,
  reviews: [],
  isPlaceholder: true,
};

