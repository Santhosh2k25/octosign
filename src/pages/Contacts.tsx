import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, collection, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

const Contacts: React.FC = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    role: ''
  });

  // Fetch contacts from Firestore
  useEffect(() => {
    const fetchContacts = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const contactsRef = collection(db, 'users', user.id, 'contacts');
        const snapshot = await getDocs(contactsRef);
        
        const fetchedContacts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Contact[];
        
        setContacts(fetchedContacts);
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError('Failed to load contacts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContacts();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const contactsRef = collection(db, 'users', user.id, 'contacts');
      const newContact = {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await addDoc(contactsRef, newContact);
      
      // Refresh contacts list
      const snapshot = await getDocs(contactsRef);
      const fetchedContacts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contact[];
      
      setContacts(fetchedContacts);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('Error adding contact:', err);
      setError('Failed to add contact. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !selectedContact) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const contactRef = doc(db, 'users', user.id, 'contacts', selectedContact.id);
      const updatedContact = {
        ...formData,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(contactRef, updatedContact);
      
      // Update contacts list
      setContacts(prev => 
        prev.map(contact => 
          contact.id === selectedContact.id 
            ? { ...contact, ...updatedContact } 
            : contact
        )
      );
      
      setShowEditModal(false);
      setSelectedContact(null);
      resetForm();
    } catch (err) {
      console.error('Error updating contact:', err);
      setError('Failed to update contact. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!user?.id || !selectedContact) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const contactRef = doc(db, 'users', user.id, 'contacts', selectedContact.id);
      await deleteDoc(contactRef);
      
      // Update contacts list
      setContacts(prev => prev.filter(contact => contact.id !== selectedContact.id));
      setShowDeleteModal(false);
      setSelectedContact(null);
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('Failed to delete contact. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (contact: Contact) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      organization: contact.organization || '',
      role: contact.role || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (contact: Contact) => {
    setSelectedContact(contact);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      organization: '',
      role: ''
    });
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.organization && contact.organization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto mt-12 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Contacts</h1>
          <p className="text-neutral-600">Manage your contacts for document signing</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-700"></div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-1">No contacts found</h3>
              <p className="text-neutral-500 mb-4">Add your first contact to get started</p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn btn-outline flex items-center mx-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                            {contact.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900">{contact.name}</div>
                            <div className="text-sm text-neutral-500">{contact.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{contact.organization || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{contact.role || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{contact.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => openEditModal(contact)}
                          className="text-primary-700 hover:text-primary-900 mr-3"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(contact)}
                          className="text-error-600 hover:text-error-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-neutral-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">Add New Contact</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddContact}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 py-2 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 py-2 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1  py-2 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-neutral-700">
                    Organization
                  </label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="mt-1 py-2 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-neutral-700">
                    Role
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="mt-1 py-2 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary flex items-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-neutral-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">Edit Contact</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-neutral-400 hover:text-neutral-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditContact}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-neutral-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-email" className="block text-sm font-medium text-neutral-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="edit-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-phone" className="block text-sm font-medium text-neutral-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="edit-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-organization" className="block text-sm font-medium text-neutral-700">
                    Organization
                  </label>
                  <input
                    type="text"
                    id="edit-organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-role" className="block text-sm font-medium text-neutral-700">
                    Role
                  </label>
                  <input
                    type="text"
                    id="edit-role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary flex items-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Contact Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-neutral-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-neutral-900">Delete Contact</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-neutral-400 hover:text-neutral-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-neutral-700">
                Are you sure you want to delete <span className="font-medium">{selectedContact?.name}</span>? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteContact}
                disabled={isLoading}
                className="btn btn-error flex items-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts; 