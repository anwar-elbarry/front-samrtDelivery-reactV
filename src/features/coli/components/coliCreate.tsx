import { useState } from 'react';
import { useColi } from '../hooks/useColi';
import { useZones } from '../../zone';
import { useUsers } from '../../auth/hooks/useUsers';
import { Priority } from '../types/constants';
import type { ColisRequest } from '../types/component.request';
import type { ColiModel } from '../types/component.response';

interface ColiCreateProps {
  onSuccess?: (coli: ColiModel) => void;
  onCancel?: () => void;
  editColi?: ColiModel | null;
}

interface FormErrors {
  poids?: string;
  villeDestination?: string;
  clientExpediteurId?: string;
  general?: string;
}

// Helper to extract ID from object or string
const extractId = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return (value as { id?: string }).id || null;
  }
  return null;
};

const getInitialFormData = (editColi?: ColiModel | null): ColisRequest => {
  if (editColi) {
    return {
      poids: editColi.poids || 0,
      villeDestination: editColi.villeDestination || '',
      zoneId: extractId(editColi.zone),
      clientExpediteurId: extractId(editColi.clientExpediteur) || '',
      destinataireId: extractId(editColi.destinataire),
      priorite: editColi.priorite || Priority.MEDIUM,
    };
  }
  return {
    poids: 0,
    villeDestination: '',
    zoneId: null,
    clientExpediteurId: '',
    destinataireId: null,
    priorite: Priority.MEDIUM,
  };
};

// Inner component that receives the key for proper reset
function ColiCreateForm({ onSuccess, onCancel, editColi }: ColiCreateProps) {
  const { createColi, updateColi, isLoading, error, clearError } = useColi();
  const { zones, isLoading: zonesLoading } = useZones();
  const { expediteurs, destinataires, isLoading: usersLoading } = useUsers();
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<ColisRequest>(() => getInitialFormData(editColi));

  const isEditMode = !!editColi;

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.poids || formData.poids <= 0) {
      errors.poids = 'Weight must be greater than 0';
    }

    if (!formData.villeDestination?.trim()) {
      errors.villeDestination = 'Destination city is required';
    }

    if (!formData.clientExpediteurId?.trim()) {
      errors.clientExpediteurId = 'Sender client ID is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));

    // Clear specific field error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    let result: ColiModel | null = null;

    if (isEditMode && editColi?.id) {
      result = await updateColi(editColi.id, formData);
    } else {
      result = await createColi(formData);
    }

    if (result) {
      onSuccess?.(result);
      // Reset form if creating new
      if (!isEditMode) {
        setFormData({
          poids: 0,
          villeDestination: '',
          zoneId: null,
          clientExpediteurId: '',
          destinataireId: null,
          priorite: Priority.MEDIUM,
        });
      }
    }
  };

  const handleReset = () => {
    setFormData({
      poids: 0,
      villeDestination: '',
      zoneId: null,
      clientExpediteurId: '',
      destinataireId: null,
      priorite: Priority.MEDIUM,
    });
    setFormErrors({});
    clearError();
  };

  return (
    <div>
      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <i className="fa-solid fa-circle-exclamation text-red-500"></i>
            <span className="text-red-700 text-sm flex-1">{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weight */}
          <div>
            <label htmlFor="poids" className="block text-sm font-medium text-slate-700 mb-2">
              Weight (kg) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <i className="fa-solid fa-weight-scale absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="number"
                id="poids"
                name="poids"
                value={formData.poids}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  formErrors.poids ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
              />
            </div>
            {formErrors.poids && (
              <p className="mt-1 text-sm text-red-600">{formErrors.poids}</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priorite" className="block text-sm font-medium text-slate-700 mb-2">
              Priority
            </label>
            <div className="relative">
              <i className="fa-solid fa-flag absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <select
                id="priorite"
                name="priorite"
                value={formData.priorite || ''}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                {Object.values(Priority).map(priority => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
            </div>
          </div>

          {/* Destination City */}
          <div>
            <label htmlFor="villeDestination" className="block text-sm font-medium text-slate-700 mb-2">
              Destination City <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <i className="fa-solid fa-location-dot absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                id="villeDestination"
                name="villeDestination"
                value={formData.villeDestination}
                onChange={handleInputChange}
                placeholder="Enter destination city"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  formErrors.villeDestination ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
              />
            </div>
            {formErrors.villeDestination && (
              <p className="mt-1 text-sm text-red-600">{formErrors.villeDestination}</p>
            )}
          </div>

          {/* Zone */}
          <div>
            <label htmlFor="zoneId" className="block text-sm font-medium text-slate-700 mb-2">
              Zone
            </label>
            <div className="relative">
              <i className="fa-solid fa-map-marker-alt absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <select
                id="zoneId"
                name="zoneId"
                value={formData.zoneId || ''}
                onChange={handleInputChange}
                disabled={zonesLoading}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                <option value="">Sélectionner une zone</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.nome || zone.codePostal || zone.id}
                  </option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
            </div>
          </div>

          {/* Client Expéditeur */}
          <div>
            <label htmlFor="clientExpediteurId" className="block text-sm font-medium text-slate-700 mb-2">
              Expéditeur <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <select
                id="clientExpediteurId"
                name="clientExpediteurId"
                value={formData.clientExpediteurId}
                onChange={handleInputChange}
                disabled={usersLoading}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer transition-colors ${
                  formErrors.clientExpediteurId ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
              >
                <option value="">Sélectionner un expéditeur</option>
                {expediteurs.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.prenom} {user.nom} ({user.email})
                  </option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
            </div>
            {formErrors.clientExpediteurId && (
              <p className="mt-1 text-sm text-red-600">{formErrors.clientExpediteurId}</p>
            )}
          </div>

          {/* Destinataire */}
          <div>
            <label htmlFor="destinataireId" className="block text-sm font-medium text-slate-700 mb-2">
              Destinataire
            </label>
            <div className="relative">
              <i className="fa-solid fa-user-check absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <select
                id="destinataireId"
                name="destinataireId"
                value={formData.destinataireId || ''}
                onChange={handleInputChange}
                disabled={usersLoading}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                <option value="">Sélectionner un destinataire</option>
                {destinataires.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.prenom} {user.nom} ({user.email})
                  </option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Réinitialiser
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{isEditMode ? 'Modification...' : 'Création...'}</span>
              </>
            ) : (
              <>
                <i className={`fa-solid ${isEditMode ? 'fa-save' : 'fa-plus'}`}></i>
                <span>{isEditMode ? 'Modifier' : 'Créer le Colis'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Wrapper component that uses key to reset form state when editColi changes
export default function ColiCreate(props: ColiCreateProps) {
  // Use key to force remount when switching between create/edit or different edit items
  const key = props.editColi?.id || 'create-new';
  return <ColiCreateForm key={key} {...props} />;
}
