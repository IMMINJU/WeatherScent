import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WishlistProps {
  currentUser: number;
}

export default function Wishlist({ currentUser }: WishlistProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlist = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/wishlist", currentUser],
    enabled: !!currentUser,
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (perfumeId: number) => {
      const response = await apiRequest("DELETE", `/api/wishlist/${currentUser}/${perfumeId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist", currentUser] });
      toast({
        title: "찜목록에서 제거",
        description: "향수를 찜목록에서 제거했습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "오류 발생",
        description: "찜목록에서 제거 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleRemoveFromWishlist = (perfumeId: number) => {
    removeFromWishlistMutation.mutate(perfumeId);
  };

  return (
    <section id="wishlist" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
            내 찜목록
          </h3>
          <p className="text-lg text-gray-600">관심있는 향수들을 모아보세요</p>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4">찜목록을 불러오는 중...</p>
          </div>
        )}

        {!isLoading && wishlist.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-heart text-6xl mb-4"></i>
              <p className="text-xl font-semibold">찜한 향수가 없습니다</p>
              <p className="text-sm">마음에 드는 향수를 찜해보세요</p>
            </div>
          </div>
        )}

        {!isLoading && wishlist.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((item: any) => (
              <div key={item.id} className="warm-50 rounded-2xl p-4 text-center relative group">
                <button
                  onClick={() => handleRemoveFromWishlist(item.perfume.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
                
                <img 
                  src={item.perfume.image || "https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"} 
                  alt={`${item.perfume.brand} ${item.perfume.name}`}
                  className="w-full h-32 object-contain mb-4 rounded-lg"
                />
                <h5 className="font-semibold text-gray-800 mb-1">{item.perfume.name}</h5>
                <p className="text-sm text-gray-600 mb-3">{item.perfume.brand}</p>
                <div className="flex items-center justify-center mb-3">
                  <span className="text-xs text-accent font-medium px-2 py-1 warm-100 rounded-full">
                    {item.perfume.category}
                  </span>
                </div>
                <button className="w-full bg-gradient-to-r from-primary to-accent text-white py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all">
                  자세히 보기
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
