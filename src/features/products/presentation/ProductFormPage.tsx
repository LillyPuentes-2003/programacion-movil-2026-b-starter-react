import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonLabel,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { ApiError, getErrorMessage } from '../data/api-error';
import { createProduct, getProduct, updateProduct } from '../data/products-api';
import { CATEGORIES, validateProduct, type ProductField, type ProductInput } from '../domain/product';
import EmptyState from './EmptyState';

/**
 * Pantalla: formulario de producto. La misma pantalla sirve para dos rutas:
 *  - /productos/nuevo          → crear (no hay `id` en la ruta)
 *  - /productos/:id/editar     → editar (hay `id`; se precargan los campos con `getProduct`)
 *
 * Cada campo es controlado: su valor vive en una variable de estado (`useState`) y `onIonInput`
 * la actualiza. Precio y stock se guardan como texto y se convierten a número al validar.
 * Al guardar se valida con `validateProduct()` (errores en línea, junto a cada campo); si el
 * servidor rechaza (ApiError 400), se muestran su mensaje y sus `details`.
 */
type LoadStatus = 'loading' | 'ready' | 'error';

/** Convierte el texto de un campo numérico en número (vacío → NaN, para que no valide). */
function toNumber(value: string): number {
  return value.trim() === '' ? Number.NaN : Number(value);
}

const ProductFormPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id?: string }>();
  const isEditing = id !== undefined;
  const productId = Number(id);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [status, setStatus] = useState<LoadStatus>(isEditing ? 'loading' : 'ready');
  const [loadError, setLoadError] = useState('');
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [serverDetails, setServerDetails] = useState<string[]>([]);

  // Modo editar: precarga los campos con el producto actual.
  useEffect(() => {
    if (!isEditing) return;
    let isActive = true;
    getProduct(productId)
      .then((product) => {
        if (!isActive) return;
        setName(product.name);
        setPrice(String(product.price));
        setCategory(product.category);
        setStock(String(product.stock));
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        setLoadError(getErrorMessage(error));
        setStatus('error');
      });
    return () => {
      isActive = false;
    };
  }, [isEditing, productId]);

  const input: ProductInput = { name: name.trim(), price: toNumber(price), category, stock: toNumber(stock) };
  // Validación en línea: después del primer intento de guardar, los errores se recalculan al escribir.
  const fieldErrors = hasTriedSubmit ? validateProduct(input).errors : {};

  const handleSave = async () => {
    setHasTriedSubmit(true);
    setServerError('');
    setServerDetails([]);
    if (!validateProduct(input).isValid) return;

    setIsSaving(true);
    try {
      if (isEditing) {
        await updateProduct(productId, input);
      } else {
        await createProduct(input);
      }
      history.replace('/productos');
    } catch (error) {
      setServerError(getErrorMessage(error));
      setServerDetails(error instanceof ApiError ? error.details : []);
    } finally {
      setIsSaving(false);
    }
  };

  const renderFieldError = (field: ProductField) =>
    fieldErrors[field] && (
      <IonText color="danger">
        <p className="ion-no-margin">{fieldErrors[field]}</p>
      </IonText>
    );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/productos" />
          </IonButtons>
          <IonTitle>{isEditing ? 'Editar producto' : 'Nuevo producto'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {status === 'loading' && <p>Cargando producto…</p>}

        {status === 'error' && (
          <EmptyState
            title="No se pudo cargar"
            message={loadError}
            actionLabel="Volver a la lista"
            onAction={() => history.replace('/productos')}
          />
        )}

        {status === 'ready' && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSave();
            }}
          >
            <IonInput
              label="Nombre"
              labelPlacement="floating"
              fill="outline"
              maxlength={60}
              value={name}
              onIonInput={(event) => setName(String(event.detail.value ?? ''))}
            />
            {renderFieldError('name')}

            <IonInput
              className="ion-margin-top"
              label="Precio (COP)"
              labelPlacement="floating"
              fill="outline"
              type="number"
              inputmode="decimal"
              value={price}
              onIonInput={(event) => setPrice(String(event.detail.value ?? ''))}
            />
            {renderFieldError('price')}

            <div className="ion-margin-top">
              <IonLabel>Categoría</IonLabel>
              <div>
                {CATEGORIES.map((item) => (
                  <IonButton
                    key={item}
                    size="small"
                    fill={category === item ? 'solid' : 'outline'}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </IonButton>
                ))}
              </div>
            </div>
            {renderFieldError('category')}

            <IonInput
              className="ion-margin-top"
              label="Stock (unidades)"
              labelPlacement="floating"
              fill="outline"
              type="number"
              inputmode="numeric"
              value={stock}
              onIonInput={(event) => setStock(String(event.detail.value ?? ''))}
            />
            {renderFieldError('stock')}

            {serverError && (
              <IonText color="danger">
                <p>
                  <strong>{serverError}</strong>
                </p>
                {serverDetails.length > 0 && (
                  <ul>
                    {serverDetails.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                )}
              </IonText>
            )}

            <IonButton className="ion-margin-top" expand="block" type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando…' : 'Guardar'}
            </IonButton>
          </form>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductFormPage;
