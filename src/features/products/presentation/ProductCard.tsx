import { IonBadge, IonItem, IonLabel } from '@ionic/react';

import type { ProductView } from '../domain/product';

export interface ProductCardProps {
  product: ProductView;
  /** Se invoca con el id del producto cuando la persona toca la tarjeta. */
  onSelect?: (id: number) => void;
}

/**
 * Tarjeta reutilizable de un producto (se usa en la lista).
 *
 * Igual que `EmptyState`: las props se declaran en `ProductCardProps`, la opcional lleva `?` y el
 * componente solo muestra datos y avisa con `onSelect`, sin saber de dónde viene el producto.
 * La etiqueta de stock cambia de color: rojo si está agotado, amarillo si quedan pocas unidades.
 */
const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const stockColor = product.isOutOfStock ? 'danger' : product.isLowStock ? 'warning' : 'success';

  return (
    <IonItem button={onSelect !== undefined} detail={false} onClick={() => onSelect?.(product.id)}>
      <IonLabel>
        <h2>{product.name}</h2>
        <p>{product.category}</p>
        <p>
          <strong>{product.priceLabel}</strong> · {product.stock} unidades
        </p>
      </IonLabel>
      <IonBadge slot="end" color={stockColor}>
        {product.stockLabel}
      </IonBadge>
    </IonItem>
  );
};

export default ProductCard;
