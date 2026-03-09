import { describe, it, expect } from "vitest";
import { REVIEW_SCORING } from "@/data/mockData";

/**
 * Unit tests for the review scoring algorithm.
 * Mirrors the scoring logic in WriteReview.tsx.
 */

function calculateReviewPoints({
  wordCount,
  keywordCount,
  hasImage,
  tagCount,
  rating,
}: {
  wordCount: number;
  keywordCount: number;
  hasImage: boolean;
  tagCount: number;
  rating: number;
}) {
  let total = 0;

  for (const tier of REVIEW_SCORING.wordCount) {
    if (wordCount >= tier.threshold) total += tier.points;
  }

  total += Math.min(keywordCount, REVIEW_SCORING.keywords.maxCount) * REVIEW_SCORING.keywords.pointsEach;

  if (hasImage) total += REVIEW_SCORING.images.points;

  total += Math.min(tagCount, REVIEW_SCORING.helpfulTags.maxCount) * REVIEW_SCORING.helpfulTags.pointsEach;

  if (rating > 0) total += REVIEW_SCORING.rating.points;

  return total;
}

function getTier(points: number) {
  return points >= 35 ? "gold" : points >= 20 ? "silver" : points >= 5 ? "bronze" : "none";
}

describe("Review Scoring Algorithm", () => {
  it("returns 0 points for empty review with no rating", () => {
    const points = calculateReviewPoints({ wordCount: 0, keywordCount: 0, hasImage: false, tagCount: 0, rating: 0 });
    expect(points).toBe(0);
    expect(getTier(points)).toBe("none");
  });

  it("awards 5 points for rating only", () => {
    const points = calculateReviewPoints({ wordCount: 0, keywordCount: 0, hasImage: false, tagCount: 0, rating: 4 });
    expect(points).toBe(5);
    expect(getTier(points)).toBe("bronze");
  });

  it("awards word count points cumulatively at each threshold", () => {
    expect(calculateReviewPoints({ wordCount: 19, keywordCount: 0, hasImage: false, tagCount: 0, rating: 0 })).toBe(0);
    expect(calculateReviewPoints({ wordCount: 20, keywordCount: 0, hasImage: false, tagCount: 0, rating: 0 })).toBe(5);
    expect(calculateReviewPoints({ wordCount: 50, keywordCount: 0, hasImage: false, tagCount: 0, rating: 0 })).toBe(10);
    expect(calculateReviewPoints({ wordCount: 100, keywordCount: 0, hasImage: false, tagCount: 0, rating: 0 })).toBe(20);
  });

  it("awards keyword points capped at maxCount", () => {
    const points3 = calculateReviewPoints({ wordCount: 0, keywordCount: 3, hasImage: false, tagCount: 0, rating: 0 });
    expect(points3).toBe(6); // 3 * 2
    const points10 = calculateReviewPoints({ wordCount: 0, keywordCount: 10, hasImage: false, tagCount: 0, rating: 0 });
    expect(points10).toBe(10); // capped at 5 * 2
  });

  it("awards 15 bonus points for photo", () => {
    const withPhoto = calculateReviewPoints({ wordCount: 0, keywordCount: 0, hasImage: true, tagCount: 0, rating: 0 });
    const without = calculateReviewPoints({ wordCount: 0, keywordCount: 0, hasImage: false, tagCount: 0, rating: 0 });
    expect(withPhoto - without).toBe(15);
  });

  it("awards tag points capped at 3 tags", () => {
    const points2 = calculateReviewPoints({ wordCount: 0, keywordCount: 0, hasImage: false, tagCount: 2, rating: 0 });
    expect(points2).toBe(10); // 2 * 5
    const points5 = calculateReviewPoints({ wordCount: 0, keywordCount: 0, hasImage: false, tagCount: 5, rating: 0 });
    expect(points5).toBe(15); // capped at 3 * 5
  });

  it("calculates gold tier for a complete review", () => {
    // 100+ words (20) + 5 keywords (10) + photo (15) + 3 tags (15) + rating (5) = 65
    const points = calculateReviewPoints({ wordCount: 120, keywordCount: 5, hasImage: true, tagCount: 3, rating: 5 });
    expect(points).toBe(65);
    expect(getTier(points)).toBe("gold");
  });

  it("calculates silver tier correctly", () => {
    // 50+ words (10) + rating (5) + 1 tag (5) = 20
    const points = calculateReviewPoints({ wordCount: 50, keywordCount: 0, hasImage: false, tagCount: 1, rating: 3 });
    expect(points).toBe(20);
    expect(getTier(points)).toBe("silver");
  });
});
