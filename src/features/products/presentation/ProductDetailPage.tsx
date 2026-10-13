import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { ApiError, getErrorMessage } from '../data/api-error';
import { deleteProduct, getProduct } from '../data/products-api';
import { toProductView, type Product } from '../domain/product';
import EmptyState from './EmptyState';

/**
 * Pantalla: detalle de un producto (ruta /productos/:id).
 *
 * `useParams` lee el `:id` de la ruta; llega como TEXTO, así que se convierte con `Number(id)`.
 * Carga el producto con `getProduct` (`useState` + `useEffect`), maneja carga y error (el 404 se
 * muestra como «no encontrado») y permite editar o eliminar con una confirmación en pantalla.
 */
type LoadStatus = 'loading' | 'ready' | 'error';

const ProductDetailPage: React.FC = () => {
  const history = useHistory();
  const productId = Number(useParams<{ id: string }>().id);
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isNotFound, setIsNotFound] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadProduct = useCallback(async () => {
    setStatus('loading');
    try {
      setProduct(await getProduct(productId));
      setStatus('ready');
    } catch (error) {
      setIsNotFound(error instanceof ApiError && error.status === 404);
      setErrorMessage(getErrorMessage(error));
      setStatus('error');
    }
  }, [productId]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteProduct(productId);
      history.replace('/productos');
    } catch (error) {
      setDeleteError(getErrorMessage(error));
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  const view = product ? toProductView(product) : null;
  const stockColor = view?.isOutOfStock ? 'danger' : view?.isLowStock ? 'warning' : 'success';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/productos" />
          </IonButtons>
          <IonTitle>Detalle del producto</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {status === 'loading' && <p>Cargando producto…</p>}

        {status === 'error' &&
          (isNotFound ? (
            <EmptyState
              title="Producto no encontrado"
              message={errorMessage}
              actionLabel="Volver a la lista"
              onAction={() => history.replace('/productos')}
            />
          ) : (
            <EmptyState
              title="No se pudo cargar"
              message={errorMessage}
              actionLabel="Reintentar"
              onAction={() => void loadProduct()}
            />
          ))}

        {status === 'ready' && view && (
          <>
            <IonList>
              <IonItem>
                <IonLabel>Id</IonLabel>
                <IonText slot="end">{view.id}</IonText>
              </IonItem>
              <IonItem>
                <IonLabel>Nombre</IonLabel>
                <IonText slot="end">{view.name}</IonText>
              </IonItem>
              <IonItem>
                <IonLabel>Categoría</IonLabel>
                <IonText slot="end">{view.category}</IonText>
              </IonItem>
              <IonItem>
                <IonLabel>Precio</IonLabel>
                <IonText slot="end">{view.priceLabel}</IonText>
              </IonItem>
              <IonItem>
                <IonLabel>Stock</IonLabel>
                <IonText slot="end">{view.stock} unidades</IonText>
              </IonItem>
              <IonItem>
                <IonLabel>Disponibilidad</IonLabel>
                <IonBadge slot="end" color={stockColor}>
                  {view.stockLabel}
                </IonBadge>
              </IonItem>
            </IonList>

            {deleteError && (
              <IonText color="danger">
                <p>{deleteError}</p>
              </IonText>
            )}

            {isConfirmingDelete ? (
              <div className="ion-margin-top">
                <IonText>
                  <p>¿Eliminar este producto?</p>
                </IonText>
                <IonButton color="danger" disabled={isDeleting} onClick={() => void handleDelete()}>
                  {isDeleting ? 'Eliminando…' : 'Confirmar'}
                </IonButton>
                <IonButton fill="outline" disabled={isDeleting} onClick={() => setIsConfirmingDelete(false)}>
                  Cancelar
                </IonButton>
              </div>
            ) : (
              <div className="ion-margin-top">
                <IonButton routerLink={`/productos/${view.id}/editar`}>Editar</IonButton>
                <IonButton color="danger" fill="outline" onClick={() => setIsConfirmingDelete(true)}>
                  Eliminar
                </IonButton>
              </div>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductDetailPage;
