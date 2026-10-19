export default function MenuCard({ item }) {
  return (
    <div className="py-3">
      <div className="flex items-start gap-4">
        
        {/* Item Name */}
        <span className="text-base sm:text-lg font-medium text-foreground break-words">
          {item.item_name}
        </span>
        <span aria-hidden="true" className="hidden sm:block flex-1 self-end mb-2 border-b-2 border-dotted border-primary/20" />

        {/* Price — always right */}
        <span className="ml-auto sm:ml-0 serif text-base sm:text-lg text-primary font-bold whitespace-nowrap">
           {item.price} ⓔ
        </span>

      </div>
    </div>
  )
}
