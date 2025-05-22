import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IReview } from "@/interfaces/review";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

// Fetch reviews for a product
export async function fetchProductReviews(productId: string): Promise<IReview[]> {
  if (!productId) return [];
  
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("review")
    .select(`
      *,
      user:user_id (
        id,
        first_name,
        last_name,
        email,
        role,
        avatar_image_id,
        avatar_image:avatar_image_id (url)
      )
    `)
    .eq("product_id", productId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }

  return data || [];
}

// Get product average rating
export async function fetchProductRating(productId: string): Promise<{ average: number; count: number; distribution: number[] }> {
  if (!productId) return { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] };
  
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("review")
    .select("rating")
    .eq("product_id", productId)
    .is("deleted_at", null);

  if (error) {
    console.error("Error fetching reviews for rating:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    return { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] };
  }

  const ratings = data.map(review => review.rating);
  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  
  // Calculate distribution (1-5 stars)
  const distribution = [0, 0, 0, 0, 0];
  ratings.forEach(rating => {
    if (rating >= 1 && rating <= 5) {
      distribution[rating - 1]++;
    }
  });

  return {
    average,
    count: ratings.length,
    distribution
  };
}

// Check if user has purchased the product
export async function hasUserPurchasedProduct(productId: string): Promise<boolean> {
  const supabase = createClient();
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return false; // Not logged in
  }
  
  // Get user_id from public.user table
  const { data: userProfileData, error: profileError } = await supabase
    .from("user")
    .select("id")
    .eq("auth_user_id", userData.user.id)
    .single();
    
  if (profileError || !userProfileData) {
    return false;
  }

  // Check for completed orders with this product
  const { data, error } = await supabase
    .from("order")
    .select(`
      id,
      order_item!inner(
        product_id
      )
    `)
    .eq("user_id", userProfileData.id)
    .eq("order_item.product_id", productId)
    .not("status", "eq", "in_cart") // Only consider orders that are not in the cart state
    .is("deleted_at", null);

  if (error) {
    console.error("Error checking purchase history:", error);
    return false;
  }

  // Check if the admin is trying to add a review (admins can review without purchase)
  const { data: roleData, error: roleError } = await supabase
    .from("user")
    .select("role")
    .eq("id", userProfileData.id)
    .single();

  if (!roleError && roleData && ["superadmin", "admin"].includes(roleData.role)) {
    return true; // Admins can always review products
  }

  return data && data.length > 0;
}

// Add a review
export async function addReview(reviewData: {
  productId: string;
  rating: number;
  comment?: string;
  title?: string;
}): Promise<IReview> {
  const supabase = createClient();
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("User must be authenticated to add a review");
  }
  
  // Get user_id from public.user table
  const { data: userProfileData, error: profileError } = await supabase
    .from("user")
    .select("id, role")
    .eq("auth_user_id", userData.user.id)
    .single();
    
  if (profileError || !userProfileData) {
    throw new Error("User profile not found");
  }

  // Check if user has purchased the product (unless they are an admin)
  if (!["superadmin", "admin"].includes(userProfileData.role)) {
    const hasPurchased = await hasUserPurchasedProduct(reviewData.productId);
    if (!hasPurchased) {
      throw new Error("Solo puedes valorar productos que hayas comprado");
    }
  }

  const { data, error } = await supabase
    .from("review")
    .insert({
      product_id: reviewData.productId,
      user_id: userProfileData.id,
      rating: reviewData.rating,
      comment: reviewData.comment || null,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding review:", error);
    throw error;
  }

  return data;
}

// Delete a review (admin only or user's own review)
export async function deleteReview(reviewId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from("review")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", reviewId);

  if (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
}

// Check if user has reviewed a product
export async function hasUserReviewedProduct(productId: string): Promise<boolean> {
  const supabase = createClient();
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return false; // Not logged in
  }
  
  // Get user_id from public.user table
  const { data: userProfileData, error: profileError } = await supabase
    .from("user")
    .select("id")
    .eq("auth_user_id", userData.user.id)
    .single();
    
  if (profileError || !userProfileData) {
    return false;
  }

  const { data, error } = await supabase
    .from("review")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", userProfileData.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("Error checking if user reviewed product:", error);
    return false;
  }

  return !!data;
}

// React Query hooks
export function useProductReviews(productId: string) {
  return useQuery<IReview[], Error>({
    queryKey: ["product-reviews", productId],
    queryFn: () => fetchProductReviews(productId),
    enabled: !!productId,
  });
}

export function useProductRating(productId: string) {
  return useQuery<{ average: number; count: number; distribution: number[] }, Error>({
    queryKey: ["product-rating", productId],
    queryFn: () => fetchProductRating(productId),
    enabled: !!productId,
  });
}

export function useUserHasReviewed(productId: string) {
  return useQuery<boolean, Error>({
    queryKey: ["user-reviewed", productId],
    queryFn: () => hasUserReviewedProduct(productId),
    enabled: !!productId,
  });
}

export function useUserHasPurchased(productId: string) {
  return useQuery<boolean, Error>({
    queryKey: ["user-purchased", productId],
    queryFn: () => hasUserPurchasedProduct(productId),
    enabled: !!productId,
  });
}

export function useAddReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addReview,
    onSuccess: (_, variables) => {
      toast.success("Review added successfully!");
      queryClient.invalidateQueries({ queryKey: ["product-reviews", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["product-rating", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["user-reviewed", variables.productId] });
    },
    onError: (error) => {
      toast.error(`Error adding review: ${error.message}`);
    }
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reviewId, productId }: { reviewId: string; productId: string }) => deleteReview(reviewId),
    onSuccess: (_, variables) => {
      toast.success("Review deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["product-reviews", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["product-rating", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["user-reviewed", variables.productId] });
    },
    onError: (error) => {
      toast.error(`Error deleting review: ${error.message}`);
    }
  });
} 