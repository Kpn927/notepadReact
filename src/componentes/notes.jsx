import { useState, useEffect } from 'react';
import '../componentescss/notes.css';

export default function NotesManager() {
    const [notes, setNotes] = useState([]);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [noteToDeleteId, setNoteToDeleteId] = useState(null);
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
                console.log("Datos recibidos del backend (fetchNotes):", data);

                if (!Array.isArray(data)) {
                    setError('La respuesta del servidor no es un formato de lista de notas válido.');
                    console.error('La respuesta del servidor no es un array:', data);
                    setNotes([]);
                    return;
                }

                const validNotes = data.filter(note =>
                    note && typeof note === 'object' && note.notas_id !== undefined && (note.content !== undefined)
                ).map(note => ({
                    id: note.notas_id,
                    content: note.content,
                    editingContent: note.content
                }));
                setNotes(validNotes);

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
                body: JSON.stringify({ content: newNoteContent, userId: currentUserId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! estado: ${response.status}: ${errorData.message || 'ERROR desconocido'}`);
            }

            const addedNote = await response.json();
            console.log("Nota añadida recibida del backend (handleAddNote):", addedNote);

            if (addedNote && addedNote.notas_id !== undefined && addedNote.content !== undefined) {
                setNotes((prevNotes) => [...prevNotes, {
                    id: addedNote.notas_id,
                    content: addedNote.content,
                    editingContent: addedNote.content
                }]);
                setNewNoteContent('');
            } else {
                setError('La nota devuelta por el servidor no tiene un ID válido (notas_id) o contenido.');
                console.error('Nota devuelta por el servidor sin ID o contenido válido:', addedNote);
            }

        } catch (err) {
            console.error('Error añadiendo la nota:', err);
            setError(`Fallo al crear la nota: ${err.message}. Por favor, intenta de nuevo.`);
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (noteId) => {
        setEditingNoteId(noteId);
    };

    const handleEditingContentChange = (noteId, newContent) => {
        setNotes((prevNotes) =>
            prevNotes.map((note) =>
                (note.id === noteId) ? { ...note, editingContent: newContent } : note
            )
        );
    };

    const handleSaveEdit = async (id) => {
        const noteToSave = notes.find(note => (note.id === id));
        if (!noteToSave || !noteToSave.editingContent.trim()) {
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
                body: JSON.stringify({ content: noteToSave.editingContent }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! estado: ${response.status}: ${errorData.message || 'ERROR desconocido'}`);
            }

            setNotes((prevNotes) =>
                prevNotes.map((note) =>
                    (note.id === id) ? { ...note, content: note.editingContent } : note
                )
            );
            setEditingNoteId(null);
        } catch (err) {
            console.error('Error guardando la nota:', err);
            setError(`Fallido a guardar la nota: ${err.message}. Por favor intenta de nuevo.`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = (noteId) => {
        setEditingNoteId(null);
        setNotes((prevNotes) =>
            prevNotes.map((note) =>
                (note.id === noteId) ? { ...note, editingContent: note.content } : note
            )
        );
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

            setNotes((prevNotes) => prevNotes.filter((note) => (note.id !== noteToDeleteId)));
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
                    <NoteDisplay
                        key={note.id}
                        note={note}
                        editingNoteId={editingNoteId}
                        loading={loading}
                        startEditing={startEditing}
                        handleEditingContentChange={handleEditingContentChange}
                        handleSaveEdit={handleSaveEdit}
                        handleCancelEdit={handleCancelEdit}
                        handleDeleteNote={handleDeleteNote}
                    />
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