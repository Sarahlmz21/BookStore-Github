import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useBooks } from "@/lib/books";
import BookCard from "@/components/BookCard";
import Newsletter from "@/components/Newsletter";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Book } from "@shared/schema";

export default function BooksPage() {
  const [searchParams] = new URLSearchParams(window.location.search);
  const categoryParam = searchParams.get("category");
  const newParam = searchParams.get("new") === "true";
  const bestsellerParam = searchParams.get("bestseller") === "true";
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

  const { data: books, isLoading, error } = useBooks(categoryParam || undefined);

  // Filter and sort books when data changes or filters change
  useEffect(() => {
    if (!books) return;

    let result = [...books];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        book => 
          book.title.toLowerCase().includes(term) || 
          book.author.toLowerCase().includes(term)
      );
    }

    // Sort books
    switch (sortOrder) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "title-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        // Default sorting
        break;
    }

    setFilteredBooks(result);
  }, [books, searchTerm, sortOrder]);

  // Generate page title based on filters
  const getPageTitle = () => {
    if (categoryParam) {
      switch (categoryParam) {
        case "fiction":
          return "Romans et Fiction";
        case "non-fiction":
          return "Non-fiction";
        case "jeunesse":
          return "Jeunesse";
        case "education":
          return "Éducation";
        default:
          return categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
      }
    }
    
    if (newParam) return "Nouveautés";
    if (bestsellerParam) return "Meilleures ventes";
    
    return "Tous nos livres";
  };

  return (
    <>
      <section className="py-8 bg-[#F8F5F0]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-center">
            {getPageTitle()}
          </h1>
        </div>
      </section>

      <section className="py-8 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
            <div className="md:w-1/2">
              <Input
                type="text"
                placeholder="Rechercher par titre ou auteur"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7D4427] focus:border-transparent"
              />
            </div>
            <div className="md:w-1/3">
              <Select
                value={sortOrder}
                onValueChange={(value) => setSortOrder(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Recommandé</SelectItem>
                  <SelectItem value="price-asc">Prix croissant</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant</SelectItem>
                  <SelectItem value="title-asc">Titre A-Z</SelectItem>
                  <SelectItem value="title-desc">Titre Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-80"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Une erreur s'est produite lors du chargement des livres.
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-8 text-[#504A45]">
              Aucun livre ne correspond à votre recherche.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Newsletter />
    </>
  );
}
