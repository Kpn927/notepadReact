import { useState, useEffect } from 'react';
import '../componentescss/notes.css';

export default function NotesManager() {
    const [notes, setNotes] = useState([]);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editingNoteContent, setEditingNoteContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [noteToDeleteId, setNoteToDeleteId] = useState(null);

    const API_URL = 'http://localhost:5000/api/notes';
    const currentUserId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchNotes = async () => {
            if (!currentUserId) {
                setError('Sin UserID encontrado. Por favor, logeate para ver las notas.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');
            try {
                const response = await fetch(`http://localhost:5000/api/notes?userId=${currentUserId}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`HTTP error! Estado: ${response.status}: ${errorData.message || 'ERROR desconocido'}`);
                }
                const data = await response.json();
                setNotes(data);
            } catch (err) {
                console.error('Error haciendo el fetch:', err);
                setError(`intento fallido de cargar las notas: ${err.message}. Intenta de nuevo.`);
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, [currentUserId]);

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNoteContent.trim()) {
            setError('El contenido de la nota no puede ser vacio.');
            return;
        }
        if (!currentUserId) {
            setError('No se puede añadir nota: ID del usuario no econtrado. Logeate por favor.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:5000/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newNoteContent, user_id: currentUserId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! estado: ${response.status}: ${errorData.message || 'ERROR desconocido'}`);
            }

            const addedNote = await response.json();
            setNotes((prevNotes) => [...prevNotes, addedNote]);
            setNewNoteContent('');
        } catch (err) {
            console.error('Error añadiendo la nota:', err);
            setError(`Fallo al crear la nota: ${err.message}. Por favor, intenta de nuevo.`);
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (note) => {
        setEditingNoteId(note.id);
        setEditingNoteContent(note.content);
    };

    const handleSaveEdit = async (id) => {
        if (!editingNoteContent.trim()) {
            setError('Contenido de la nota no puede ser vacío.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`http://localhost:5000/api/notes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: editingNoteContent }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! estado: ${response.status}: ${errorData.message || 'ERROR desconocido'}`);
            }

            setNotes((prevNotes) =>
                prevNotes.map((note) =>
                    note.id === id ? { ...note, content: editingNoteContent } : note
                )
            );
            setEditingNoteId(null);
            setEditingNoteContent('');
        } catch (err) {
            console.error('Error guardando la nota:', err);
            setError(`Fallido a crear la nota: ${err.message}. Por favor intenta de nuevo.`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingNoteId(null);
        setEditingNoteContent('');
        setError('');
    };

    const handleDeleteNote = (id) => {
        setNoteToDeleteId(id);
        setIsDeleteModalOpen(true); 
    };

    const confirmDelete = async () => {
        if (!noteToDeleteId) {
            console.error('No hay nota con el id especificado para eliminar.');
            return;
        }

        setIsDeleteModalOpen(false);
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`http://localhost:5000/api/notes/${noteToDeleteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! estado: ${response.status}: ${errorData.message || 'ERROR desconocido'}`);
            }

            setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteToDeleteId));
            setNoteToDeleteId(null);
        } catch (err) {
            console.error('Error deleting note:', err);
            setError(`Algo fallo al borrar esta nota: ${err.message}. Por favor prueba otra vez.`);
        } finally {
            setLoading(false);
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setNoteToDeleteId(null);
        setError('');
    };

    return (
        <div className="notes-container">
            <h1>Your Notes</h1>

            {error && <div className="error-message">{error}</div>}
            {loading && <div className="loading-message">Cargando...</div>}

            <form onSubmit={handleAddNote} className="add-note-form">
                <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Escribe una nota..."
                    rows="4"
                    disabled={loading}
                ></textarea>
                <button type="submit" disabled={loading}>
                    Add Note
                </button>
            </form>

            <div className="notes-list">
                {notes.length === 0 && !loading && !error && (
                    <p className="no-notes-message">No hay notas, añade una arriba!</p>
                )}
                {notes.map((note) => (
                    <div key={note.id} className="note-item">
                        {editingNoteId === note.id ? (
                            <div className="edit-mode">
                                <textarea
                                    value={editingNoteContent}
                                    onChange={(e) => setEditingNoteContent(e.target.value)}
                                    rows="3"
                                    disabled={loading}
                                ></textarea>
                                <div className="edit-actions">
                                    <button onClick={() => handleSaveEdit(note.id)} disabled={loading}>
                                        Save
                                    </button>
                                    <button onClick={handleCancelEdit} disabled={loading}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="note-content">{note.content}</p>
                                <div className="note-actions">
                                    <button onClick={() => startEditing(note)} disabled={loading}>
                                        Edit
                                    </button>
                                    <button onClick={() => handleDeleteNote(note.id)} disabled={loading}>
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            {isDeleteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>¿Seguro que quieres eliminar esta nota?</h2>
                        <p>Esta acción no se puede deshacer.</p>
                        <div className="modal-actions">
                            <button className="confirm-button" onClick={confirmDelete} disabled={loading}>
                                Eliminar
                            </button>
                            <button className="cancel-button" onClick={cancelDelete} disabled={loading}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}