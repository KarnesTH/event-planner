import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useEvents from '../../hooks/useEvents';

/**
 * EventModal component
 * @param {Object} event - The event
 * @param {Function} onClose - The function to close the modal
 * @param {boolean} isEdit - Whether the modal is in edit mode
 * @returns {JSX.Element} - The EventModal component
 */
const EventModal = ({ event, onClose, isEdit = false }) => {
    const navigate = useNavigate();
    const { createEvent, updateEvent } = useEvents();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        endDate: "",
        location: {
            name: "",
            address: {
                street: "",
                city: "",
                postalCode: "",
                country: "Deutschland"
            },
            coordinates: {
                type: "Point",
                coordinates: [0, 0]
            }
        },
        category: "Konzert",
        imageUrl: "/placeholder-image.svg",
        maxParticipants: null,
        tags: [],
        status: "draft",
        isPublic: true
    });

    const [tagInput, setTagInput] = useState("");
    const [errors, setErrors] = useState({});
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Geocode the address
     */
    const geocodeAddress = useCallback(async () => {
        const { street, city, postalCode, country } = formData.location.address;
        if (!city) return;

        setIsGeocoding(true);
        try {
            const query = [street, postalCode, city, country]
                .filter(Boolean)
                .join(", ");
            
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
                {
                    headers: {
                        'Accept-Language': 'de',
                        'User-Agent': 'EventPlanner/1.0'
                    }
                }
            );
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const coordinates = [Number(lon), Number(lat)];
                setFormData(prev => ({
                    ...prev,
                    location: {
                        ...prev.location,
                        coordinates: {
                            type: "Point",
                            coordinates
                        }
                    }
                }));
                setErrors(prev => ({ ...prev, geocoding: null }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    location: {
                        ...prev.location,
                        coordinates: {
                            type: "Point",
                            coordinates: [0, 0]
                        }
                    }
                }));
                setErrors(prev => ({
                    ...prev,
                    geocoding: "Adresse konnte nicht gefunden werden"
                }));
            }
        } catch (error) {
            console.error("Geocoding-Fehler:", error);
            setFormData(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    coordinates: {
                        type: "Point",
                        coordinates: [0, 0]
                    }
                }
            }));
            setErrors(prev => ({
                ...prev,
                geocoding: "Fehler beim Geocoding der Adresse"
            }));
        } finally {
            setIsGeocoding(false);
        }
    }, [formData.location.address]);

    useEffect(() => {
        const { street, city, postalCode } = formData.location.address;
        if (city && (street || postalCode)) {
            const timeoutId = setTimeout(geocodeAddress, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [formData.location.address.street, formData.location.address.city, formData.location.address.postalCode, geocodeAddress]);

    /**
     * Use effect to set the form data
     */
    useEffect(() => {
        if (event) {
            const coordinates = event.location?.coordinates?.coordinates || [0, 0];
            const eventData = {
                ...event,
                date: new Date(event.date).toISOString().slice(0, 16),
                endDate: new Date(event.endDate).toISOString().slice(0, 16),
                location: {
                    ...event.location,
                    coordinates: {
                        type: "Point",
                        coordinates: coordinates.map(Number)
                    }
                }
            }
            setFormData(eventData)
            if (event.imageUrl) {
                setImagePreview(event.imageUrl)
            }
        }
    }, [event])

    /**
     * Handle the change
     * @param {Event} e - The event
     */
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes(".")) {
            const [parent, child, grandChild] = name.split(".");
            setFormData(prev => {
                if (grandChild) {
                    return {
                        ...prev,
                        [parent]: {
                            ...prev[parent],
                            [child]: {
                                ...prev[parent][child],
                                [grandChild]: value
                            }
                        }
                    };
                } else {
                    return {
                        ...prev,
                        [parent]: {
                            ...prev[parent],
                            [child]: value
                        }
                    };
                }
            });
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === "checkbox" ? checked : 
                        type === "number" ? (value === "" ? null : Number(value)) : 
                        value
            }));
        }
    };

    const handleTagInputKeyDown = (e) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, tagInput.trim()]
                }));
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.title.trim()) newErrors.title = "Titel ist erforderlich";
        if (!formData.description.trim()) newErrors.description = "Beschreibung ist erforderlich";
        if (!formData.date) newErrors.date = "Startdatum ist erforderlich";
        if (!formData.endDate) newErrors.endDate = "Enddatum ist erforderlich";
        if (new Date(formData.endDate) <= new Date(formData.date)) {
            newErrors.endDate = "Enddatum muss nach dem Startdatum liegen";
        }
        if (!formData.location.name.trim()) newErrors["location.name"] = "Veranstaltungsort ist erforderlich";
        if (!formData.category) newErrors.category = "Kategorie ist erforderlich";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const formatEventData = (data) => {
        const [lng, lat] = data.location.coordinates.coordinates

        return {
            ...data,
            date: new Date(data.date).toISOString(),
            endDate: new Date(data.endDate).toISOString(),
            location: {
                name: data.location.name,
                address: data.location.address,
                coordinates: {
                    lat,
                    lng
                }
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        try {
            if (!validateForm()) {
                throw new Error('Bitte füllen Sie alle erforderlichen Felder aus')
            }

            if (isEdit && event) {
                const changedFields = {}
                
                if (formData.title !== event.title) changedFields.title = formData.title
                if (formData.description !== event.description) changedFields.description = formData.description
                if (formData.date !== event.date) changedFields.date = new Date(formData.date).toISOString()
                if (formData.endDate !== event.endDate) changedFields.endDate = new Date(formData.endDate).toISOString()
                if (formData.category !== event.category) changedFields.category = formData.category
                if (formData.imageUrl !== event.imageUrl) changedFields.imageUrl = formData.imageUrl
                if (formData.maxParticipants !== event.maxParticipants) changedFields.maxParticipants = formData.maxParticipants
                if (formData.status !== event.status) changedFields.status = formData.status
                if (formData.isPublic !== event.isPublic) changedFields.isPublic = formData.isPublic
                if (JSON.stringify(formData.tags) !== JSON.stringify(event.tags)) changedFields.tags = formData.tags

                const locationChanged = 
                    formData.location.name !== event.location.name || 
                    JSON.stringify(formData.location.address) !== JSON.stringify(event.location.address) ||
                    JSON.stringify(formData.location.coordinates) !== JSON.stringify(event.location.coordinates)

                if (locationChanged) {
                    const coordinates = [
                        Number(formData.location.coordinates.coordinates[0]),
                        Number(formData.location.coordinates.coordinates[1])
                    ]
                    
                    changedFields.location = {
                        name: formData.location.name,
                        address: formData.location.address,
                        coordinates: {
                            type: 'Point',
                            coordinates: coordinates
                        }
                    }
                }

                if (Object.keys(changedFields).length > 0) {
                    await updateEvent(event._id, changedFields)
                }
            } else {
                const submitData = formatEventData(formData)
                await createEvent(submitData)
            }
            
            onClose()
        } catch (err) {
            console.error('Submit-Fehler:', err)
            setError(err.response?.data?.message || err.message || 'Ein Fehler ist aufgetreten')
        } finally {
            setSubmitting(false)
        }
    }

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB
            setErrors(prev => ({
                ...prev,
                image: 'Bild darf nicht größer als 5MB sein'
            }));
            return;
        }

        if (!file.type.startsWith('image/')) {
            setErrors(prev => ({
                ...prev,
                image: 'Nur Bilddateien sind erlaubt'
            }));
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setErrors(prev => ({
                    ...prev,
                    image: 'Bitte melden Sie sich an, um Bilder hochzuladen'
                }));
                return;
            }

            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('http://localhost:5000/api/v1/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Fehler beim Hochladen des Bildes');
            }

            const data = await response.json();
            
            setImagePreview(`http://localhost:5000${data.url}`);
            setFormData(prev => ({
                ...prev,
                imageUrl: data.url
            }));
            setErrors(prev => ({ ...prev, image: null }));
        } catch (err) {
            console.error('Upload-Fehler:', err);
            setErrors(prev => ({
                ...prev,
                image: err.message || 'Fehler beim Hochladen des Bildes'
            }));
        }
    };

    const handleRemoveImage = async () => {
        try {
            const currentImageUrl = formData.imageUrl;
            if (currentImageUrl && currentImageUrl !== '/placeholder-image.svg') {
                const filename = currentImageUrl.split('/').pop();
                const token = localStorage.getItem('token');
                
                if (token) {
                    await fetch(`http://localhost:5000/api/v1/upload/${filename}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                }
            }

            setImagePreview(null);
            setFormData(prev => ({
                ...prev,
                imageUrl: '/placeholder-image.svg'
            }));
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            console.error('Fehler beim Löschen des Bildes:', err);
            setErrors(prev => ({
                ...prev,
                image: 'Fehler beim Löschen des Bildes'
            }));
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        const file = e.dataTransfer.files?.[0];
        if (file) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            if (fileInputRef.current) {
                fileInputRef.current.files = dataTransfer.files;
                handleImageChange({ target: { files: dataTransfer.files } });
            }
        }
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {isEdit ? "Event bearbeiten" : "Neues Event erstellen"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Bild-Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event-Bild
                            </label>
                            <div
                                className={`relative border-2 border-dashed rounded-lg p-4 text-center ${
                                    isDragging 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-300 hover:border-blue-500'
                                } transition-colors duration-200`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="image-upload"
                                />
                                
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview.startsWith('http') ? imagePreview : `http://localhost:5000${imagePreview}`}
                                            alt="Vorschau"
                                            className="mx-auto max-h-48 rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <div className="text-sm text-gray-600">
                                            <label
                                                htmlFor="image-upload"
                                                className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
                                            >
                                                Bild auswählen
                                            </label>
                                            {' '}oder per Drag & Drop hierher ziehen
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, GIF bis zu 5MB
                                        </p>
                                    </div>
                                )}
                            </div>
                            {errors.image && (
                                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                            )}
                        </div>

                        {/* Titel */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Titel
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-3 ${
                                    errors.title ? "border-red-500" : ""
                                }`}
                                placeholder="Titel des Events"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                            )}
                        </div>

                        {/* Beschreibung */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Beschreibung
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 ${
                                    errors.description ? "border-red-500" : ""
                                }`}
                                placeholder="Beschreibe dein Event..."
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        {/* Datum und Zeit */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                    Startdatum und -zeit
                                </label>
                                <input
                                    type="datetime-local"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-3 ${
                                        errors.date ? "border-red-500" : ""
                                    }`}
                                />
                                {errors.date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Enddatum und -zeit
                                </label>
                                <input
                                    type="datetime-local"
                                    id="endDate"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-3 ${
                                        errors.endDate ? "border-red-500" : ""
                                    }`}
                                />
                                {errors.endDate && (
                                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                                )}
                            </div>
                        </div>

                        {/* Veranstaltungsort */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="location.name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Veranstaltungsort
                                </label>
                                <input
                                    type="text"
                                    id="location.name"
                                    name="location.name"
                                    value={formData.location.name}
                                    onChange={handleChange}
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-3 ${
                                        errors["location.name"] ? "border-red-500" : ""
                                    }`}
                                    placeholder="z.B. Stadthalle, Restaurant, etc."
                                />
                                {errors["location.name"] && (
                                    <p className="mt-1 text-sm text-red-600">{errors["location.name"]}</p>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="location.address.street" className="block text-sm font-medium text-gray-700 mb-1">
                                        Straße
                                    </label>
                                    <input
                                        type="text"
                                        id="location.address.street"
                                        name="location.address.street"
                                        value={formData.location.address.street}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-3"
                                        placeholder="Straße und Hausnummer"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="location.address.city" className="block text-sm font-medium text-gray-700 mb-1">
                                        Stadt *
                                    </label>
                                    <input
                                        type="text"
                                        id="location.address.city"
                                        name="location.address.city"
                                        value={formData.location.address.city}
                                        onChange={handleChange}
                                        required
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-3"
                                        placeholder="Stadt"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="location.address.postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                                        Postleitzahl
                                    </label>
                                    <input
                                        type="text"
                                        id="location.address.postalCode"
                                        name="location.address.postalCode"
                                        value={formData.location.address.postalCode}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-3"
                                        placeholder="PLZ"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="location.address.country" className="block text-sm font-medium text-gray-700 mb-1">
                                        Land
                                    </label>
                                    <input
                                        type="text"
                                        id="location.address.country"
                                        name="location.address.country"
                                        value={formData.location.address.country}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-3"
                                        placeholder="Land"
                                    />
                                </div>
                            </div>
                            {isGeocoding && (
                                <p className="text-sm text-gray-500">Suche nach Adresse...</p>
                            )}
                            {errors.geocoding && (
                                <p className="text-sm text-red-600">{errors.geocoding}</p>
                            )}
                        </div>

                        {/* Kategorie und Teilnehmer */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                    Kategorie
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-3 ${
                                        errors.category ? "border-red-500" : ""
                                    }`}
                                >
                                    <option value="Konzert">Konzert</option>
                                    <option value="Workshop">Workshop</option>
                                    <option value="Networking">Networking</option>
                                    <option value="Sport">Sport</option>
                                    <option value="Kultur">Kultur</option>
                                    <option value="Andere">Andere</option>
                                </select>
                                {errors.category && (
                                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
                                    Maximale Teilnehmerzahl (optional)
                                </label>
                                <input
                                    type="number"
                                    id="maxParticipants"
                                    name="maxParticipants"
                                    value={formData.maxParticipants === null ? "" : formData.maxParticipants}
                                    onChange={handleChange}
                                    min="1"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-3"
                                    placeholder="z.B. 50"
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                                Tags
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    id="tags"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagInputKeyDown}
                                    placeholder="Tag eingeben und Enter drücken"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {formData.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-blue-200 focus:outline-none"
                                            >
                                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Status und Sichtbarkeit */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                    <option value="draft">Entwurf</option>
                                    <option value="published">Veröffentlicht</option>
                                    <option value="cancelled">Abgesagt</option>
                                    <option value="completed">Abgeschlossen</option>
                                </select>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    name="isPublic"
                                    checked={formData.isPublic}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                                    Öffentlich sichtbar
                                </label>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-end space-x-4 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Abbrechen
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {isEdit ? "Änderungen speichern" : "Event erstellen"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EventModal;