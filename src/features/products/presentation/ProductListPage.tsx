import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { getErrorMessage } from '../data/api-error';
import { getProducts } from '../data/products-api';
import { CATEGORIES, filterProducts, toProductView, type Product } from '../domain/product';
import EmptyState from './EmptyState';
import ProductCard from './ProductCard';

/**
 * Pantalla: lista de productos (ruta /productos).
 *
 *  - `useState` guarda los productos, el estado de la carga, el mensaje de error y los filtros;
 *  - `useEffect` con `[]` carga la lista UNA vez, al abrir la pantalla;
 *  - `useIonViewWillEnter` la recarga cuando la persona VUELVE a esta pantalla (Ionic mantiene la
 *    página en memoria, así que sin esto no se vería, por ejemplo, un producto recién creado);
 *  - los filtros (texto y categoría) se aplican en memoria con `filterProducts()`;
 *  - cuatro estados: cargando, vacío, sin resultados y error con «Reintentar».
 */
type LoadStatus = 'loading' | 'ready' | 'error';

/** Valor de la categoría «Todas» (sin filtro). */
const ALL_CATEGORIES = '';

const ProductListPage: React.FC = () => {
  const history = useHistory();
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const isLoadingRef = useRef(false);

  const loadProducts = useCallback(async () => {
    if (isLoadingRef.current) return; // evita pedir la lista dos veces a la vez
    isLoadingRef.current = true;
    setStatus('loading');
    try {
      setProducts(await getProducts());
      setStatus('ready');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setStatus('error');
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useIonViewWillEnter(() => {
    void loadProducts();
  });

  const clearFilters = () => {
    setSearch('');
    setCategory(ALL_CATEGORIES);
  };

  const visibleProducts = filterProducts(products, { search, category }).map(toProductView);
  const categoryOptions = [
    { label: 'Todas', value: ALL_CATEGORIES },
    ...CATEGORIES.map((item) => ({ label: item, value: item })),
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Productos</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/productos/nuevo">Nuevo</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="ion-padding">
          <IonInput
            label="Buscar por nombre"
            labelPlacement="floating"
            fill="outline"
            clearInput
            value={search}
            onIonInput={(event) => setSearch(String(event.detail.value ?? ''))}
          />
          <div className="ion-margin-top">
            {categoryOptions.map((option) => (
              <IonButton
                key={option.label}
                size="small"
                fill={category === option.value ? 'solid' : 'outline'}
                onClick={() => setCategory(option.value)}
              >
                {option.label}
              </IonButton>
            ))}
          </div>
        </div>

        {status === 'loading' && <p className="ion-padding">Cargando productos…</p>}

        {status === 'error' && (
          <EmptyState
            title="No se pudo cargar"
            message={errorMessage}
            actionLabel="Reintentar"
            onAction={() => void loadProducts()}
          />
        )}

        {status === 'ready' && products.length === 0 && (
          <EmptyState
            title="No hay productos"
            message="Todavía no hay productos en el catálogo."
            actionLabel="Crear producto"
            onAction={() => history.push('/productos/nuevo')}
          />
        )}

        {status === 'ready' && products.length > 0 && visibleProducts.length === 0 && (
          <EmptyState
            title="Sin resultados"
            message="Ningún producto coincide con la búsqueda o la categoría elegida."
            actionLabel="Limpiar filtros"
            onAction={clearFilters}
          />
        )}

        {status === 'ready' && visibleProducts.length > 0 && (
          <IonList>
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(id) => history.push(`/productos/${id}`)}
              />
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductListPage;
