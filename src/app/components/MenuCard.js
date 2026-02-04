export default function MenuCard({ item }) {
  return (
    <div className="py-3">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-6">
        
        {/* Item Name */}
        <span className="text-base sm:text-lg font-normal text-foreground break-words">
          {item.item_name}
        </span>

        {/* Price (never wraps / never shifts) */}
        <span className="text-base sm:text-lg font-medium text-foreground whitespace-nowrap">
          ₹ {item.price}
        </span>
      </div>
    </div>
  )
}
