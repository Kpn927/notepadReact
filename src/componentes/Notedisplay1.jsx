import { useState, useEffect } from 'react';
import '../componentescss/Notedisplay1.css';

const MAX_NOTE_LENGTH = 200;

export default function NotesManager1() {
    const [notes, setNotes] = useState([]);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [noteToDeleteId, setNoteToDeleteId] = useState(null);
    const [isNotePopupOpen, setIsNotePopupOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);

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
        const trimmedContent = newNoteContent.trim();
        if (!trimmedContent) {
            setError('El contenido de la nota no puede ser vacio.');
            return;
        }
        if (trimmedContent.length > MAX_NOTE_LENGTH) {
            setError(`La nota excede el límite de ${MAX_NOTE_LENGTH} caracteres.`);
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
                body: JSON.stringify({ content: trimmedContent, userId: currentUserId }),
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
        if (isNotePopupOpen && selectedNote && selectedNote.id === noteId) {
            setIsNotePopupOpen(false);
            setSelectedNote(null);
        }
    };

    const handleEditingContentChange = (noteId, newContent) => {
        setNotes((prevNotes) =>
            prevNotes.map((note) =>
                (note.id === noteId) ? { ...note, editingContent: newContent } : note
            )
        );
        if (selectedNote && selectedNote.id === noteId) {
            setSelectedNote(prevSelectedNote => ({ ...prevSelectedNote, editingContent: newContent }));
        }
    };

    const handleSaveEdit = async (id) => {
        const noteToSave = notes.find(note => (note.id === id));
        if (!noteToSave || !noteToSave.editingContent.trim()) {
            setError('Contenido de la nota no puede ser vacío.');
            return;
        }
        if (noteToSave.editingContent.length > MAX_NOTE_LENGTH) {
            setError(`La nota excede el límite de ${MAX_NOTE_LENGTH} caracteres.`);
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
            if (selectedNote && selectedNote.id === id) {
                setSelectedNote(prevSelectedNote => ({
                    ...prevSelectedNote,
                    content: noteToSave.editingContent,
                    editingContent: noteToSave.editingContent
                }));
            }
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
        if (selectedNote && selectedNote.id === noteId) {
            setSelectedNote(prevSelectedNote => ({ ...prevSelectedNote, editingContent: prevSelectedNote.content }));
        }
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
            if (selectedNote && selectedNote.id === noteToDeleteId) {
                closeNotePopup();
            }
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

    const handleViewNote = (note) => {
        setSelectedNote({ ...note });
        setIsNotePopupOpen(true);
        setEditingNoteId(null);
    };

    const closeNotePopup = () => {
        setIsNotePopupOpen(false);
        setSelectedNote(null);
        setEditingNoteId(null);
        setError('');
    };

    const handlePopupEdit = () => {
        if (selectedNote) {
            setEditingNoteId(selectedNote.id);
            const currentNoteInState = notes.find(n => n.id === selectedNote.id);
            if (currentNoteInState) {
                setSelectedNote(prevSelectedNote => ({
                    ...prevSelectedNote,
                    editingContent: currentNoteInState.editingContent
                }));
            }
        }
    };

    const handlePopupDelete = () => {
        if (selectedNote) {
            handleDeleteNote(selectedNote.id);
        }
    };

    const truncateContent = (content, maxLength) => {
        if (!content) return '';
        const previewLength = maxLength / 2;
        if (content.length <= previewLength) return content;
        return content.substring(0, previewLength) + '...';
    };


    return (
        <div className="notes-app-container">
            <div className="add-note-section">
                <div className="add-note-header">
                    <span className="add-note-icon">T</span>
                    <h1 className="add-note-title">Tus Notas</h1>
                </div>
                
                {error && (
                    <div className="message-error" role="alert">
                        <strong>Error: </strong>
                        <span>{error}</span>
                    </div>
                )}
                {loading && (
                    <div className="message-loading">
                        Cargando...
                    </div>
                )}

                <form onSubmit={handleAddNote} className="add-note-form">
                    <textarea
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        placeholder="Escribe una nueva nota..."
                        rows="3"
                        disabled={loading}
                        className="add-note-textarea"
                        maxLength={MAX_NOTE_LENGTH}
                        wrap="soft"
                    ></textarea>
                    <div className="char-counter">
                        {newNoteContent.length} / {MAX_NOTE_LENGTH}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="add-note-button"
                    >
                        Añadir Nota
                    </button>
                </form>
            </div>
            <div className="notes-grid-container">
                {notes.length === 0 && !loading && !error && (
                    <p className="no-notes-message">No hay notas, ¡añade una arriba!</p>
                )}
                {notes.map((note) => {
                    const noteIdToUse = note.id;
                    // console.log('Rendering note (notepad ID):', noteIdToUse, 'with content:', note.content, 'Full note object:', note);

                    if (noteIdToUse === undefined || noteIdToUse === null) {
                        console.warn('Nota sin ID válido (null/undefined) encontrada y omitida:', note);
                        return null;
                    }

                    return (
                        <div key={noteIdToUse} className="note-card">
                            {editingNoteId === noteIdToUse ? (
                                <div className="note-edit-mode">
                                    <textarea
                                        value={note.editingContent || ''}
                                        onChange={(e) => handleEditingContentChange(noteIdToUse, e.target.value)}
                                        rows="4"
                                        disabled={loading}
                                        className="note-edit-textarea"
                                        maxLength={MAX_NOTE_LENGTH}
                                        wrap="soft"
                                    ></textarea>
                                    <div className="char-counter">
                                        {note.editingContent.length} / {MAX_NOTE_LENGTH}
                                    </div>
                                    <div className="note-actions-group">
                                        <button
                                            onClick={() => handleSaveEdit(noteIdToUse)}
                                            disabled={loading}
                                            className="note-button-save"
                                        >
                                            Guardar
                                        </button>
                                        <button
                                            onClick={() => handleCancelEdit(noteIdToUse)}
                                            disabled={loading}
                                            className="note-button-cancel"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="note-display-mode">
                                    <p className="note-content-display">
                                        {truncateContent(note.content, MAX_NOTE_LENGTH)}
                                    </p>
                                    <div className="note-actions-group">
                                        <button
                                            onClick={() => handleViewNote(note)}
                                            disabled={loading}
                                            className="note-button-view"
                                        >
                                            Ver
                                        </button>
                                        <button
                                            onClick={() => startEditing(noteIdToUse)}
                                            disabled={loading}
                                            className="note-button-edit"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteNote(noteIdToUse)}
                                            disabled={loading}
                                            className="note-button-delete"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {isDeleteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className="modal-title">¿Seguro que quieres eliminar esta nota?</h2>
                        <p className="modal-message">Esta acción no se puede deshacer.</p>
                        <div className="modal-actions">
                            <button
                                className="modal-button-confirm"
                                onClick={confirmDelete}
                                disabled={loading}
                            >
                                Eliminar
                            </button>
                            <button
                                className="modal-button-cancel"
                                onClick={cancelDelete}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isNotePopupOpen && selectedNote && (
                <div className="modal-overlay">
                    <div className="note-popup-content">
                        <h2 className="note-popup-title">Nota Completa</h2>
                        {editingNoteId === selectedNote.id ? (
                            <div className="note-popup-edit-mode">
                                <textarea
                                    value={notes.find(n => n.id === selectedNote.id)?.editingContent || ''}
                                    onChange={(e) => handleEditingContentChange(selectedNote.id, e.target.value)}
                                    rows={
                                        Math.max(5, (notes.find(n => n.id === selectedNote.id)?.editingContent || '').split('\n').length + 2)
                                    }
                                    disabled={loading}
                                    className="note-popup-textarea"
                                    maxLength={MAX_NOTE_LENGTH}
                                    wrap="soft"
                                ></textarea>
                                <div className="char-counter">
                                    { (notes.find(n => n.id === selectedNote.id)?.editingContent || '').length } / {MAX_NOTE_LENGTH}
                                </div>
                                <div className="note-popup-actions-group">
                                    <button
                                        onClick={() => handleSaveEdit(selectedNote.id)}
                                        disabled={loading}
                                        className="note-button-save"
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => handleCancelEdit(selectedNote.id)}
                                        disabled={loading}
                                        className="note-button-cancel"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="note-popup-display-mode">
                                <p className="note-popup-text">{selectedNote.content}</p>
                                <div className="note-popup-actions-group">
                                    <button className="note-button-edit" onClick={handlePopupEdit} disabled={loading}>
                                        Editar
                                    </button>
                                    <button className="note-button-delete" onClick={handlePopupDelete} disabled={loading}>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        )}
                        <button className="note-popup-close-button" onClick={closeNotePopup}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}