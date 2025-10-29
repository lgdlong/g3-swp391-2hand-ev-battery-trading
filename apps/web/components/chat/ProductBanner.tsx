import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

interface ProductBannerProps {
  product: {
    image: string;
    title: string;
    price: string;
  };
}

export default function ProductBanner({ product }: ProductBannerProps) {
  return (
    <Card className="mx-1 mb-4 py-0">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="relative w-12 h-12 shrink-0">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover rounded-md"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm leading-tight mb-1 line-clamp-2">{product.title}</h3>
            <p className="text-lg font-bold text-primary">{product.price}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
