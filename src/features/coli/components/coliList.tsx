import { useState, useEffect, useRef } from 'react';
import { useColi } from '../hooks/useColi';
import type { ColiModel } from '../types/component.response';
import { Statut, Priority } from '../types/constants';
import { Modal, useToast } from '../../../components/ui';
import ColiCreate from './coliCreate';

interface ColiListProps {
  onEdit?: (coli: ColiModel) => void;
  onCreateNew?: () => void;
}

const getStatusBadgeClass = (statut?: string): string => {
  switch (statut) {
    case Statut.CREATED:
      return 'bg-blue-100 text-blue-800';
    case Statut.COLLECTED:
      return 'bg-yellow-100 text-yellow-800';
    case Statut.IN_STOCK:
      return 'bg-purple-100 text-purple-800';
    case Statut.IN_TRANSIT:
      return 'bg-orange-100 text-orange-800';
    case Statut.DELIVERED:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityBadgeClass = (priority?: string): string => {
  switch (priority) {
    case Priority.HIGHT:
      return 'bg-red-100 text-red-800';
    case Priority.MEDIUM:
      return 'bg-yellow-100 text-yellow-800';
    case Priority.LOW:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatStatut = (statut?: string): string => {
  if (!statut) return 'N/A';
  return statut.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
};

export default function ColiList({ onEdit, onCreateNew }: ColiListProps) {
  const { colis, isLoading, error, deleteColi, updateColiStatus, fetchColis } = useColi();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingColi, setEditingColi] = useState<ColiModel | null>(null);
  const hasFetchedRef = useRef(false);

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    setEditingColi(null);
    showToast(
      editingColi ? 'Colis modifié avec succès!' : 'Colis créé avec succès!',
      'success'
    );
    fetchColis(); // Refresh the list
  };

  const handleOpenCreate = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      setEditingColi(null);
      setIsCreateModalOpen(true);
    }
  };

  const handleEdit = (coli: ColiModel) => {
    if (onEdit) {
      onEdit(coli);
    } else {
      setEditingColi(coli);
      setIsCreateModalOpen(true);
    }
  };

  // Fetch colis on mount
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchColis();
    }
  }, [fetchColis]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Ensure colis is always an array before filtering
  const colisList = Array.isArray(colis) ? colis : [];
  
  const filteredColis = colisList.filter(coli => {
    const matchesSearch = 
      coli.villeDestination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coli.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coli.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || coli.statut === statusFilter;
    const matchesPriority = !priorityFilter || coli.priorite === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleDelete = async (id: string) => {
    const success = await deleteColi(id);
    if (success) {
      setDeleteConfirmId(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateColiStatus(id, newStatus);
  };

  if (isLoading && colis.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Colis</h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage and track all your delivery Colis
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <i className="fa-solid fa-plus mr-2"></i>
            Nouveau Colis
          </button>
        </div>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingColi(null);
          }}
          title={editingColi ? 'Modifier le Colis' : 'Nouveau Colis'}
          size="xl"
        >
          <ColiCreate
            editColi={editingColi}
            onSuccess={handleCreateSuccess}
            onCancel={() => {
              setIsCreateModalOpen(false);
              setEditingColi(null);
            }}
          />
        </Modal>

        {/* Filters */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                placeholder="Search by destination, description, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">All Status</option>
            {Object.values(Statut).map(status => (
              <option key={status} value={status}>{formatStatut(status)}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">All Priority</option>
            {Object.values(Priority).map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
          <button
            onClick={() => fetchColis()}
            className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <i className="fa-solid fa-refresh text-slate-600"></i>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <i className="fa-solid fa-circle-exclamation text-red-500"></i>
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Package
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Destination
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Weight
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Assigned
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredColis.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <i className="fa-solid fa-box-open text-4xl text-slate-300"></i>
                    <p className="text-slate-500">No packages found</p>
                    {(searchTerm || statusFilter || priorityFilter) && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('');
                          setPriorityFilter('');
                        }}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredColis.map((coli) => (
                <tr key={coli.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="fa-solid fa-box text-blue-600"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          #{coli.id?.slice(0, 8) || 'N/A'}
                        </p>
                        <p className="text-xs text-slate-500 max-w-50 truncate">
                          {coli.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-location-dot text-slate-400"></i>
                      <span className="text-sm text-slate-700">
                        {coli.villeDestination || 'N/A'}
                      </span>
                    </div>
                    {coli.zone && (
                      <p className="text-xs text-slate-500 mt-1">
                        Zone: {typeof coli.zone === 'string' ? coli.zone : coli.zone.nome || coli.zone.id || 'N/A'}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-700">
                      {coli.poids ? `${coli.poids} kg` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={coli.statut || ''}
                      onChange={(e) => coli.id && handleStatusChange(coli.id, e.target.value)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${getStatusBadgeClass(coli.statut)}`}
                    >
                      {Object.values(Statut).map(status => (
                        <option key={status} value={status}>{formatStatut(status)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getPriorityBadgeClass(coli.priorite)}`}>
                      {coli.priorite || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {coli.livreur ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                          <i className="fa-solid fa-user text-xs text-slate-600"></i>
                        </div>
                        <span className="text-sm text-slate-700">
                          {typeof coli.livreur === 'string' 
                            ? coli.livreur 
                            : coli.livreur.user.prenom || coli.livreur.user.nom || coli.livreur.user.username || 'Assigned'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(coli)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      {deleteConfirmId === coli.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => coli.id && handleDelete(coli.id)}
                            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                            title="Confirm Delete"
                          >
                            <i className="fa-solid fa-check"></i>
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <i className="fa-solid fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(coli.id || null)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filteredColis.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-500">
            Showing {filteredColis.length} of {colisList.length} packages
          </p>
        </div>
      )}
    </div>
  );
}
