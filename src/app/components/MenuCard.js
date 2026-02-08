export default function MenuCard({ item }) {
  return (
    <div className="py-3">
      <div className="flex items-start gap-4">
        
        {/* Item Name */}
        <span className="text-base sm:text-lg font-normal text-foreground break-words">
          {item.item_name}
        </span>

        {/* Price — always right */}
        <span className="ml-auto text-base sm:text-lg text-primary font-medium text-foreground whitespace-nowrap">
           {item.price} ⓔ
        </span>

      </div>
    </div>
  )
}
