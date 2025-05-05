"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star, ThumbsUp, Flag } from "lucide-react";

interface Review {
  id: number;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  date: string;
  title: string;
  content: string;
  helpful: number;
  verified: boolean;
}

interface ProductReviewsProps {
  productId: number;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [sortBy, setSortBy] = useState("recent");
  const [helpfulReviews, setHelpfulReviews] = useState<number[]>([]);

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: 1,
      user: {
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      rating: 5,
      date: "2023-11-15",
      title: "Exceptional Quality and Design",
      content:
        "I've been using this hookah for a month now and I'm thoroughly impressed. The craftsmanship is outstanding, and the smoke quality is unmatched. The gold accents add a touch of luxury to my living room. Definitely worth the investment!",
      helpful: 12,
      verified: true,
    },
    {
      id: 2,
      user: {
        name: "Sarah Miller",
      },
      rating: 4,
      date: "2023-10-28",
      title: "Beautiful but Minor Issues",
      content:
        "The design is absolutely stunning and it draws very smoothly. I'm giving it 4 stars because the assembly instructions could be clearer. Once set up though, it works perfectly. The customer service was very helpful when I reached out with questions.",
      helpful: 8,
      verified: true,
    },
    {
      id: 3,
      user: {
        name: "Michael Chen",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      rating: 5,
      date: "2023-09-14",
      title: "A True Luxury Experience",
      content:
        "This hookah is a masterpiece. The attention to detail is remarkable, from the intricate engravings to the smooth finish. It's not just a smoking device, it's a piece of art. My friends are always impressed when they see it. The smoke is cool and smooth, and the flavor comes through perfectly.",
      helpful: 15,
      verified: true,
    },
    {
      id: 4,
      user: {
        name: "Emma Rodriguez",
      },
      rating: 3,
      date: "2023-08-22",
      title: "Good but Overpriced",
      content:
        "The quality is good and it looks beautiful, but I think it's a bit overpriced for what you get. The smoke quality is nice, but not significantly better than my previous hookah which cost half as much. The packaging and presentation were excellent though.",
      helpful: 5,
      verified: false,
    },
  ];

  // Calculate rating statistics
  const totalReviews = reviews.length;
  const averageRating =
    reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews;
  const ratingCounts = [0, 0, 0, 0, 0]; // 1 to 5 stars
  reviews.forEach((review) => {
    ratingCounts[review.rating - 1]++;
  });

  const handleHelpfulClick = (reviewId: number) => {
    if (!helpfulReviews.includes(reviewId)) {
      setHelpfulReviews([...helpfulReviews, reviewId]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-4xl font-bold text-white">
              {averageRating.toFixed(1)}
            </span>
            <div className="flex flex-col">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(averageRating)
                        ? "fill-gold-500 text-gold-500"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-400">
                Based on {totalReviews} reviews
              </span>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center">
                <div className="flex w-20 items-center">
                  <span className="mr-2 text-sm text-gray-400">
                    {star} star
                  </span>
                  <Star className="h-4 w-4 fill-gold-500 text-gold-500" />
                </div>
                <Progress
                  value={(ratingCounts[star - 1] / totalReviews) * 100}
                  className="h-2 flex-1"
                />
                <span className="ml-2 w-10 text-right text-sm text-gray-400">
                  {ratingCounts[star - 1]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Write Review CTA */}
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg bg-gray-900 p-6 text-center">
          <h3 className="text-xl font-bold text-white">
            Share Your Experience
          </h3>
          <p className="text-gray-400">
            Your feedback helps other customers make informed decisions
          </p>
          <Button className="mt-2 bg-gold-500 text-black hover:bg-gold-600">
            Write a Review
          </Button>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <h3 className="text-lg font-bold text-white">Customer Reviews</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-md border border-gray-700 bg-gray-900 px-2 py-1 text-sm text-white"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-8">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-800 pb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Avatar className="h-10 w-10 border border-gray-700">
                  {review.user.avatar ? (
                    <AvatarImage
                      src={review.user.avatar || "/placeholder.svg"}
                      alt={review.user.name}
                    />
                  ) : null}
                  <AvatarFallback className="bg-gray-800 text-white">
                    {review.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white">
                      {review.user.name}
                    </span>
                    {review.verified && (
                      <span className="rounded bg-green-900/30 px-1.5 py-0.5 text-xs text-green-400">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center space-x-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "fill-gold-500 text-gold-500"
                              : "text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <h4 className="mt-4 text-lg font-medium text-white">
              {review.title}
            </h4>
            <p className="mt-2 text-gray-400">{review.content}</p>
            <div className="mt-4 flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className={`text-sm ${
                  helpfulReviews.includes(review.id)
                    ? "text-gold-400"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => handleHelpfulClick(review.id)}
              >
                <ThumbsUp className="mr-1 h-4 w-4" />
                Helpful (
                {helpfulReviews.includes(review.id)
                  ? review.helpful + 1
                  : review.helpful}
                )
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-gray-400 hover:text-white"
              >
                <Flag className="mr-1 h-4 w-4" />
                Report
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center pt-4">
        <Button
          variant="outline"
          className="border-gray-700 text-white hover:bg-gray-800"
        >
          Load More Reviews
        </Button>
      </div>
    </div>
  );
}
