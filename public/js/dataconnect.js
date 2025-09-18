// dataconnect.js
import { getFirebaseDataConnect } from '@dataconnect/generated';

// Inicializa la conexión una sola vez y la exporta para que
// cualquier otro archivo en tu proyecto pueda usarla.
export const dc = getFirebaseDataConnect();