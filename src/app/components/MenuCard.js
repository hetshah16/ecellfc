import Image from "next/image"

export default function MenuCard({ item }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 group">

      {/* Content */}
      <div className="flex justify-between p-5 items-center">
        <h4 className="font-semibold text-foreground text-sm truncate">{item.item_name}</h4>
        <div className="flex items-center justify-between">
          <span className="text-md font-bold text-primary">{item.price} ⓔ</span>
        </div>
      </div>
    </div>
  )
}
