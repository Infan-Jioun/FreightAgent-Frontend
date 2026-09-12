/**
 * Client-Side Geolocation & Reverse Geocoding Utility.
 * Resolves browser GPS coordinates to a formatted physical facility/city address.
 */
export async function detectCurrentAddress(): Promise<string> {
    if (typeof window === "undefined" || !navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
    }

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;

                    // 1. Try BigDataCloud Client Reverse Geocode (free, high-speed, no API key needed)
                    try {
                        const bdcRes = await fetch(
                            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                        );
                        if (bdcRes.ok) {
                            const data = await bdcRes.json();
                            const parts: string[] = [];

                            if (data.locality) parts.push(data.locality);
                            else if (data.city) parts.push(data.city);

                            if (data.principalSubdivision && data.principalSubdivision !== parts[0]) {
                                parts.push(data.principalSubdivision);
                            }

                            if (data.countryName) {
                                parts.push(data.countryName);
                            }

                            if (parts.length > 0) {
                                resolve(parts.join(", "));
                                return;
                            }
                        }
                    } catch {
                        // Fallback to OpenStreetMap Nominatim below
                    }

                    // 2. Fallback: OpenStreetMap Nominatim Reverse Geocoding
                    try {
                        const osmRes = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );
                        if (osmRes.ok) {
                            const osmData = await osmRes.json();
                            if (osmData.display_name) {
                                resolve(osmData.display_name);
                                return;
                            }
                        }
                    } catch {
                        // Fallback to coordinates
                    }

                    resolve(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                } catch (err: unknown) {
                    const message =
                        err instanceof Error ? err.message : "Failed to resolve coordinates to address";
                    reject(new Error(message));
                }
            },
            (error) => {
                let msg = "Unable to retrieve your current location";
                if (error.code === error.PERMISSION_DENIED) {
                    msg = "Location permission denied. Please allow location access in your browser settings.";
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    msg = "Location information is unavailable on your device.";
                } else if (error.code === error.TIMEOUT) {
                    msg = "Location request timed out. Please try again.";
                }
                reject(new Error(msg));
            },
            { timeout: 12000, enableHighAccuracy: true }
        );
    });
}
