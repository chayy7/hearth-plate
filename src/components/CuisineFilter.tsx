import { cuisineFilters } from "@/data/mockData";
import { motion } from "framer-motion";

interface Props {
  selected: string;
  onSelect: (cuisine: string) => void;
}

const CuisineFilter = ({ selected, onSelect }: Props) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {cuisineFilters.map((cuisine) => (
        <button
          key={cuisine}
          onClick={() => onSelect(cuisine)}
          className={`relative whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            selected === cuisine
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          {cuisine}
        </button>
      ))}
    </div>
  );
};

export default CuisineFilter;
