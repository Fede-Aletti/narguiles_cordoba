"use client";

import { useState, useEffect } from "react";
import { useProductReviews, useProductRating, useUserHasReviewed, useAddReview, useDeleteReview, useUserHasPurchased } from "@/lib/queries/review-queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star, ThumbsUp, Flag, Trash2, X, Lock } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { IReview } from "@/interfaces/review";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sortBy, setSortBy] = useState("recent");
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<{ id: string; role: string } | null>(null);

  // Fetch reviews and ratings
  const { 
    data: reviews = [], 
    isLoading: isLoadingReviews, 
    error: reviewsError 
  } = useProductReviews(productId);

  const { 
    data: ratingData = { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] }, 
    isLoading: isLoadingRating
  } = useProductRating(productId);

  const {
    data: hasUserReviewed = false,
    isLoading: isCheckingUserReview
  } = useUserHasReviewed(productId);

  const {
    data: userHasPurchased = false,
    isLoading: isCheckingPurchase
  } = useUserHasPurchased(productId);

  const addReviewMutation = useAddReview();
  const deleteReviewMutation = useDeleteReview();

  // Check user auth status as soon as component mounts
  useEffect(() => {
    checkUserAuth();
  }, []);

  // Check if user is logged in and get role
  const checkUserAuth = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      // Get user profile with role
      const { data: userData, error } = await supabase
        .from('user')
        .select('id, role')
        .eq('auth_user_id', user.id)
        .single();

      if (error || !userData) {
        console.error("Error fetching user data:", error);
        return false;
      }

      console.log("User role detected:", userData.role); // Debugging
      setCurrentUserData(userData);
      
      // Check if user is admin or superadmin
      const isAdmin = ['superadmin', 'admin'].includes(userData.role);
      console.log("Is admin?", isAdmin); // Debugging
      setIsUserAdmin(isAdmin);
      return true;
    } catch (error) {
      console.error("Error in checkUserAuth:", error);
      return false;
    }
  };

  // Handle opening review dialog
  const handleAddReviewClick = async () => {
    const isLoggedIn = await checkUserAuth();
    
    if (!isLoggedIn) {
      toast.error("Debes iniciar sesión para dejar una reseña");
      router.push(`/login?returnTo=${pathname}`);
      return;
    }

    if (hasUserReviewed) {
      toast.error("Ya has dejado una reseña para este producto");
      return;
    }

    if (!userHasPurchased && !isUserAdmin) {
      toast.error("Solo puedes valorar productos que hayas comprado");
      return;
    }

    setIsAddReviewOpen(true);
  };

  // Handle submitting review
  const handleSubmitReview = async () => {
    if (selectedRating < 1 || selectedRating > 5) {
      toast.error("Por favor selecciona una calificación válida (1-5 estrellas)");
      return;
    }

    setIsSubmitting(true);

    try {
      await addReviewMutation.mutateAsync({
        productId,
        rating: selectedRating,
        comment: reviewComment || undefined
      });

      setIsAddReviewOpen(false);
      setReviewComment("");
      setSelectedRating(5);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting a review
  const handleDeleteReview = async (reviewId: string) => {
    // Check auth status again to be sure
    await checkUserAuth();
    
    if (!currentUserData) {
      toast.error("No tienes permiso para realizar esta acción");
      return;
    }

    if (confirm("¿Estás seguro que deseas eliminar esta reseña?")) {
      try {
        await deleteReviewMutation.mutateAsync({ reviewId, productId });
      } catch (error) {
        console.error("Error deleting review:", error);
      }
    }
  };

  // Sort reviews based on selected option
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === "highest") {
      return b.rating - a.rating;
    } else if (sortBy === "lowest") {
      return a.rating - b.rating;
    }
    return 0;
  });

  // Filter reviews with comments for display
  const reviewsWithComments = sortedReviews.filter(review => review.comment);

  if (isLoadingReviews || isLoadingRating) {
    return <ReviewsSkeleton />;
  }

  // Force admin to always see delete buttons (debugging)
  const showAdminControls = isUserAdmin || (currentUserData?.role === 'superadmin');

  return (
    <div className="space-y-8">
      {/* Admin status indicator (for debugging) */}
      {showAdminControls && (
        <div className="bg-emerald-900/20 border border-emerald-800 rounded-md p-2 text-sm text-emerald-400">
          Acceso de administrador activado - Puedes eliminar cualquier reseña
        </div>
      )}
      
      {/* Rating Summary */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-4xl font-bold text-white">
              {ratingData.average.toFixed(1)}
            </span>
            <div className="flex flex-col">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(ratingData.average)
                        ? "fill-gold-500 text-gold-500"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-400">
                Basado en {ratingData.count} {ratingData.count === 1 ? "valoración" : "valoraciones"}
              </span>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center">
                <div className="flex w-20 items-center">
                  <span className="mr-2 text-sm text-gray-400">
                    {star} {star === 1 ? "estrella" : "estrellas"}
                  </span>
                  <Star className="h-4 w-4 fill-gold-500 text-gold-500" />
                </div>
                <Progress
                  value={ratingData.count > 0 ? (ratingData.distribution[star - 1] / ratingData.count) * 100 : 0}
                  className="h-2 flex-1"
                />
                <span className="ml-2 w-10 text-right text-sm text-gray-400">
                  {ratingData.distribution[star - 1]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Write Review CTA */}
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg bg-gray-900 p-6 text-center">
          <h3 className="text-xl font-bold text-white">
            Comparte tu Experiencia
          </h3>
          <p className="text-gray-400">
            Tu opinión ayuda a otros clientes a tomar decisiones informadas
          </p>
          
          {!userHasPurchased && !showAdminControls ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="mt-2 flex items-center justify-center space-x-2 rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-gray-400">
                    <Lock className="h-4 w-4 mr-2" />
                    <span>Compra este producto para poder valorarlo</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-gray-900 text-white border-gray-700">
                  <p>Solo los clientes que han comprado este producto pueden dejarlo una reseña</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button 
              className="mt-2 bg-gold-500 text-black hover:bg-gold-600"
              onClick={handleAddReviewClick}
              disabled={hasUserReviewed || isCheckingUserReview}
            >
              {hasUserReviewed ? "Ya has valorado este producto" : "Escribir una Reseña"}
            </Button>
          )}
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <h3 className="text-lg font-bold text-white">Opiniones de Clientes</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-md border border-gray-700 bg-gray-900 px-2 py-1 text-sm text-white"
          >
            <option value="recent">Más Recientes</option>
            <option value="highest">Mejor Valoradas</option>
            <option value="lowest">Peor Valoradas</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-8">
        {reviewsWithComments.length > 0 ? (
          reviewsWithComments.map((review) => (
            <div key={review.id} className="border-b border-gray-800 pb-8">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10 border border-gray-700">
                    {review.user?.avatar_image?.url ? (
                      <AvatarImage
                        src={review.user.avatar_image.url}
                        alt={`${review.user.first_name || ''} ${review.user.last_name || ''}`}
                      />
                    ) : null}
                    <AvatarFallback className="bg-gray-800 text-white">
                      {(review.user?.first_name?.[0] || '') + (review.user?.last_name?.[0] || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white">
                        {review.user ? `${review.user.first_name || ''} ${review.user.last_name || ''}` : 'Usuario Anónimo'}
                      </span>
                      <span className="rounded bg-green-900/30 px-1.5 py-0.5 text-xs text-green-400">
                        Compra Verificada
                      </span>
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
                        {new Date(review.created_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Always show delete button for admins */}
                {(showAdminControls || (currentUserData && currentUserData.id === review.user_id)) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-500"
                    onClick={() => handleDeleteReview(review.id)}
                    aria-label="Eliminar reseña"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                )}
              </div>

              <p className="mt-4 text-gray-400">{review.comment}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            No hay opiniones con comentarios para este producto aún.
            {ratingData.count > 0 && (
              <p className="mt-2">
                Este producto tiene {ratingData.count} {ratingData.count === 1 ? "valoración" : "valoraciones"} sin comentarios.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={isAddReviewOpen} onOpenChange={setIsAddReviewOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Valora este producto</DialogTitle>
            <DialogDescription className="text-gray-400">
              Comparte tu experiencia con otros usuarios.
            </DialogDescription>
          </DialogHeader>
          
          {/* Star Rating */}
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="flex justify-center space-x-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none"
                    onClick={() => setSelectedRating(star)}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= selectedRating
                          ? "fill-gold-500 text-gold-500"
                          : "text-gray-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-300">
                {selectedRating === 1 && "Malo"}
                {selectedRating === 2 && "Regular"}
                {selectedRating === 3 && "Bueno"}
                {selectedRating === 4 && "Muy Bueno"}
                {selectedRating === 5 && "Excelente"}
              </span>
            </div>
            
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
                Comentario (opcional)
              </label>
              <Textarea
                id="comment"
                placeholder="Comparte detalles de tu experiencia con este producto..."
                className="h-32 bg-gray-800 border-gray-700 text-white"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                Cancelar
              </Button>
            </DialogClose>
            <Button 
              className="bg-gold-500 text-black hover:bg-gold-600"
              onClick={handleSubmitReview}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar Valoración"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Skeleton loader for reviews
function ReviewsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-16 bg-gray-800" />
            <div className="flex flex-col">
              <Skeleton className="h-5 w-24 bg-gray-800 mb-1" />
              <Skeleton className="h-4 w-36 bg-gray-800" />
            </div>
          </div>
          
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-5 w-20 bg-gray-800 mr-2" />
                <Skeleton className="h-2 flex-1 bg-gray-800" />
                <Skeleton className="h-5 w-10 bg-gray-800 ml-2" />
              </div>
            ))}
          </div>
        </div>
        
        <Skeleton className="h-48 bg-gray-800 rounded-lg" />
      </div>
      
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40 bg-gray-800" />
        <Skeleton className="h-6 w-32 bg-gray-800" />
      </div>
      
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-b border-gray-800 pb-8">
            <div className="flex items-start space-x-4">
              <Skeleton className="h-10 w-10 rounded-full bg-gray-800" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32 bg-gray-800" />
                <Skeleton className="h-4 w-24 bg-gray-800" />
                <Skeleton className="h-4 w-full bg-gray-800 mt-4" />
                <Skeleton className="h-4 w-full bg-gray-800" />
                <Skeleton className="h-4 w-3/4 bg-gray-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
