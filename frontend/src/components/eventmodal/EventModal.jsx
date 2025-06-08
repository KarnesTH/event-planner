import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const EventModal = ({ event, onClose, onSubmit, isEdit = false }) => {
    const navigate = useNavigate();
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
        imageUrl: "/placeholder-event.jpg",
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

    useEffect(() => {
        if (event) {
            setFormData({
                ...event,
                date: new Date(event.date).toISOString().slice(0, 16),
                endDate: new Date(event.endDate).toISOString().slice(0, 16)
            });
            if (event.imageUrl) {
                setImagePreview(event.imageUrl);
            }
        }
    }, [event]);

    // Geocoding-Funktion
    const geocodeAddress = async () => {
        const { street, city, postalCode, country } = formData.location.address;
        if (!city) return; // Mindestens Stadt ist erforderlich

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
                setFormData(prev => ({
                    ...prev,
                    location: {
                        ...prev.location,
                        coordinates: {
                            type: "Point",
                            coordinates: [parseFloat(lon), parseFloat(lat)]
                        }
                    }
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    geocoding: "Adresse konnte nicht gefunden werden"
                }));
            }
        } catch (error) {
            console.error("Geocoding-Fehler:", error);
            setErrors(prev => ({
                ...prev,
                geocoding: "Fehler beim Geocoding der Adresse"
            }));
        } finally {
            setIsGeocoding(false);
        }
    };

    // Geocoding bei Adressänderungen
    useEffect(() => {
        const { street, city, postalCode } = formData.location.address;
        if (city && (street || postalCode)) {
            const timeoutId = setTimeout(geocodeAddress, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [formData.location.address.street, formData.location.address.city, formData.location.address.postalCode]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            if (isGeocoding) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Bereite die Daten für das Backend vor
            const submitData = {
                ...formData,
                maxParticipants: formData.maxParticipants === "" ? null : Number(formData.maxParticipants),
                location: {
                    ...formData.location,
                    coordinates: {
                        lat: formData.location.coordinates.coordinates[1],
                        lng: formData.location.coordinates.coordinates[0]
                    }
                }
            };

            // Entferne leere Adressfelder
            if (!submitData.location.address.street) delete submitData.location.address.street;
            if (!submitData.location.address.city) delete submitData.location.address.city;
            if (!submitData.location.address.postalCode) delete submitData.location.address.postalCode;
            if (!submitData.location.address.country) delete submitData.location.address.country;

            // Entferne die Koordinaten, wenn sie nicht gültig sind
            if (isNaN(submitData.location.coordinates.lat) || isNaN(submitData.location.coordinates.lng)) {
                delete submitData.location.coordinates;
            }

            await onSubmit(submitData);
            onClose();
            if (!isEdit) {
                navigate("/events");
            }
        } catch (error) {
            setErrors({ submit: error.message });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
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

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData(prev => ({
                    ...prev,
                    imageUrl: reader.result
                }));
            };
            reader.readAsDataURL(file);
            setErrors(prev => ({ ...prev, image: null }));
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
                                            src={imagePreview}
                                            alt="Vorschau"
                                            className="mx-auto max-h-48 rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImagePreview(null);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    imageUrl: '/placeholder-event.jpg'
                                                }));
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = '';
                                                }
                                            }}
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
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Titel
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                                    errors.title ? "border-red-500" : ""
                                }`}
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                            )}
                        </div>

                        {/* Beschreibung */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Beschreibung
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                                    errors.description ? "border-red-500" : ""
                                }`}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        {/* Datum und Zeit */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                                    Startdatum und -zeit
                                </label>
                                <input
                                    type="datetime-local"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                                        errors.date ? "border-red-500" : ""
                                    }`}
                                />
                                {errors.date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                                    Enddatum und -zeit
                                </label>
                                <input
                                    type="datetime-local"
                                    id="endDate"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
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
                                <label htmlFor="location.name" className="block text-sm font-medium text-gray-700">
                                    Veranstaltungsort
                                </label>
                                <input
                                    type="text"
                                    id="location.name"
                                    name="location.name"
                                    value={formData.location.name}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                                        errors["location.name"] ? "border-red-500" : ""
                                    }`}
                                />
                                {errors["location.name"] && (
                                    <p className="mt-1 text-sm text-red-600">{errors["location.name"]}</p>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="location.address.street" className="block text-sm font-medium text-gray-700">
                                        Straße
                                    </label>
                                    <input
                                        type="text"
                                        id="location.address.street"
                                        name="location.address.street"
                                        value={formData.location.address.street}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="location.address.city" className="block text-sm font-medium text-gray-700">
                                        Stadt *
                                    </label>
                                    <input
                                        type="text"
                                        id="location.address.city"
                                        name="location.address.city"
                                        value={formData.location.address.city}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="location.address.postalCode" className="block text-sm font-medium text-gray-700">
                                        Postleitzahl
                                    </label>
                                    <input
                                        type="text"
                                        id="location.address.postalCode"
                                        name="location.address.postalCode"
                                        value={formData.location.address.postalCode}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="location.address.country" className="block text-sm font-medium text-gray-700">
                                        Land
                                    </label>
                                    <input
                                        type="text"
                                        id="location.address.country"
                                        name="location.address.country"
                                        value={formData.location.address.country}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                            {isGeocoding && (
                                <p className="text-sm text-gray-500">Suche nach Koordinaten...</p>
                            )}
                            {errors.geocoding && (
                                <p className="text-sm text-red-600">{errors.geocoding}</p>
                            )}
                            {formData.location.coordinates.coordinates[0] !== 0 && (
                                <p className="text-sm text-green-600">
                                    Koordinaten gefunden: {formData.location.coordinates.coordinates[1].toFixed(6)}, {formData.location.coordinates.coordinates[0].toFixed(6)}
                                </p>
                            )}
                        </div>

                        {/* Kategorie und Teilnehmer */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                    Kategorie
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
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
                                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">
                                    Maximale Teilnehmerzahl (optional)
                                </label>
                                <input
                                    type="number"
                                    id="maxParticipants"
                                    name="maxParticipants"
                                    value={formData.maxParticipants === null ? "" : formData.maxParticipants}
                                    onChange={handleChange}
                                    min="1"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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

                        {errors.submit && (
                            <div className="rounded-md bg-red-50 p-4">
                                <p className="text-sm text-red-600">{errors.submit}</p>
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