"use client";

import { useEffect, useState } from "react";

export default function LocationAutocomplete({ value = "", onChange, onSelect, small }) {
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setQuery(value || "");
    }, [value]);

    useEffect(() => {
        if (query.trim().length <= 2) {
            setSuggestions([]);
            return;
        }

        const timeout = setTimeout(() => {
            setIsLoading(true);
            fetchLocations(query).finally(() => setIsLoading(false));
        }, 300);

        return () => clearTimeout(timeout);
    }, [query]);

    const fetchLocations = async (searchText) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                    searchText
                )}&format=json&addressdetails=1&limit=5&featuretype=city&countrycodes=in`
            );

            const data = await response.json();
            setSuggestions(data || []);
        } catch (error) {
            console.error("Location fetch error:", error);
            setSuggestions([]);
        }
    };

    const updateQuery = (nextValue) => {
        setQuery(nextValue);
        onChange?.(nextValue);
    };

    const handleSelect = (place) => {
        const label =
            place?.address?.city ||
            place?.address?.town ||
            place?.address?.county ||
            place?.address?.state ||
            (place?.display_name ? place.display_name.split(",")[0] : "");
        setQuery(label);
        setSuggestions([]);
        onChange?.(label);
        onSelect?.(place);
    };

    return (
        <div className={`relative ${small ? "max-w-md" : "w-full max-w-2xl"}`}>
            <label className="sr-only">City search</label>
            <input
                type="text"
                value={query}
                onChange={(e) => updateQuery(e.target.value)}
                placeholder="Search city or theater location"
                className={`w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 ${
                    small ? "text-sm" : "text-base"
                } shadow-sm`}
            />

            {(suggestions.length > 0 || isLoading) && (
                <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl ring-1 ring-slate-700">
                    {isLoading ? (
                        <div className="px-4 py-3 text-sm text-slate-400">Searching...</div>
                    ) : (
                        suggestions.map((place, index) => (
                            <button
                                key={place.place_id || index}
                                type="button"
                                onClick={() => handleSelect(place)}
                                className="w-full text-left px-4 py-3 text-sm text-slate-100 transition hover:bg-slate-900/80"
                            >
                                <span className="block font-medium text-white">
                                    {place?.address?.city || place?.address?.town || place?.address?.county || place?.address?.state || (place.display_name ? place.display_name.split(",")[0] : "")}
                                </span>
                                {/* <span className="text-xs text-slate-500">{place.type || "City"}</span> */}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
